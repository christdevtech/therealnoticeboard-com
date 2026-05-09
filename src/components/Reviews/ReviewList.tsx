'use client'

import React, { useEffect, useState } from 'react'
import { ReviewCard } from './ReviewCard'
import { StarRating } from './StarRating'

interface ReviewData {
  id: string
  title: string
  comment: string
  rating: number
  aspects?: {
    communication?: number | null
    accuracy?: number | null
    value?: number | null
  }
  reviewer?: { id: string; name?: string | null } | string
  vendorResponse?: string | null
  vendorResponseDate?: string | null
  createdAt: string
}

interface ReviewListProps {
  vendorId?: string
  propertyId?: string
  className?: string
}

export const ReviewList: React.FC<ReviewListProps> = ({
  vendorId,
  propertyId,
  className = '',
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDocs, setTotalDocs] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [aspectAverages, setAspectAverages] = useState({ communication: 0, accuracy: 0, value: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState('-createdAt')

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (vendorId) params.set('vendorId', vendorId)
        if (propertyId) params.set('propertyId', propertyId)
        params.set('page', String(page))
        params.set('sort', sort)
        params.set('limit', '5')

        const response = await fetch(`/api/reviews?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews)
          setTotalDocs(data.totalDocs)
          setTotalPages(data.totalPages)
          setAverageRating(data.averageRating)
          setAspectAverages(data.aspectAverages)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [vendorId, propertyId, page, sort])

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-card rounded-lg p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (totalDocs === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to leave a review after completing a transaction.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">{averageRating}</span>
            <div>
              <StarRating rating={averageRating} size="md" />
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalDocs} review{totalDocs !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }}
          className="bg-secondary text-secondary-foreground text-sm rounded-lg border border-border px-3 py-2"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-rating">Highest Rated</option>
          <option value="rating">Lowest Rated</option>
        </select>
      </div>

      {/* Aspect Averages */}
      {(aspectAverages.communication > 0 || aspectAverages.accuracy > 0 || aspectAverages.value > 0) && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-secondary rounded-lg">
          {aspectAverages.communication > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{aspectAverages.communication}</p>
              <p className="text-xs text-muted-foreground">Communication</p>
            </div>
          )}
          {aspectAverages.accuracy > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{aspectAverages.accuracy}</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          )}
          {aspectAverages.value > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{aspectAverages.value}</p>
              <p className="text-xs text-muted-foreground">Value</p>
            </div>
          )}
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary-hover transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50 hover:bg-secondary-hover transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
