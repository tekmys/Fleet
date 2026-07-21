import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Role } from '../types/enums'
import { prisma } from '../lib/prisma'
import { hashPassword } from '../utils/password'

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
})

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, page = '1', limit = '20' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = role ? { role: role as Role } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ])

    res.json({ success: true, data: { users, total, page: parseInt(page), limit: parseInt(limit) } })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createUserSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already in use' })
      return
    }

    const hashed = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: { ...body, password: hashed },
      select: userSelect,
    })

    res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: userSelect,
    })

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = updateUserSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    if (body.email && body.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: body.email } })
      if (emailTaken) {
        res.status(409).json({ success: false, message: 'Email already in use' })
        return
      }
    }

    const data: Record<string, unknown> = { ...body }
    if (body.password) {
      data.password = await hashPassword(body.password)
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: userSelect,
    })

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })

    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
