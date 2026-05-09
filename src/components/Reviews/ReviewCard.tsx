'use client'

import React from 'react'
import { StarRating } from './StarRating'
import { formatDateTime } from '@/utilities/formatDateTime'
import { User as UserIcon, MessageCircle } from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: string
    title: string
    comment: string
    rating: number
    aspects?: {
      communication?: number | null
      accuracy?: number | null
      value?: number | null
    }
    reviewer?: {
      id: string
      name?: string | null
    } | string
    vendorResponse?: string | null
    vendorResponseDate?: string | null
    createdAt: string
  }
  showVendorResponse?: boolean
  className?: string
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showVendorResponse = true,
  className = '',
}) => {
  const reviewerName =
    review.reviewer && typeof review.reviewer === 'object'
      ? review.reviewer.name || 'Anonymous'
      : 'Anonymous'

  return (
    <div
      className={`bg-card border border-card rounded-lg p-5 shadow-theme-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{reviewerName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(review.createdAt)}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Title */}
      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>

      {/* Comment */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>

      {/* Aspect ratings */}
      {review.aspects && (review.aspects.communication || review.aspects.accuracy || review.aspects.value) && (
        <div className="flex flex-wrap gap-4 mb-3 text-xs">
          {review.aspects.communication && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Communication:</span>
              <StarRating rating={review.aspects.communication} size="sm" />
            </div>
          )}
          {review.aspects.accuracy && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Accuracy:</span>
              <StarRating rating={review.aspects.accuracy} size="sm" />
            </div>
          )}
          {review.aspects.value && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Value:</span>
              <StarRating rating={review.aspects.value} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Vendor response */}
      {showVendorResponse && review.vendorResponse && (
        <div className="mt-4 pl-4 border-l-2 border-primary/30 bg-secondary/50 rounded-r-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Seller Response</span>
            {review.vendorResponseDate && (
              <span className="text-xs text-muted-foreground">
                · {formatDateTime(review.vendorResponseDate)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{review.vendorResponse}</p>
        </div>
      )}
    </div>
  )
}
