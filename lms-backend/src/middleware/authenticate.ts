import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.userId, role: payload.role }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
