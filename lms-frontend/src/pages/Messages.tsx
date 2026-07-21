import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuthStore } from '../store/authStore'
import { useContacts, useConversations, useThread, useSendMessage, useUploadMessageFile } from '../hooks/useMessages'
import { useToast } from '../components/ui/Toast'
import { useSocket } from '../components/shared/SocketProvider'
import type { Contact } from '../services/message.service'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClass} rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-semibold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function Messages() {
  const currentUser = useAuthStore((s) => s.user)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // Pending File Attachments State
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadedAttachment, setUploadedAttachment] = useState<{ fileUrl: string; fileName: string; fileSize: number } | null>(null)
  const [activeImageLightbox, setActiveImageLightbox] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Typing indicators state & refs
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  const toast = useToast()
  const queryClient = useQueryClient()
  const { socket, onlineUsers } = useSocket()

  const { data: contacts = [] } = useContacts()
  const { data: conversations = [] } = useConversations()
  const { data: thread = [] } = useThread(selectedUserId ?? '')
  const sendMessage = useSendMessage()
  const uploadMutation = useUploadMessageFile()

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg: any) => {
      const otherUser = msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId
      queryClient.invalidateQueries({ queryKey: ['thread', otherUser] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    const handleMessagesRead = (data: { userId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['thread', data.userId] })
    }

    const handleUserTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        if (prev.includes(data.userId)) return prev
        return [...prev, data.userId]
      })
    }

    const handleUserStopTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
    }

    socket.on('new_message', handleNewMessage)
    socket.on('messages_read', handleMessagesRead)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stop_typing', handleUserStopTyping)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('messages_read', handleMessagesRead)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stop_typing', handleUserStopTyping)
    }
  }, [socket, currentUser?.id, queryClient])

  // Reset typing flags when chat selection changes
  useEffect(() => {
    if (isTypingRef.current && socket && selectedUserId) {
      isTypingRef.current = false
      socket.emit('stop_typing', { receiverId: selectedUserId })
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [selectedUserId, socket])

  // Emit read event and scroll to bottom when thread loads
  useEffect(() => {
    if (selectedUserId && socket) {
      socket.emit('read_messages', { senderId: selectedUserId })
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, selectedUserId, socket])

  // Aggregate active lists with unread metrics
  const contactMap = new Map<string, Contact>()
  contacts.forEach((c) => contactMap.set(c.id, c))

  const activeIds = new Set(conversations.map((c) => c.user.id))
  const displayList: Array<{
    id: string
    name: string
    isOnline: boolean
    preview?: string
    time?: string
    unread: number
  }> = []

  conversations.forEach((conv) => {
    displayList.push({
      id: conv.user.id,
      name: conv.user.name,
      isOnline: onlineUsers.includes(conv.user.id),
      preview: conv.lastMessage?.content || (conv.lastMessage?.fileUrl ? 'Shared an attachment' : ''),
      time: conv.lastMessage?.createdAt,
      unread: conv.unreadCount,
    })
  })

  contacts.forEach((contact) => {
    if (!activeIds.has(contact.id)) {
      displayList.push({
        id: contact.id,
        name: contact.name,
        isOnline: onlineUsers.includes(contact.id),
        unread: 0,
      })
    }
  })

  const filtered = displayList.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedEntry = displayList.find((e) => e.id === selectedUserId)

  function handleInputChange(val: string) {
    setNewMessage(val)
    if (!socket || !selectedUserId) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', { receiverId: selectedUserId })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        socket.emit('stop_typing', { receiverId: selectedUserId })
      }
    }, 2500)
  }

  // Handle File Input Selection
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Enforce 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast('File size must not exceed 10MB', 'error')
      return
    }

    setPendingFile(file)
    try {
      const res = await uploadMutation.mutateAsync(file)
      setUploadedAttachment(res)
    } catch (err) {
      setPendingFile(null)
      toast('Failed to upload file', 'error')
    }
  }

  function handleSend() {
    const content = newMessage.trim()
    if (!content && !uploadedAttachment) return
    if (!selectedUserId) return

    // Immediately stop typing indicator on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (isTypingRef.current && socket && selectedUserId) {
      isTypingRef.current = false
      socket.emit('stop_typing', { receiverId: selectedUserId })
    }

    const payload = {
      receiverId: selectedUserId,
      content: content || '',
      ...(uploadedAttachment ? {
        fileUrl: uploadedAttachment.fileUrl,
        fileName: uploadedAttachment.fileName,
        fileSize: uploadedAttachment.fileSize,
      } : {}),
    }

    sendMessage.mutate(
      payload,
      {
        onSuccess: () => {
          setNewMessage('')
          setPendingFile(null)
          setUploadedAttachment(null)
          if (fileInputRef.current) fileInputRef.current.value = ''
        },
        onError: () => toast('Failed to send message', 'error'),
      },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <DashboardShell title="Messages">
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Left panel — conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No contacts found</p>
            )}
            {filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedUserId(entry.id)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer',
                  selectedUserId === entry.id ? 'bg-indigo-50/40 dark:bg-slate-800 border-r-2 border-indigo-600 dark:border-indigo-400' : '',
                ].join(' ')}
              >
                <div className="relative">
                  <InitialsAvatar name={entry.name} size="sm" />
                  {entry.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-green-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{entry.name}</p>
                    {entry.time && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">{formatTime(entry.time)}</span>
                    )}
                  </div>
                  {entry.preview && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{entry.preview}</p>
                  )}
                </div>
                {entry.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    {entry.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — thread */}
        {selectedUserId && selectedEntry ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 transition-colors">
              <div className="relative">
                <InitialsAvatar name={selectedEntry.name} />
                {selectedEntry.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 bg-green-500" />
                )}
              </div>
              
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block text-sm">{selectedEntry.name}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 block -mt-0.5 font-medium">
                  {selectedEntry.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-gray-50/50 dark:bg-slate-900/40">
              {thread.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-8">
                  No messages yet. Say hello!
                </p>
              )}
              {thread.map((msg) => {
                const isMine = msg.senderId === currentUser?.id
                const isImage = msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)

                return (
                  <div key={msg.id} className={['flex', isMine ? 'justify-end' : 'justify-start'].join(' ')}>
                    <div className={['max-w-[65%]', isMine ? 'items-end' : 'items-start', 'flex flex-col gap-1'].join(' ')}>
                      
                      {/* Image Preview Bubble */}
                      {msg.fileUrl && isImage && (
                        <div 
                          className="mb-1.5 max-w-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-750 bg-white dark:bg-slate-800 shadow-sm hover:opacity-90 transition-opacity cursor-zoom-in group relative"
                          onClick={() => setActiveImageLightbox(msg.fileUrl!)}
                        >
                          <img src={msg.fileUrl} alt={msg.fileName || 'Image attachment'} className="w-full h-auto object-cover max-h-60" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            🔍 Zoom Image
                          </div>
                        </div>
                      )}

                      {/* File Card Attachment */}
                      {msg.fileUrl && !isImage && (
                        <div 
                          className={[
                            'mb-1.5 p-3 rounded-2xl border flex items-center gap-3 max-w-sm shadow-sm transition-all',
                            isMine 
                              ? 'bg-indigo-700/90 border-indigo-600/35 text-white rounded-br-sm' 
                              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-bl-sm'
                          ].join(' ')}
                        >
                          <div className={['w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-bold', isMine ? 'bg-indigo-850' : 'bg-gray-100 dark:bg-slate-700'].join(' ')}>
                            📄
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate leading-tight">{msg.fileName}</p>
                            <p className={['text-[10px] mt-0.5 font-medium', isMine ? 'text-indigo-200' : 'text-gray-400 dark:text-slate-400'].join(' ')}>
                              {msg.fileSize ? `${Math.round(msg.fileSize / 1024)} KB` : 'file'}
                            </p>
                          </div>
                          <a 
                            href={msg.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            download 
                            className={[
                              'p-2 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer',
                              isMine ? 'hover:bg-indigo-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                            ].join(' ')}
                            title="Download File"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {/* Text Bubble */}
                      {(msg.content && msg.content.trim().length > 0) && (
                        <div
                          className={[
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed border',
                            isMine
                              ? 'bg-indigo-600 border-indigo-650 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-bl-sm',
                          ].join(' ')}
                        >
                          {msg.content}
                        </div>
                      )}
                      
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 px-1 mt-0.5 font-semibold">
                        {formatTime(msg.createdAt)}
                        {isMine && msg.readAt && (
                          <span className="ml-1 text-indigo-400 dark:text-indigo-300">· Read</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
              
              {/* Real-time Typing Bubble */}
              {selectedUserId && typingUsers.includes(selectedUserId) && (
                <div className="flex justify-start">
                  <div className="flex flex-col gap-1 items-start">
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-bl-sm flex items-center gap-1.5 border border-transparent dark:border-slate-700">
                      <span className="italic">{selectedEntry.name} is typing</span>
                      <span className="flex gap-1 mt-1 ml-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>

            {/* Pending File Attachment Preview Bar */}
            {pendingFile && (
              <div className="mx-6 mt-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg flex-shrink-0 font-bold">
                    {pendingFile.type.startsWith('image/') ? '🖼️' : '📄'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{pendingFile.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 font-semibold mt-0.5">
                      {uploadMutation.isPending ? 'Uploading file to server...' : `${Math.round(pendingFile.size / 1024)} KB`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadMutation.isPending && (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  )}
                  <button
                    onClick={() => {
                      setPendingFile(null)
                      setUploadedAttachment(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Cancel attachment"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Compose form area */}
            <div className="px-6 py-4 border-t border-gray-150 dark:border-slate-800 flex items-end gap-3 bg-white dark:bg-slate-900 transition-colors">
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              {/* Paperclip Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending || sendMessage.isPending}
                className="p-2.5 rounded-xl border border-gray-250 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                title="Attach file or image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>

              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                className="flex-1 resize-none px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32 overflow-y-auto"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !uploadedAttachment) || sendMessage.isPending || uploadMutation.isPending}
                className="flex-shrink-0 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-750 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm bg-gray-50/50 dark:bg-slate-900/40">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {/* Full Screen Image Lightbox Overlay */}
      {activeImageLightbox && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setActiveImageLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
              onClick={() => setActiveImageLightbox(null)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={activeImageLightbox} alt="Full screen preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
