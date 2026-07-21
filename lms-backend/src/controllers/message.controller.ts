import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { Role } from '../types/enums'
import { createNotification } from '../utils/notifications'
import { emitToUser } from '../lib/socket'

const sendSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
}).refine((data) => (data.content && data.content.trim().length > 0) || data.fileUrl, {
  message: 'Either message content or a file attachment is required',
})

/**
 * GET /api/messages/contacts
 * Returns the list of users this user is allowed to message.
 * Students → lecturers of enrolled courses
 * Lecturers → students enrolled in their courses
 * Admin → all active users
 */
export async function getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      const enrolments = await prisma.enrolment.findMany({
        where: { studentId: userId },
        include: { course: { include: { lecturer: { select: { id: true, name: true, email: true, role: true } } } } },
      })
      const seen = new Set<string>()
      const contacts = enrolments
          .map((e) => e.course.lecturer)
          .filter((l) => {
            if (seen.has(l.id)) return false
            seen.add(l.id)
            return true
          })
      res.json({ success: true, data: contacts })
      return
    }

    if (role === Role.LECTURER) {
      const courses = await prisma.course.findMany({
        where: { lecturerId: userId },
        include: {
          enrolments: {
            include: { student: { select: { id: true, name: true, email: true, role: true } } },
          },
        },
      })
      const seen = new Set<string>()
      const contacts = courses
          .flatMap((c) => c.enrolments.map((e) => e.student))
          .filter((s) => {
            if (seen.has(s.id)) return false
            seen.add(s.id)
            return true
          })
      res.json({ success: true, data: contacts })
      return
    }

    // ADMIN — all active users except themselves
    const users = await prisma.user.findMany({
      where: { id: { not: userId }, isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/messages/conversations
 * Returns a list of conversations: one entry per unique interlocutor,
 * with the latest message and unread count.
 */
export async function getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId } = req.user!

    // Fetch all messages involving this user
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    })

    // Group by the "other" user
    const map = new Map<string, {
      user: { id: string; name: string }
      lastMessage: { content: string; createdAt: Date; senderId: string; fileUrl?: string | null; fileName?: string | null }
      unreadCount: number
    }>()

    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.receiver : msg.sender
      if (!map.has(other.id)) {
        map.set(other.id, {
          user: other,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
          },
          unreadCount: 0,
        })
      }
      // Count unread messages (received by current user and not yet read)
      if (msg.receiverId === userId && !msg.readAt) {
        map.get(other.id)!.unreadCount += 1
      }
    }

    res.json({ success: true, data: Array.from(map.values()) })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/messages/:userId
 * Returns the full message thread between the current user and the given user.
 * Also marks all received messages in this thread as read.
 */
export async function getThread(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: currentUserId } = req.user!
    const { userId: otherId } = req.params

    // Verify the other user exists
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } })
    if (!other) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherId },
          { senderId: otherId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    })

    // Mark unread received messages as read
    const updateResult = await prisma.message.updateMany({
      where: {
        senderId: otherId,
        receiverId: currentUserId,
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    if (updateResult.count > 0) {
      emitToUser(otherId, 'messages_read', { userId: currentUserId })
    }

    res.json({ success: true, data: messages })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/messages
 * Send a new message.
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: senderId } = req.user!
    const body = sendSchema.parse(req.body)

    if (body.receiverId === senderId) {
      res.status(400).json({ success: false, message: 'Cannot send a message to yourself' })
      return
    }

    const receiver = await prisma.user.findUnique({ where: { id: body.receiverId }, select: { id: true } })
    if (!receiver) {
      res.status(404).json({ success: false, message: 'Recipient not found' })
      return
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: body.receiverId,
        content: body.content || '',
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        fileSize: body.fileSize,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    })

    const notificationBody = body.content
      ? (body.content.length > 100 ? body.content.slice(0, 100) + '…' : body.content)
      : `[Attachment] ${body.fileName || 'file'}`

    const rolePrefix = message.receiver.role.toLowerCase()
    await createNotification({
      userId: body.receiverId,
      type: 'NEW_MESSAGE',
      title: `New message from ${message.sender.name}`,
      body: notificationBody,
      link: `/${rolePrefix}/messages`,
    })

    res.status(201).json({ success: true, data: message })
    
    // Emit real-time WebSocket notifications
    emitToUser(body.receiverId, 'new_message', message)
    emitToUser(senderId, 'new_message', message)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/messages/upload
 * Accepts a file in multipart form, stores it, and returns attachment metadata
 */
export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' })
      return
    }

    const host = req.get('host') ?? 'localhost:3000'
    const protocol = req.protocol ?? 'http'
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`

    res.status(201).json({
      success: true,
      data: {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    })
  } catch (err) {
    next(err)
  }
}
