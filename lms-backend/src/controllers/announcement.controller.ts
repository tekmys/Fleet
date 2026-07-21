import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'
import { createManyNotifications } from '../utils/notifications'

async function assertCourseAccess(
  courseId: string,
  userId: string,
  role: Role,
  res: Response,
): Promise<boolean> {
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' })
    return false
  }
  if (role === Role.LECTURER && course.lecturerId !== userId) {
    res.status(403).json({ success: false, message: 'Forbidden' })
    return false
  }
  if (role === Role.STUDENT) {
    const enrolment = await prisma.enrolment.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
    })
    if (!enrolment) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return false
    }
  }
  return true
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
})

export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const announcements = await prisma.announcement.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true } } },
    })

    res.json({ success: true, data: announcements })
  } catch (err) {
    next(err)
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params
    const body = createSchema.parse(req.body)

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const announcement = await prisma.announcement.create({
      data: { ...body, courseId, authorId: userId },
      include: {
        author: { select: { id: true, name: true } },
        course: { select: { title: true } },
      },
    })

    // Notify all enrolled students
    const enrolments = await prisma.enrolment.findMany({
      where: { courseId },
      select: { studentId: true },
    })

    await createManyNotifications(
      enrolments.map((e) => ({
        userId: e.studentId,
        type: 'NEW_ANNOUNCEMENT' as const,
        title: `New announcement: ${body.title}`,
        body: `${announcement.course.title} — ${body.content.slice(0, 100)}${body.content.length > 100 ? '…' : ''}`,
        link: `/student/courses/${courseId}`,
      })),
    )

    res.status(201).json({ success: true, data: announcement })
  } catch (err) {
    next(err)
  }
}

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } })
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found' })
      return
    }

    const ok = await assertCourseAccess(announcement.courseId, userId, role, res)
    if (!ok) return

    const body = updateSchema.parse(req.body)
    const updated = await prisma.announcement.update({
      where: { id: req.params.id },
      data: body,
      include: { author: { select: { id: true, name: true } } },
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } })
    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found' })
      return
    }

    const ok = await assertCourseAccess(announcement.courseId, userId, role, res)
    if (!ok) return

    await prisma.announcement.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
