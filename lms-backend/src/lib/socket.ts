import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from '../utils/jwt'

let io: Server | null = null

// Maps userId -> Set of socketIds
const userSockets = new Map<string, Set<string>>()

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    },
  })

  // Auth Middleware
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token
      if (!authHeader) {
        return next(new Error('Authentication error: Token missing'))
      }

      // Handle "Bearer <token>" format or raw token
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader
      const decoded = verifyAccessToken(token)
      
      socket.data = {
        userId: decoded.userId,
        role: decoded.role,
      }
      
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    if (!userId) return

    // Track active connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId)!.add(socket.id)

    // Broadcast updated presence to everyone
    broadcastPresence()

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userId)
        }
      }
      // Broadcast updated presence
      broadcastPresence()
    })

    // Typing Indicators
    socket.on('typing', ({ receiverId }: { receiverId: string }) => {
      emitToUser(receiverId, 'user_typing', { userId })
    })

    socket.on('stop_typing', ({ receiverId }: { receiverId: string }) => {
      emitToUser(receiverId, 'user_stop_typing', { userId })
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet')
  }
  return io
}

/**
 * Emits an event to all active socket connections belonging to a specific user.
 */
export function emitToUser(userId: string, event: string, data: any): void {
  const sockets = userSockets.get(userId)
  if (sockets && io) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data)
    }
  }
}

/**
 * Broadcasts the list of currently online user IDs to all connected clients.
 */
export function broadcastPresence(): void {
  if (!io) return
  const onlineUserIds = Array.from(userSockets.keys())
  io.emit('presence_update', { onlineUsers: onlineUserIds })
}
