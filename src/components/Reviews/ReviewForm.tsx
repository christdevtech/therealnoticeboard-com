'use client'

import React, { useState } from 'react'
import { StarRating } from './StarRating'

interface ReviewFormProps {
  vendorId: string
  propertyId?: string
  transactionId: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  vendorId,
  propertyId,
  transactionId,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [communication, setCommunication] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [value, setValue] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) { setError('Please select an overall rating.'); return }
    if (!title.trim()) { setError('Please enter a title.'); return }
    if (!comment.trim()) { setError('Please write a review.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          vendor: vendorId, property: propertyId, transaction: transactionId,
          rating, title: title.trim(), comment: comment.trim(),
          aspects: {
            communication: communication || undefined,
            accuracy: accuracy || undefined,
            value: value || undefined,
          },
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      onSuccess?.()
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-card border border-card rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Leave a Review</h3>
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-2">Overall Rating *</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
          placeholder="Summarize your experience"
          className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Review *</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={4}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-y" />
        <p className="text-xs text-muted-foreground mt-1">{comment.length}/2000</p>
      </div>
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-3">Rate specific aspects (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-xs text-muted-foreground mb-1">Communication</label>
            <StarRating rating={communication} size="sm" interactive onChange={setCommunication} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">Accuracy</label>
            <StarRating rating={accuracy} size="sm" interactive onChange={setAccuracy} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">Value</label>
            <StarRating rating={value} size="sm" interactive onChange={setValue} /></div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && <button type="button" onClick={onCancel}
          className="text-muted-foreground hover:text-foreground px-4 py-2.5">Cancel</button>}
      </div>
    </form>
  )
}
