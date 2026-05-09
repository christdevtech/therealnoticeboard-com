'use client'

import React from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState(0)

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index)
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starIndex = i + 1
        const isFilled = starIndex <= (hoverRating || rating)
        const isHalfFilled = !isFilled && starIndex - 0.5 <= rating && !hoverRating

        return (
          <button
            key={i}
            type="button"
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-amber-400'
                  : isHalfFilled
                    ? 'text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
              }`}
              fill={isFilled || isHalfFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
