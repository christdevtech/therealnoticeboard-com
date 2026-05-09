'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { SuggestionChips } from './SuggestionChips'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    // Add placeholder for assistant
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: errorData.error || 'Something went wrong. Please try again.',
          }
          return updated
        })
        setIsStreaming(false)
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullText += parsed.text
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: fullText }
                  return updated
                })
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again in a moment.",
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (process.env.NEXT_PUBLIC_CHAT_ENABLED === 'false') return null

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground
            rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200
            flex items-center justify-center group"
          aria-label="Open chat with Noti"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {/* Pulse indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <span className="w-2 h-2 bg-success-foreground rounded-full animate-pulse" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)]
          bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">N</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-foreground">Noti</h3>
                <p className="text-xs text-primary-foreground/70">Your property assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsOpen(false); setMessages([]) }} className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-primary">N</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Hi! I&apos;m Noty 👋</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your real estate assistant. How can I help?
                </p>
                <SuggestionChips onSelect={sendMessage} />
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties, sellers..."
                disabled={isStreaming}
                className="flex-1 px-3 py-2.5 bg-secondary text-foreground rounded-xl border border-border
                  focus:outline-none focus:ring-2 focus:ring-primary text-sm placeholder:text-muted-foreground
                  disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover
                  disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
