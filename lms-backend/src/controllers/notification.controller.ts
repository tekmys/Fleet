import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

/**
 * GET /api/notifications
 * Returns the 30 most recent notifications for the current user, unread first.
 */
export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId } = req.user!

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    })

    const unreadCount = notifications.filter((n) => !n.readAt).length

    res.json({ success: true, data: { notifications, unreadCount } })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId } = req.user!

    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notification || notification.userId !== userId) {
      res.status(404).json({ success: false, message: 'Notification not found' })
      return
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { readAt: notification.readAt ?? new Date() },
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications for the current user as read.
 */
export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId } = req.user!

    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })

    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
