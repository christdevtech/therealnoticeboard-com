'use client'

import React, { useState, useEffect } from 'react'
import { Property, Neighborhood } from '@/payload-types'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Home,
  Building,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react'

interface AdminPropertiesListProps {
  properties: Property[]
  totalPages: number
  currentPage: number
  totalDocs: number
  neighborhoods: Neighborhood[]
  initialFilters: {
    status: string
    search: string
    propertyType: string
    listingType: string
  }
}

interface PropertyUpdateData {
  status: 'pending' | 'approved' | 'rejected' | 'sold'
  adminNotes?: string
}

export const AdminPropertiesList: React.FC<AdminPropertiesListProps> = ({
  properties: initialProperties,
  totalPages,
  currentPage,
  totalDocs,
  neighborhoods,
  initialFilters,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState(initialProperties)
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(false)
  const [updatingProperty, setUpdatingProperty] = useState<string | null>(null)

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Building },
    { value: 'pending', label: 'Pending Review', icon: Clock },
    { value: 'approved', label: 'Approved', icon: Check },
    { value: 'rejected', label: 'Rejected', icon: X },
    { value: 'sold', label: 'Sold/Rented', icon: Home },
  ]

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'land', label: 'Land' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
  ]

  const listingTypeOptions = [
    { value: 'all', label: 'All Listings' },
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
  ]

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Update URL
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      }
    })
    params.set('page', '1') // Reset to first page when filtering

    router.push(`/dashboard/admin/properties?${params.toString()}`)
  }

  const updatePropertyStatus = async (propertyId: string, updateData: PropertyUpdateData) => {
    setUpdatingProperty(propertyId)
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      const updatedProperty = await response.json()
      
      // Update local state
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? { ...p, ...updatedProperty } : p)
      )

      // Send email notification
      await sendStatusChangeNotification(propertyId, updateData.status)
      
    } catch (error) {
      console.error('Error updating property:', error)
      alert('Failed to update property status')
    } finally {
      setUpdatingProperty(null)
    }
  }

  const sendStatusChangeNotification = async (propertyId: string, newStatus: string) => {
    try {
      await fetch('/api/notifications/property-status-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          newStatus,
        }),
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      // Don't throw error as the main action (status update) was successful
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-warning/20 text-warning-foreground', label: 'Pending Review' },
      approved: { color: 'bg-success/20 text-success-foreground', label: 'Approved' },
      rejected: { color: 'bg-error/20 text-error-foreground', label: 'Rejected' },
      sold: { color: 'bg-muted/20 text-muted-foreground', label: 'Sold/Rented' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      land: 'Land',
      residential: 'Residential',
      commercial: 'Commercial',
      industrial: 'Industrial',
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card rounded-lg shadow-theme border border-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Property Type Filter */}
          <select
            value={filters.propertyType}
            onChange={(e) => updateFilters({ propertyType: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Listing Type Filter */}
          <select
            value={filters.listingType}
            onChange={(e) => updateFilters({ listingType: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {listingTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {properties.length} of {totalDocs} properties
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.length === 0 ? (
          <div className="bg-card rounded-lg shadow-theme border border-card p-12 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          properties.map((property) => {
            const owner = typeof property.owner === 'object' ? property.owner : null
            const neighborhood = typeof property.neighborhood === 'object' ? property.neighborhood : null
            
            return (
              <div key={property.id} className="bg-card rounded-lg shadow-theme border border-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-card-foreground">{property.title}</h3>
                      {getStatusBadge(property.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{getPropertyTypeLabel(property.propertyType)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        <span>{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{neighborhood?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{formatPrice(property.price)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-medium ml-1">{property.area} m²</span>
                      </div>
                      {owner && (
                        <div>
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="font-medium ml-1">{owner.name || owner.email}</span>
                        </div>
                      )}
                    </div>

                    {property.description && (
                      <p className="text-muted-foreground mt-3 line-clamp-2">
                        {property.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Link
                      href={`/dashboard/admin/properties/${property.id}`}
                      className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary-hover transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>

                    {property.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePropertyStatus(property.id, { status: 'approved' })}
                          disabled={updatingProperty === property.id}
                          className="inline-flex items-center px-3 py-2 bg-success text-success-foreground text-sm rounded-md hover:bg-success-hover transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => updatePropertyStatus(property.id, { status: 'rejected' })}
                          disabled={updatingProperty === property.id}
                          className="inline-flex items-center px-3 py-2 bg-error text-error-foreground text-sm rounded-md hover:bg-error-hover transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}

                    {property.status === 'approved' && (
                      <button
                        onClick={() => updatePropertyStatus(property.id, { status: 'sold' })}
                        disabled={updatingProperty === property.id}
                        className="inline-flex items-center px-3 py-2 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted-hover transition-colors disabled:opacity-50"
                      >
                        <Home className="w-4 h-4 mr-1" />
                        Mark Sold
                      </button>
                    )}
                  </div>
                </div>

                {property.adminNotes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <strong>Admin Notes:</strong> {property.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/dashboard/admin/properties?${new URLSearchParams({ ...filters, page: (currentPage - 1).toString() }).toString()}`}
              className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Previous
            </Link>
          )}
          
          <span className="px-3 py-2 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          {currentPage < totalPages && (
            <Link
              href={`/dashboard/admin/properties?${new URLSearchParams({ ...filters, page: (currentPage + 1).toString() }).toString()}`}
              className="px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}