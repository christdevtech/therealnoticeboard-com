'use client'

import React from 'react'

interface SuggestionChipsProps {
  onSelect: (text: string) => void
  className?: string
}

const suggestions = [
  { label: '🏠 Search properties', text: 'Show me available properties' },
  { label: '⭐ Trusted sellers', text: 'Find trusted sellers with high ratings' },
  { label: '❓ How to list', text: 'How do I list a property on The Notice Board?' },
  { label: '🔒 Trust scores', text: 'How does the trust score system work?' },
  { label: '📋 Verify account', text: 'How do I verify my account?' },
  { label: '💬 Leave a review', text: 'How do I leave a review for a seller?' },
]

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelect, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(s.text)}
          className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full
            hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/20"
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
