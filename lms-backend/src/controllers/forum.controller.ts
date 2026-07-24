import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function createDiscussionTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content, courseId } = req.body
    const authorId = req.user!.id

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      res.status(404).json({ success: false, error: 'Course not found' })
      return
    }

    const topic = await prisma.discussionTopic.create({
      data: {
        title,
        content,
        courseId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    })

    res.status(201).json({ success: true, data: topic })
  } catch (err) {
    next(err)
  }
}

export async function getDiscussionTopicsByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId } = req.params

    const topics = await prisma.discussionTopic.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: {
          select: { posts: true },
        },
      },
    })

    res.json({ success: true, data: topics })
  } catch (err) {
    next(err)
  }
}

export async function getDiscussionTopicDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params

    const topic = await prisma.discussionTopic.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        posts: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
        },
      },
    })

    if (!topic) {
      res.status(404).json({ success: false, error: 'Discussion thread not found' })
      return
    }

    res.json({ success: true, data: topic })
  } catch (err) {
    next(err)
  }
}

export async function createDiscussionPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId, content } = req.body
    const authorId = req.user!.id

    // Verify topic exists
    const topic = await prisma.discussionTopic.findUnique({ where: { id: topicId } })
    if (!topic) {
      res.status(404).json({ success: false, error: 'Discussion thread not found' })
      return
    }

    const post = await prisma.discussionPost.create({
      data: {
        content,
        topicId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    })

    // Optionally update topic's updatedAt timestamp to bubble it up
    await prisma.discussionTopic.update({
      where: { id: topicId },
      data: { updatedAt: new Date() },
    })

    res.status(201).json({ success: true, data: post })
  } catch (err) {
    next(err)
  }
}
