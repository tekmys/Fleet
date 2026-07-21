import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { Role } from '../types/enums'
import { verifyPassword, hashPassword } from '../utils/password'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'LECTURER']),
})

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
      return
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' })
      return
    }

    const accessToken = generateAccessToken(user.id, user.role as Role)
    const refreshToken = generateRefreshToken(user.id)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    const { password: _, ...safeUser } = user
    res.json({ success: true, data: { user: safeUser, accessToken, refreshToken } })
  } catch (err) {
    next(err)
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.status(403).json({ success: false, message: 'Public registration is disabled. Please contact an administrator to provision your account.' })
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body)
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body)

    let payload: { userId: string }
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      res.status(401).json({ success: false, message: 'Invalid refresh token' })
      return
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Refresh token expired or revoked' })
      return
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found' })
      return
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const newAccessToken = generateAccessToken(user.id, user.role as Role)
    const newRefreshToken = generateRefreshToken(user.id)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    })

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
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
