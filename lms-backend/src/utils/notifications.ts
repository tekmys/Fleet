import { NotificationType } from '../types/enums'
import { prisma } from '../lib/prisma'

interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}

export async function createNotification(payload: NotificationPayload): Promise<void> {
  await prisma.notification.create({ data: payload })
}

export async function createManyNotifications(payloads: NotificationPayload[]): Promise<void> {
  if (payloads.length === 0) return
  await prisma.notification.createMany({ data: payloads })
}
