import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ResourceType, Role } from '../types/enums'
import { prisma } from '../lib/prisma'

// ─── helpers ─────────────────────────────────────────────────────────────────

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

async function getModuleWithAccess(
  moduleId: string,
  userId: string,
  role: Role,
  res: Response,
): Promise<{ moduleId: string; courseId: string } | null> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!mod) {
    res.status(404).json({ success: false, message: 'Module not found' })
    return null
  }
  const ok = await assertCourseAccess(mod.courseId, userId, role, res)
  if (!ok) return null
  return { moduleId: mod.id, courseId: mod.courseId }
}

// ─── Module handlers ──────────────────────────────────────────────────────────

const createModuleSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().min(0).optional(),
})

const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  order: z.number().int().min(0).optional(),
})

export async function listModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        resources: {
          orderBy: { createdAt: 'asc' },
          include: {
            completions: {
              where: { studentId: userId },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    const mappedModules = modules.map((mod) => ({
      ...mod,
      resources: mod.resources.map((res) => {
        const { completions, ...rest } = res as any
        return {
          ...rest,
          isCompleted: completions && completions.length > 0,
        }
      }),
    }))

    res.json({ success: true, data: mappedModules })
  } catch (err) {
    next(err)
  }
}

export async function createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const { id: courseId } = req.params
    const body = createModuleSchema.parse(req.body)

    // Students cannot create modules
    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const ok = await assertCourseAccess(courseId, userId, role, res)
    if (!ok) return

    // Auto-calculate order if not provided
    let order = body.order
    if (order === undefined) {
      const last = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      })
      order = (last?.order ?? -1) + 1
    }

    const mod = await prisma.module.create({
      data: { title: body.title, order, courseId },
      include: { resources: true },
    })

    res.status(201).json({ success: true, data: mod })
  } catch (err) {
    next(err)
  }
}

export async function updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const body = updateModuleSchema.parse(req.body)

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getModuleWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const mod = await prisma.module.update({
      where: { id: req.params.id },
      data: body,
      include: { resources: true },
    })

    res.json({ success: true, data: mod })
  } catch (err) {
    next(err)
  }
}

export async function deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getModuleWithAccess(req.params.id, userId, role, res)
    if (!access) return

    await prisma.module.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

// ─── Resource handlers ────────────────────────────────────────────────────────

const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.nativeEnum(ResourceType),
  url: z.string().url(),
  textContent: z.string().optional(),
})

export async function createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!
    const body = createResourceSchema.parse(req.body)

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const access = await getModuleWithAccess(req.params.id, userId, role, res)
    if (!access) return

    const resource = await prisma.resource.create({
      data: { ...body, moduleId: req.params.id },
    })

    res.status(201).json({ success: true, data: resource })
  } catch (err) {
    next(err)
  }
}

export async function deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, role } = req.user!

    if (role === Role.STUDENT) {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }

    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } })
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' })
      return
    }

    const access = await getModuleWithAccess(resource.moduleId, userId, role, res)
    if (!access) return

    await prisma.resource.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
