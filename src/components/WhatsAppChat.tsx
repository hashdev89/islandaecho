'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MessageCircle, X, Send, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_name: string
  sender_role: 'admin' | 'staff' | 'customer'
  content: string
  message_type: 'text' | 'system' | 'whatsapp_link'
  read_at: string | null
  created_at: string
}

interface Conversation {
  id: string
  customer_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  assigned_to: string | null
  status: 'active' | 'closed' | 'archived'
  last_message_at: string
  created_at: string
}

export default function WhatsAppChat() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Listen for chat open event from mobile nav
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
    }
    window.addEventListener('openChat', handleOpenChat)
    return () => {
      window.removeEventListener('openChat', handleOpenChat)
    }
  }, [])

  // Notify mobile nav of chat state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatStateChange', { detail: { isOpen } }))
  }, [isOpen])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [whatsappPhone, setWhatsappPhone] = useState('94741415812') // Default

  // Load WhatsApp phone from settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const result = await response.json()
        if (result.success && result.data?.whatsappPhone) {
          setWhatsappPhone(result.data.whatsappPhone)
        }
      } catch (error) {
        console.error('Error loading WhatsApp phone:', error)
      }
    }
    loadSettings()
  }, [])

  // Load or create conversation
  const loadOrCreateConversation = async () => {
    try {
      setLoading(true)
      setError(null)

      // If user is logged in, try to find existing conversation
      if (user?.id) {
        const response = await fetch(`/api/chat/conversations?status=active`)
        const result = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          const userConversation = result.data.find(
            (conv: Conversation) => conv.customer_id === user.id
          )
          if (userConversation) {
            setConversation(userConversation)
            await loadMessages(userConversation.id)
            setLoading(false)
            return
          }
        }
      }

      // Create new conversation
      // For guest users, generate a unique identifier
      const customerName = user?.name || `Guest_${Date.now()}`
      const customerEmail = user?.email || `guest_${Date.now()}@temp.com`
      const customerPhone = user?.phone || null

      console.log('Creating conversation for:', { customerName, customerEmail, customerPhone })

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user?.id || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Conversation creation result:', result)

      if (result.success && result.data) {
        setConversation(result.data)
        console.log('Conversation created successfully:', result.data.id)
        // Load messages for the new conversation
        await loadMessages(result.data.id)
      } else {
        const errorMsg = result.error || 'Failed to create conversation'
        setError(errorMsg)
        console.error('Failed to create conversation:', errorMsg)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      setError('Failed to load chat. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load messages
  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}`)
      const result = await response.json()

      if (result.success) {
        const loadedMessages = result.data || []
        // Sort by created_at to ensure correct order
        loadedMessages.sort((a: Message, b: Message) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return

    try {
      setSending(true)
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          sender_id: user?.id || null,
          sender_name: user?.name || 'Guest',
          sender_role: user?.role || 'customer',
          content: newMessage.trim(),
          message_type: 'text'
        })
      })

      const result = await response.json()

      if (result.success) {
        setNewMessage('')
        // Reload messages to get the latest including the one just sent and welcome message
        await loadMessages(conversation.id)
        
        // If name was updated, reload conversation to get updated name
        if (result.name_updated && conversation) {
          const convResponse = await fetch(`/api/chat/conversations?status=active`)
          const convResult = await convResponse.json()
          if (convResult.success && convResult.data) {
            const updatedConv = convResult.data.find((c: Conversation) => c.id === conversation.id)
            if (updatedConv) {
              setConversation(updatedConv)
            }
          }
        }
        
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        alert('Failed to send message: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Open WhatsApp
  const openWhatsApp = () => {
    const message = encodeURIComponent('Hello! I would like to know more about your tours.')
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  // Set up real-time subscription and polling
  useEffect(() => {
    if (!conversation) return

    // Try Supabase realtime first
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

    let channel: any = null
    let pollInterval: NodeJS.Timeout | null = null

    // Always use polling for reliable real-time updates (works with both Supabase and file storage)
    // Poll every 2 seconds to reduce flickering while still being responsive
    pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?conversation_id=${conversation.id}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const currentMessages = result.data
          // Sort by created_at
          currentMessages.sort((a: Message, b: Message) => {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          })
          
          // Only update if there are actual changes to prevent flickering
          setMessages((prev) => {
            // Check if message count changed
            if (currentMessages.length !== prev.length) {
              return currentMessages
            }
            // Check if any message IDs are different (new messages)
            const prevIds = new Set(prev.map(m => m.id))
            const hasNewMessages = currentMessages.some((m: Message) => !prevIds.has(m.id))
            if (hasNewMessages) {
              return currentMessages
            }
            // Check if message IDs are in different order (shouldn't happen, but just in case)
            const prevIdsStr = prev.map(m => m.id).sort().join(',')
            const currentIdsStr = currentMessages.map((m: Message) => m.id).sort().join(',')
            if (prevIdsStr !== currentIdsStr) {
              return currentMessages
            }
            // No changes detected - return previous state to prevent re-render
            return prev
          })
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
      }, 2000)

    // Also try Supabase realtime if configured (as backup/additional sync)
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel(`conversation:${conversation.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversation.id}`
            },
            (payload) => {
              const newMessage = payload.new as Message
              setMessages((prev) => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMessage.id)) return prev
                // Add new message and sort by created_at
                const updated = [...prev, newMessage]
                updated.sort((a, b) => {
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                })
                return updated
              })
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Error setting up Supabase realtime:', error)
        // Continue with polling only
      }
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [conversation])

  useEffect(() => {
    if (isOpen) {
      if (!conversation && !loading) {
        // Always load or create conversation when chat opens
        loadOrCreateConversation()
      } else if (conversation) {
        // If conversation exists, refresh messages
        loadMessages(conversation.id)
      }
    }
  }, [isOpen, conversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages.length])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Desktop Chat Button and Popup Container - Hidden on mobile */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group relative"
          aria-label="Open chat"
          style={{
            width: '56px',
            height: '56px',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)'
          }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
          
          {/* Pulse animation */}
          {!isOpen && (
            <span 
              className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"
              style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
            />
          )}
        </button>

        {/* Desktop Chat Popup */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col"
            style={{ height: '600px', maxHeight: '80vh' }}>
            {/* Header */}
            <div className="bg-[#25D366] p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2">
                  <Image
                    src="/logoisle&echo.png"
                    alt="ISLE & ECHO Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">ISLE & ECHO</h3>
                  <p className="text-sm opacity-90">
                    {conversation ? 'Live Chat' : 'We\'re here to help!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Setting up your chat...</p>
                  <p className="text-xs text-gray-400 mt-2">Please wait...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={loadOrCreateConversation}
                    className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {conversation && messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-700 mb-2 text-sm font-medium">
                        Hi! 👋 How can we help you plan your perfect Sri Lanka adventure?
                      </p>
                      <p className="text-gray-500 text-xs">
                        Start the conversation! Our team will respond as soon as possible.
                      </p>
                    </div>
                  ) : null}
                  {messages.length > 0 && messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.sender_role === 'customer'
                            ? 'bg-[#25D366] text-white'
                            : message.message_type === 'whatsapp_link'
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {message.message_type === 'whatsapp_link' ? (
                          <a
                            href={message.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-green-700 hover:text-green-800"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Continue on WhatsApp</span>
                          </a>
                        ) : (
                          <>
                            <p className="text-xs font-semibold mb-1 opacity-90">
                              {message.sender_role === 'customer' ? 'You' : message.sender_name}
                              {message.sender_role !== 'customer' && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({message.sender_role === 'admin' ? 'Admin' : 'Staff'})
                                </span>
                              )}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatTime(message.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input - Always show, but disable if no conversation yet */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && conversation) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={conversation ? "Type a message..." : "Setting up chat..."}
                  className="flex-1 px-4 py-2 border border-gray-300"
                  disabled={!conversation || sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!conversation || !newMessage.trim() || sending}
                  className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={openWhatsApp}
                  className="text-xs text-gray-500 hover:text-[#25D366] flex items-center gap-1"
                  title="Continue conversation on WhatsApp"
                >
                  <Phone className="w-3 h-3" />
                  <span>Continue on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Full-Screen Chat Overlay */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Mobile Header with Close Button */}
          <div className="bg-[#25D366] p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2">
                <Image
                  src="/logoisle&echo.png"
                  alt="ISLE & ECHO Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base">ISLE & ECHO</h3>
                <p className="text-xs opacity-90">
                  {conversation ? 'Live Chat' : 'We\'re here to help!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <p>Setting up your chat...</p>
                <p className="text-xs text-gray-400 mt-2">Please wait...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={loadOrCreateConversation}
                  className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {conversation && messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-700 mb-2 text-sm font-medium">
                      Hi! 👋 How can we help you plan your perfect Sri Lanka adventure?
                    </p>
                    <p className="text-gray-500 text-xs">
                      Start the conversation! Our team will respond as soon as possible.
                    </p>
                  </div>
                ) : null}
                {messages.length > 0 && messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.sender_role === 'customer'
                          ? 'bg-[#25D366] text-white'
                          : message.message_type === 'whatsapp_link'
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {message.message_type === 'whatsapp_link' ? (
                        <a
                          href={message.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-700 hover:text-green-800"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Continue on WhatsApp</span>
                        </a>
                      ) : (
                        <>
                          <p className="text-xs font-semibold mb-1 opacity-90">
                            {message.sender_role === 'customer' ? 'You' : message.sender_name}
                            {message.sender_role !== 'customer' && (
                              <span className="ml-1 text-xs opacity-75">
                                ({message.sender_role === 'admin' ? 'Admin' : 'Staff'})
                              </span>
                            )}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatTime(message.created_at)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Mobile Message Input */}
          <div className="border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && conversation) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={conversation ? "Type a message..." : "Setting up chat..."}
                className="flex-1 px-3 py-2 border border-gray-300"
                style={{ fontSize: '16px' }}
                disabled={!conversation || sending}
              />
              <button
                onClick={sendMessage}
                disabled={!conversation || !newMessage.trim() || sending}
                className="px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={openWhatsApp}
                className="text-xs text-gray-500 hover:text-[#25D366] flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Continue on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
