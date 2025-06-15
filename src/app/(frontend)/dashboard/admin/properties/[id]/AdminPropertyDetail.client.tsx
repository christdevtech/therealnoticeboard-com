'use client'

import React, { useState } from 'react'
import { Property, Media, User, Neighborhood, Amenity } from '@/payload-types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  Home, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Ruler, 
  Phone, 
  Mail, 
  MessageCircle,
  User as UserIcon,
  FileText,
  Image as ImageIcon,
  Star
} from 'lucide-react'
import Image from 'next/image'

interface AdminPropertyDetailProps {
  property: Property
}

interface PropertyUpdateData {
  status: 'pending' | 'approved' | 'rejected' | 'sold'
  adminNotes?: string
  featured?: boolean
}

export const AdminPropertyDetail: React.FC<AdminPropertyDetailProps> = ({ property }) => {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState(property.adminNotes || '')
  const [featured, setFeatured] = useState(property.featured || false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const owner = typeof property.owner === 'object' ? property.owner as User : null
  const neighborhood = typeof property.neighborhood === 'object' ? property.neighborhood as Neighborhood : null
  const images = property.images as Media[] || []
  const amenities = property.amenities as Amenity[] || []

  const updatePropertyStatus = async (status: PropertyUpdateData['status'], notes?: string) => {
    setUpdating(true)
    try {
      const updateData: PropertyUpdateData = {
        status,
        adminNotes: notes || adminNotes,
        featured,
      }

      const response = await fetch(`/api/properties/${property.id}`, {
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

      // Send email notification
      await sendStatusChangeNotification(property.id, status)
      
      // Redirect back to properties list
      router.push('/dashboard/admin/properties')
      
    } catch (error) {
      console.error('Error updating property:', error)
      alert('Failed to update property status')
    } finally {
      setUpdating(false)
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
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-warning/20 text-warning-foreground border-warning/30', label: 'Pending Review' },
      approved: { color: 'bg-success/20 text-success-foreground border-success/30', label: 'Approved' },
      rejected: { color: 'bg-error/20 text-error-foreground border-error/30', label: 'Rejected' },
      sold: { color: 'bg-muted/20 text-muted-foreground border-muted/30', label: 'Sold/Rented' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
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

  const getFeatureValue = (feature: any, key: string) => {
    return feature && typeof feature === 'object' ? feature[key] : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/properties"
            className="inline-flex items-center px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">{property.title}</h1>
            <p className="text-muted-foreground">Property ID: {property.id}</p>
          </div>
        </div>
        {getStatusBadge(property.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images.length > 0 && (
            <div className="bg-card rounded-lg shadow-theme border border-card p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Property Images ({images.length})
              </h2>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={images[activeImageIndex]?.url || ''}
                    alt={images[activeImageIndex]?.alt || property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Thumbnail Grid */}
                {images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                          index === activeImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <Image
                          src={image.url || ''}
                          alt={image.alt || `Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="bg-card rounded-lg shadow-theme border border-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Property Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                  <p className="text-card-foreground">{getPropertyTypeLabel(property.propertyType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Listing Type</label>
                  <p className="text-card-foreground">{property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Area</label>
                  <p className="text-card-foreground">{property.area} m²</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-card-foreground font-semibold text-lg">{formatPrice(property.price)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Neighborhood</label>
                  <p className="text-card-foreground">{neighborhood?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Condition</label>
                  <p className="text-card-foreground capitalize">{property.propertyCondition?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Available Date</label>
                  <p className="text-card-foreground">
                    {property.availabilityDate ? new Date(property.availabilityDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price Negotiable</label>
                  <p className="text-card-foreground">{property.priceNegotiable ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Property-specific features */}
            {property.propertyType === 'residential' && property.residentialFeatures && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Residential Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getFeatureValue(property.residentialFeatures, 'bedrooms') && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bedrooms</label>
                      <p className="text-card-foreground">{getFeatureValue(property.residentialFeatures, 'bedrooms')}</p>
                    </div>
                  )}
                  {getFeatureValue(property.residentialFeatures, 'bathrooms') && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bathrooms</label>
                      <p className="text-card-foreground">{getFeatureValue(property.residentialFeatures, 'bathrooms')}</p>
                    </div>
                  )}
                  {getFeatureValue(property.residentialFeatures, 'floors') && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Floors</label>
                      <p className="text-card-foreground">{getFeatureValue(property.residentialFeatures, 'floors')}</p>
                    </div>
                  )}
                  {getFeatureValue(property.residentialFeatures, 'yearBuilt') && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year Built</label>
                      <p className="text-card-foreground">{getFeatureValue(property.residentialFeatures, 'yearBuilt')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Address */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>
              <p className="text-muted-foreground">{property.address}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          {owner && (
            <div className="bg-card rounded-lg shadow-theme border border-card p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Property Owner
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-card-foreground">{owner.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-card-foreground">{owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                  <p className="text-card-foreground capitalize">{owner.verificationStatus}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-card-foreground">{new Date(owner.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {property.contactInfo && (
            <div className="bg-card rounded-lg shadow-theme border border-card p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Contact Information</h2>
              <div className="space-y-3">
                {property.contactInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground">{property.contactInfo.phone}</span>
                  </div>
                )}
                {property.contactInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground">{property.contactInfo.email}</span>
                  </div>
                )}
                {property.contactInfo.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground">{property.contactInfo.whatsapp}</span>
                  </div>
                )}
                {property.contactInfo.preferredContactMethod && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Contact</label>
                    <p className="text-card-foreground capitalize">{property.contactInfo.preferredContactMethod}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="bg-card rounded-lg shadow-theme border border-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Admin Actions</h2>
            
            {/* Featured Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border"
                />
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Featured Property</span>
              </label>
            </div>

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this property..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {property.status === 'pending' && (
                <>
                  <button
                    onClick={() => updatePropertyStatus('approved')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success-hover transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Approve Property'}
                  </button>
                  <button
                    onClick={() => updatePropertyStatus('rejected')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-error text-error-foreground rounded-md hover:bg-error-hover transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Reject Property'}
                  </button>
                </>
              )}

              {property.status === 'approved' && (
                <>
                  <button
                    onClick={() => updatePropertyStatus('sold')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted-hover transition-colors disabled:opacity-50"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Mark as Sold/Rented'}
                  </button>
                  <button
                    onClick={() => updatePropertyStatus('pending')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning-hover transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Move to Pending'}
                  </button>
                </>
              )}

              {(property.status === 'rejected' || property.status === 'sold') && (
                <>
                  <button
                    onClick={() => updatePropertyStatus('approved')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success-hover transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Approve Property'}
                  </button>
                  <button
                    onClick={() => updatePropertyStatus('pending')}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning-hover transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {updating ? 'Updating...' : 'Move to Pending'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Property Metadata */}
          <div className="bg-card rounded-lg shadow-theme border border-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Property Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Created</label>
                <p className="text-card-foreground">{new Date(property.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Last Updated</label>
                <p className="text-card-foreground">{new Date(property.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Slug</label>
                <p className="text-card-foreground font-mono text-xs">{property.slug}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}