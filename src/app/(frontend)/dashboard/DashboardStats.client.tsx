'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@/payload-types'

interface DashboardStats {
  totalProperties: number
  totalInquiries: number
  pendingInquiries: number
}

interface DashboardStatsProps {
  user: User
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }

        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.id])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg shadow-theme border border-card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-muted rounded-lg animate-pulse">
                <div className="w-6 h-6 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  // Show helpful message for users with no properties
  if (!loading && user.role !== 'admin' && stats.totalProperties === 0) {
    return (
      <div className="bg-card rounded-lg shadow-theme border border-card p-8 mb-8 text-center">
        <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Ready to Start Your Property Journey?
        </h3>
        <p className="text-muted-foreground mb-4">
          Once you add your first property, you will see valuable insights here including total
          properties, inquiries received, and pending responses.
        </p>
        {user.verificationStatus === 'verified' ? (
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Your First Property
          </Link>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>Get verified first to start adding properties</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-card rounded-lg shadow-theme border border-card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary/20 rounded-lg">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">
              {user.role === 'admin' ? 'Total Properties' : 'My Properties'}
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.totalProperties}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-theme border border-card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-success/20 rounded-lg">
            <svg
              className="w-6 h-6 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">
              {user.role === 'admin' ? 'Total Inquiries' : 'Inquiries Received'}
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.totalInquiries}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-theme border border-card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-warning/20 rounded-lg">
            <svg
              className="w-6 h-6 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">
              {user.role === 'admin' ? 'Pending Inquiries' : 'Pending Responses'}
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.pendingInquiries}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
