import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../../store/authStore'
import { API_BASE_URL } from '../../services/api'

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken, user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  
  // Track accessToken inside a ref to recognize changes
  const tokenRef = useRef(accessToken)

  useEffect(() => {
    tokenRef.current = accessToken
    
    // Only connect if the user is authenticated
    if (!accessToken || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      setOnlineUsers([])
      return
    }

    const socketUrl = API_BASE_URL.startsWith('http')
      ? API_BASE_URL.replace(/\/api$/, '')
      : `${window.location.origin}${API_BASE_URL}`.replace(/\/api$/, '')

    // Connect to Socket.io server
    const newSocket = io(socketUrl, {
      auth: {
        token: `Bearer ${accessToken}`,
      },
      autoConnect: true,
      reconnection: true,
    })

    setSocket(newSocket)

    // Listen for presence updates
    newSocket.on('presence_update', (data: { onlineUsers: string[] }) => {
      // Exclude current user from online lists if appropriate, or keep for overall check
      setOnlineUsers(data.onlineUsers)
    })

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error, retrying with fresh credentials:', err.message)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [accessToken, user?.id])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}
