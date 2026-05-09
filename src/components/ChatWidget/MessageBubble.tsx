'use client'

import React from 'react'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user'

  // Simple markdown-like rendering: bold, links, lists
  const renderContent = (text: string) => {
    // Split by newlines, process each line
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Links: [text](/url)
      processed = processed.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="underline text-primary hover:text-primary-hover" target="_blank" rel="noopener">$1</a>',
      )
      // List items
      if (processed.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
        )
      }
      if (processed.trim() === '') return <br key={i} />
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />
    })
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
          <span className="text-xs font-bold text-primary">N</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        }`}
      >
        {renderContent(content)}
        {isStreaming && (
          <span className="inline-flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}
