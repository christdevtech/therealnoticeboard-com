'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Amenity, Neighborhood } from '@/payload-types'
import Link from 'next/link'

// Mapbox imports
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Trash } from 'lucide-react'

interface PropertyUploadFormProps {
  user: User
  amenities: Amenity[]
  neighborhoods: Neighborhood[]
}

interface FormData {
  // Basic Information
  title: string
  description: string
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land'
  area: number
  price: number
  listingType: 'sale' | 'rent'

  // Location
  neighborhood: string
  address: string
  latitude: number
  longitude: number

  // Property Details
  propertyCondition: 'new' | 'good' | 'fair' | 'needs_renovation'
  availabilityDate: string
  virtualTourUrl: string
  priceNegotiable: boolean
  paymentTerms?: 'monthly' | 'quarterly' | 'annually'
  securityDeposit?: number

  // Contact Information
  phone: string
  email: string
  whatsapp: string
  preferredContactMethod: 'phone' | 'email' | 'whatsapp'
  contactHours: string

  // SEO Meta Fields
  metaTitle: string
  metaDescription: string
  metaImage?: File

  // Property Features (conditional)
  bedrooms?: number
  bathrooms?: number
  floors?: number
  yearBuilt?: number

  // Commercial features
  businessType?: string
  offices?: number

  // Industrial features
  industrialType?: string
  ceilingHeight?: number
  loadingDocks?: number
  powerSupply?: string

  // Land features
  landType?: string
  topography?: string

  // Amenities
  amenities: string[]

  // Images
  images: File[]
}

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
}

