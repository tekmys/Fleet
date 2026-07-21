import type { Role } from './enums'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: Role
      }
    }
  }
}
