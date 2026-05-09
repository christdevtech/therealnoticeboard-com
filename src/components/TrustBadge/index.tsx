'use client'

import React from 'react'
import { Shield, Star, Award, User as UserIcon } from 'lucide-react'
import type { TrustTier } from '@/hooks/computeTrustScore'

interface TrustBadgeProps {
  score: number
  tier?: TrustTier
  averageRating?: number
  totalReviews?: number
  completedDeals?: number
  variant?: 'compact' | 'full' | 'inline'
  className?: string
}

const tierConfig: Record<TrustTier, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  trusted: {
    label: 'Trusted Seller',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: <Award className="w-4 h-4" />,
  },
  reliable: {
    label: 'Reliable Seller',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: <Shield className="w-4 h-4" />,
  },
  active: {
    label: 'Active Seller',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: <Star className="w-4 h-4" />,
  },
  new: {
    label: 'New Seller',
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/30',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: <UserIcon className="w-4 h-4" />,
  },
}

function getTierFromScore(score: number): TrustTier {
  if (score >= 90) return 'trusted'
  if (score >= 70) return 'reliable'
  if (score >= 50) return 'active'
  return 'new'
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  tier,
  averageRating = 0,
  totalReviews = 0,
  completedDeals = 0,
  variant = 'compact',
  className = '',
}) => {
  const resolvedTier = tier || getTierFromScore(score)
  const config = tierConfig[resolvedTier]

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color} ${className}`}>
        {config.icon}
        <span>{config.label}</span>
        {averageRating > 0 && <span>· ★ {averageRating}</span>}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${className}`}>
        <span className={config.color}>{config.icon}</span>
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        {averageRating > 0 && (
          <span className={`text-xs ${config.color}`}>· ★ {averageRating}</span>
        )}
        {totalReviews > 0 && (
          <span className="text-xs text-muted-foreground">({totalReviews})</span>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className={`border rounded-lg p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={config.color}>{config.icon}</span>
        <span className={`font-semibold ${config.color}`}>{config.label}</span>
        <span className={`text-sm ${config.color} ml-auto`}>Score: {score}/100</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{averageRating > 0 ? `★ ${averageRating}` : '—'}</p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{totalReviews}</p>
          <p className="text-xs text-muted-foreground">Reviews</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{completedDeals}</p>
          <p className="text-xs text-muted-foreground">Deals</p>
        </div>
      </div>
    </div>
  )
}