export const PropertyUploadForm: React.FC<PropertyUploadFormProps> = ({
  user,
  amenities,
  neighborhoods,
}) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    propertyType: 'residential',
    area: 0,
    price: 0,
    listingType: 'sale',
    neighborhood: '',
    address: '',
    latitude: 3.848, // Default to Yaoundé, Cameroon
    longitude: 11.502,
    propertyCondition: 'good',
    availabilityDate: '',
    virtualTourUrl: '',
    priceNegotiable: false,
    phone: '',
    email: user.email || '',
    whatsapp: '',
    preferredContactMethod: 'phone',
    contactHours: '',
    metaTitle: '',
    metaDescription: '',
    amenities: [],
    images: [],
  })

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 11.502,
    latitude: 3.848,
    zoom: 10,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentTab, setCurrentTab] = useState(0)

  const tabs = [
    { id: 0, name: 'Basic Information', icon: '🏠' },
    { id: 1, name: 'Location', icon: '📍' },
    { id: 2, name: 'Property Features', icon: '🔧' },
    { id: 3, name: 'Property Details', icon: '📋' },
    { id: 4, name: 'SEO & Marketing', icon: '🎯' },
    { id: 5, name: 'Contact & Images', icon: '📞' },
  ]

  // Filter amenities based on property type
  const filteredAmenities = amenities.filter((amenity) =>
    amenity.propertyTypes?.includes(formData.propertyType),
  )

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + formData.images.length > 10) {
      setErrors((prev) => ({ ...prev, images: 'Maximum 10 images allowed' }))
      return
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.area || formData.area <= 0) newErrors.area = 'Valid area is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.neighborhood) newErrors.neighborhood = 'Neighborhood is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.availabilityDate.trim())
      newErrors.availabilityDate = 'Availability date is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.preferredContactMethod)
      newErrors.preferredContactMethod = 'Preferred contact method is required'
    if (formData.images.length === 0) newErrors.images = 'At least one image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadedImageIds: string[] = []

    for (const image of images) {
      const imageFormData = new FormData()
      imageFormData.append('file', image)
      imageFormData.append('isPublic', 'true')
      imageFormData.append('alt', `Property image for ${formData.title}`)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: imageFormData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to upload image: ${errorData.message || 'Unknown error'}`)
      }

      const result = await response.json()
      uploadedImageIds.push(result.doc.id)
    }

    return uploadedImageIds
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Upload images first
      const imageIds = await uploadImages(formData.images)

      // Step 2: Create property data object
      const propertyData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        area: formData.area,
        price: formData.price,
        listingType: formData.listingType,
        neighborhood: formData.neighborhood,
        address: formData.address,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        propertyCondition: formData.propertyCondition,
        availabilityDate: formData.availabilityDate,
        virtualTourUrl: formData.virtualTourUrl,
        priceNegotiable: formData.priceNegotiable,
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          preferredContactMethod: formData.preferredContactMethod,
          contactHours: formData.contactHours,
        },
        meta: {
          title: formData.metaTitle,
          description: formData.metaDescription,
        },
        amenities: formData.amenities,
        images: imageIds,
      }

      // Add rental-specific fields
      if (formData.listingType === 'rent') {
        if (formData.paymentTerms) propertyData.paymentTerms = formData.paymentTerms
        if (formData.securityDeposit) propertyData.securityDeposit = formData.securityDeposit
      }

      // Add conditional property features
      if (formData.propertyType === 'residential') {
        propertyData.residentialFeatures = {}
        if (formData.bedrooms) propertyData.residentialFeatures.bedrooms = formData.bedrooms
        if (formData.bathrooms) propertyData.residentialFeatures.bathrooms = formData.bathrooms
        if (formData.floors) propertyData.residentialFeatures.floors = formData.floors
        if (formData.yearBuilt) propertyData.residentialFeatures.yearBuilt = formData.yearBuilt
      }

      if (formData.propertyType === 'commercial') {
        propertyData.commercialFeatures = {}
        if (formData.businessType)
          propertyData.commercialFeatures.businessType = formData.businessType
        if (formData.offices) propertyData.commercialFeatures.offices = formData.offices
        if (formData.floors) propertyData.commercialFeatures.floors = formData.floors
        if (formData.yearBuilt) propertyData.commercialFeatures.yearBuilt = formData.yearBuilt
      }

      if (formData.propertyType === 'industrial') {
        propertyData.industrialFeatures = {}
        if (formData.industrialType)
          propertyData.industrialFeatures.industrialType = formData.industrialType
        if (formData.ceilingHeight)
          propertyData.industrialFeatures.ceilingHeight = formData.ceilingHeight
        if (formData.loadingDocks)
          propertyData.industrialFeatures.loadingDocks = formData.loadingDocks
        if (formData.powerSupply) propertyData.industrialFeatures.powerSupply = formData.powerSupply
        if (formData.yearBuilt) propertyData.industrialFeatures.yearBuilt = formData.yearBuilt
      }

      if (formData.propertyType === 'land') {
        propertyData.landFeatures = {}
        if (formData.landType) propertyData.landFeatures.landType = formData.landType
        if (formData.topography) propertyData.landFeatures.topography = formData.topography
      }

      console.log('Property Data:', propertyData)

      // Step 3: Submit property data to Payload CMS API
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create property')
      }

      // const result = await response.json()

      // Redirect to dashboard with success message
      router.push('/dashboard?success=property-created')
    } catch (error) {
      console.error('Error creating property:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create property' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1)
    }
  }

  const prevTab = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tabs && tabs[currentTab]?.name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentTab + 1} of {tabs.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentTab + 1) / tabs.length) * 100}%` }}
          ></div>
        </div>

        {/* Mobile-friendly step indicators */}
        <div className="hidden md:flex justify-between">
          {tabs.map((tab, index) => (
            <div
              onClick={() => setCurrentTab(index)}
              key={tab.id}
              className="flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index <= currentTab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {index < currentTab ? '✓' : index + 1}
              </div>
              <span
                className={`mt-2 text-xs text-center max-w-20 ${
                  index <= currentTab
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.name}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden flex justify-center space-x-2">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentTab ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Content */}
        <div className="mt-6">
          {/* Tab Content - Only show active tab */}
          <div className="min-h-[400px]">
            {/* Basic Information Tab */}
            {currentTab === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Beautiful 3-bedroom apartment in Bastos"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Describe your property in detail..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property Type *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Listing Type *
                    </label>
                    <select
                      value={formData.listingType}
                      onChange={(e) => handleInputChange('listingType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={formData.area || ''}
                      onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., 120"
                    />
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (XAF) *
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., 50000000"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {currentTab === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Neighborhood *
                    </label>
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a neighborhood</option>
                      {neighborhoods.map((neighborhood) => (
                        <option key={neighborhood.id} value={neighborhood.id}>
                          {neighborhood.name} - {neighborhood.city}
                        </option>
                      ))}
                    </select>
                    {errors.neighborhood && (
                      <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Street address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location on Map *
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click on the map to set the exact location of your property.
                  </p>
                  <div className="h-96 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                    <Map
                      {...viewState}
                      onMove={(evt) => setViewState(evt.viewState)}
                      onClick={handleMapClick}
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                    >
                      <Marker
                        longitude={formData.longitude}
                        latitude={formData.latitude}
                        color="red"
                      />
                      <NavigationControl position="top-right" />
                      <GeolocateControl position="top-right" />
                    </Map>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Features Tab */}
            {currentTab === 2 && (
              <div className="space-y-6">
                {/* Residential Features */}
                {formData.propertyType === 'residential' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Residential Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bedrooms
                        </label>
                        <input
                          type="number"
                          value={formData.bedrooms || ''}
                          onChange={(e) =>
                            handleInputChange('bedrooms', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          value={formData.bathrooms || ''}
                          onChange={(e) =>
                            handleInputChange('bathrooms', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Floors
                        </label>
                        <input
                          type="number"
                          value={formData.floors || ''}
                          onChange={(e) =>
                            handleInputChange('floors', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.yearBuilt || ''}
                        onChange={(e) =>
                          handleInputChange('yearBuilt', parseInt(e.target.value) || undefined)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                )}

                {/* Commercial Features */}
                {formData.propertyType === 'commercial' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Commercial Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Business Type
                        </label>
                        <select
                          value={formData.businessType || ''}
                          onChange={(e) =>
                            handleInputChange('businessType', e.target.value || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select business type</option>
                          <option value="office">Office</option>
                          <option value="retail">Retail</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="hotel">Hotel</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Number of Offices
                        </label>
                        <input
                          type="number"
                          value={formData.offices || ''}
                          onChange={(e) =>
                            handleInputChange('offices', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.yearBuilt || ''}
                        onChange={(e) =>
                          handleInputChange('yearBuilt', parseInt(e.target.value) || undefined)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                )}

                {/* Industrial Features */}
                {formData.propertyType === 'industrial' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Industrial Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Industrial Type
                        </label>
                        <select
                          value={formData.industrialType || ''}
                          onChange={(e) =>
                            handleInputChange('industrialType', e.target.value || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select industrial type</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="distribution">Distribution Center</option>
                          <option value="factory">Factory</option>
                          <option value="storage">Storage</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ceiling Height (m)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.ceilingHeight || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'ceilingHeight',
                              parseFloat(e.target.value) || undefined,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 6.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Loading Docks
                        </label>
                        <input
                          type="number"
                          value={formData.loadingDocks || ''}
                          onChange={(e) =>
                            handleInputChange('loadingDocks', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Year Built
                        </label>
                        <input
                          type="number"
                          value={formData.yearBuilt || ''}
                          onChange={(e) =>
                            handleInputChange('yearBuilt', parseInt(e.target.value) || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="e.g., 2020"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Power Supply Specifications
                      </label>
                      <input
                        type="text"
                        value={formData.powerSupply || ''}
                        onChange={(e) =>
                          handleInputChange('powerSupply', e.target.value || undefined)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., 3-phase 400V"
                      />
                    </div>
                  </div>
                )}

                {/* Land Features */}
                {formData.propertyType === 'land' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Land Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Land Type
                        </label>
                        <select
                          value={formData.landType || ''}
                          onChange={(e) =>
                            handleInputChange('landType', e.target.value || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select land type</option>
                          <option value="residential">Residential Plot</option>
                          <option value="commercial">Commercial Plot</option>
                          <option value="agricultural">Agricultural</option>
                          <option value="industrial">Industrial</option>
                          <option value="mixed">Mixed Use</option>
                          <option value="undeveloped">Undeveloped</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Topography
                        </label>
                        <select
                          value={formData.topography || ''}
                          onChange={(e) =>
                            handleInputChange('topography', e.target.value || undefined)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select topography</option>
                          <option value="flat">Flat</option>
                          <option value="sloped">Sloped</option>
                          <option value="hilly">Hilly</option>
                          <option value="irregular">Irregular</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAmenities.map((amenity) => (
                      <label
                        key={amenity.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('amenities', [...formData.amenities, amenity.id])
                            } else {
                              handleInputChange(
                                'amenities',
                                formData.amenities.filter((id) => id !== amenity.id),
                              )
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {amenity.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Property Details Tab */}
            {currentTab === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Property Condition *
                      </label>
                      <select
                        value={formData.propertyCondition}
                        onChange={(e) => handleInputChange('propertyCondition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="new">New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="needs-renovation">Needs Renovation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Availability Date *
                      </label>
                      <input
                        type="date"
                        value={formData.availabilityDate}
                        onChange={(e) => handleInputChange('availabilityDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      {errors.availabilityDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.availabilityDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Virtual Tour URL
                      </label>
                      <input
                        type="url"
                        value={formData.virtualTourUrl}
                        onChange={(e) => handleInputChange('virtualTourUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="https://example.com/virtual-tour"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="priceNegotiable"
                        checked={formData.priceNegotiable}
                        onChange={(e) => handleInputChange('priceNegotiable', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="priceNegotiable"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Price is negotiable
                      </label>
                    </div>
                  </div>

                  {/* Rental-specific fields */}
                  {formData.listingType === 'rent' && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Rental Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Terms
                          </label>
                          <select
                            value={formData.paymentTerms || ''}
                            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="">Select payment terms</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Security Deposit (XAF)
                          </label>
                          <input
                            type="number"
                            value={formData.securityDeposit || ''}
                            onChange={(e) =>
                              handleInputChange(
                                'securityDeposit',
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="e.g., 100000"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO & Marketing Tab */}
            {currentTab === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    SEO & Marketing
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Custom SEO title for search engines"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="SEO description for search results"
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 characters
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        SEO Tips
                      </h4>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        <li>
                          • Keep meta title under 60 characters for best display in search results
                        </li>
                        <li>• Meta description should be 150-160 characters and compelling</li>
                        <li>• Include relevant keywords naturally in both fields</li>
                        <li>• If left empty, the property title and description will be used</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Images Tab */}
            {currentTab === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., +237 6XX XXX XXX"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., +237 6XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Contact Method *
                      </label>
                      <select
                        value={formData.preferredContactMethod}
                        onChange={(e) =>
                          handleInputChange('preferredContactMethod', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                      {errors.preferredContactMethod && (
                        <p className="text-red-500 text-sm mt-1">{errors.preferredContactMethod}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Best Contact Hours
                      </label>
                      <input
                        type="text"
                        value={formData.contactHours}
                        onChange={(e) => handleInputChange('contactHours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., 9 AM - 6 PM weekdays"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">Property Images *</h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                      >
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-gray-600">Click to upload images</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Maximum 10 images, JPG, PNG, or WebP
                        </p>
                      </button>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {currentTab > 0 && (
                <button
                  type="button"
                  onClick={prevTab}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>

              {currentTab < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={nextTab}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Property...' : 'Create Property'}
                </button>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
