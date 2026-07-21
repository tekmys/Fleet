import jwt from 'jsonwebtoken'
import type { Role } from '../types/enums'

interface AccessTokenPayload {
  userId: string
  role: Role
}

interface RefreshTokenPayload {
  userId: string
}

export function generateAccessToken(userId: string, role: Role): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')

  return jwt.sign({ userId, role } satisfies AccessTokenPayload, secret, {
    expiresIn: '15m',
  })
}

export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined')

  return jwt.sign({ userId } satisfies RefreshTokenPayload, secret, {
    expiresIn: '7d',
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')

  return jwt.verify(token, secret) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined')

  return jwt.verify(token, secret) as RefreshTokenPayload
}
