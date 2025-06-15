'use client'

import React, { useState, useEffect } from 'react'
import { User, Property } from '@/payload-types'
import Link from 'next/link'
import { Building, Clock, CheckCircle, XCircle, Home } from 'lucide-react'

interface PropertyStats {
  pending: number
  approved: number
  rejected: number
  sold: number
  total: number
}

interface AdminPropertyPanelProps {
  user: User
}

export const AdminPropertyPanel: React.FC<AdminPropertyPanelProps> = ({ user }) => {
  const [stats, setStats] = useState<PropertyStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    sold: 0,
    total: 0,
  })
  const [recentProperties, setRecentProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPropertyStats()
    fetchRecentProperties()
  }, [])

  const fetchPropertyStats = async () => {
    try {
      const response = await fetch('/api/properties?limit=1000', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }

      const data = await response.json()
      const properties = data.docs || []

      const newStats = {
        pending: properties.filter((p: Property) => p.status === 'pending').length,
        approved: properties.filter((p: Property) => p.status === 'approved').length,
        rejected: properties.filter((p: Property) => p.status === 'rejected').length,
        sold: properties.filter((p: Property) => p.status === 'sold').length,
        total: properties.length,
      }

      setStats(newStats)
    } catch (error) {
      console.error('Error fetching property stats:', error)
      setError('Failed to load property statistics')
    }
  }

  const fetchRecentProperties = async () => {
    try {
      const response = await fetch('/api/properties?limit=5&sort=-createdAt&where[status][equals]=pending', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent properties')
      }

      const data = await response.json()
      setRecentProperties(data.docs || [])
    } catch (error) {
      console.error('Error fetching recent properties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-theme border border-card p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error/20 border border-error rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-error mr-2" />
          <span className="text-error-foreground font-medium">{error}</span>
        </div>
      </div>
    )
  }

  const statusCards = [
    {
      title: 'Pending Review',
      count: stats.pending,
      icon: Clock,
      color: 'warning',
      href: '/dashboard/admin/properties?status=pending',
    },
    {
      title: 'Approved',
      count: stats.approved,
      icon: CheckCircle,
      color: 'success',
      href: '/dashboard/admin/properties?status=approved',
    },
    {
      title: 'Rejected',
      count: stats.rejected,
      icon: XCircle,
      color: 'error',
      href: '/dashboard/admin/properties?status=rejected',
    },
    {
      title: 'Sold/Rented',
      count: stats.sold,
      icon: Home,
      color: 'muted',
      href: '/dashboard/admin/properties?status=sold',
    },
  ]

  return (
    <div className="bg-card rounded-lg shadow-theme border border-card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary/20 rounded-lg mr-3">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Property Management</h2>
            <p className="text-sm text-muted-foreground">
              {stats.total} total properties • {stats.pending} pending review
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/admin/properties"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
        >
          View All Properties
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statusCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-card-foreground">{card.count}</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  card.color === 'warning' ? 'bg-warning/20' :
                  card.color === 'success' ? 'bg-success/20' :
                  card.color === 'error' ? 'bg-error/20' :
                  'bg-muted/20'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    card.color === 'warning' ? 'text-warning' :
                    card.color === 'success' ? 'text-success' :
                    card.color === 'error' ? 'text-error' :
                    'text-muted-foreground'
                  }`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Pending Properties */}
      {stats.pending > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Pending Properties</h3>
          <div className="space-y-3">
            {recentProperties.slice(0, 3).map((property) => (
              <div
                key={property.id}
                className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold text-card-foreground mr-2">{property.title}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning-foreground">
                        Pending Review
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} • 
                      {property.listingType === 'sale' ? 'For Sale' : 'For Rent'} • 
                      {property.area} m²
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Submitted {new Date(property.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/admin/properties/${property.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {recentProperties.length > 3 && (
              <div className="text-center pt-4 border-t border-border">
                <Link
                  href="/dashboard/admin/properties?status=pending"
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                >
                  View {stats.pending - 3} more pending properties
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {stats.pending === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No pending properties</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            All properties have been reviewed
          </p>
        </div>
      )}
    </div>
  )
}