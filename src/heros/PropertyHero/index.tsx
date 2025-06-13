'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  MapPin,
  Home,
  DollarSign,
  Square,
  Calendar,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Move,
  Navigation,
  ExternalLink,
} from 'lucide-react'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import type { Property } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { cn } from '@/utilities/ui'

export const PropertyHero: React.FC<{
  property: Property
}> = ({ property }) => {
  const {
    title,
    description,
    propertyType,
    listingType,
    price,
    area,
    images,
    neighborhood,
    owner,
    createdAt,
    meta,
    coordinates,
  } = property

  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const firstImage = images && Array.isArray(images) && images.length > 0 ? images[0] : null
  const metaImage = meta?.image && typeof meta.image === 'object' ? meta.image : null
  const displayImage = metaImage || firstImage
  const allImages =
    images && Array.isArray(images) ? images.filter((img) => typeof img !== 'string') : []

  // Format price with XAF currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Format area
  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`
  }

  // Get property type label
  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      land: 'Land',
      residential: 'Residential',
      commercial: 'Commercial',
      industrial: 'Industrial',
    }
    return labels[type as keyof typeof labels] || type
  }

  // Get listing type label
  const getListingTypeLabel = (type: string) => {
    const labels = {
      sale: 'For Sale',
      rent: 'For Rent',
    }
    return labels[type as keyof typeof labels] || type
  }

  const openLightbox = (index: number = 0) => {
    setCurrentImageIndex(index)
    setIsLightboxOpen(true)
    setIsZoomed(false)
    setPosition({ x: 0, y: 0 })
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setIsZoomed(false)
  }

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    setIsZoomed(false)
  }, [allImages.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    setIsZoomed(false)
  }, [allImages.length])

  const toggleZoom = () => {
    setIsZoomed((prev) => {
      if (prev) {
        // Reset position when zooming out
        setPosition({ x: 0, y: 0 })
      }
      return !prev
    })
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return
    
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return
    
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    setPosition({ x: newX, y: newY })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomed) return
    
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isZoomed) return
    
    const touch = e.touches[0]
    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y
    
    setPosition({ x: newX, y: newY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return

      switch (e.key) {
        case 'ArrowRight':
          nextImage()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'Escape':
          closeLightbox()
          break
        case 'z':
          toggleZoom()
          break
        // Arrow keys for moving the image when zoomed
        case 'ArrowUp':
          if (isZoomed) setPosition(prev => ({ ...prev, y: prev.y + 20 }))
          break
        case 'ArrowDown':
          if (isZoomed) setPosition(prev => ({ ...prev, y: prev.y - 20 }))
          break
        case 'Home':
          if (isZoomed) setPosition({ x: 0, y: 0 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, nextImage, prevImage, isZoomed])
  
  // Add global mouse/touch event listeners for dragging outside the image
  useEffect(() => {
    if (!isLightboxOpen || !isZoomed) return
    
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalTouchEnd = () => setIsDragging(false)
    
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalTouchEnd)
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isLightboxOpen, isZoomed])

  const mapCenter = {
    latitude: coordinates?.latitude || 3.848, // Default to Yaoundé, Cameroon
    longitude: coordinates?.longitude || 11.502,
  }

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    if (!coordinates?.latitude || !coordinates?.longitude) return null

    const destination = `${coordinates.latitude},${coordinates.longitude}`
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
  }

  return (
    <>
      <div className="bg-background">
        <div className="container py-8">
          {/* Title and Critical Specs */}
          <div className="mb-8">
            {/* Property Type and Listing Type */}
            <div className="flex gap-4 mb-4 items-center">
              {propertyType && (
                <span className="flex items-center px-3 py-1 text-sm font-medium rounded-full bg-secondary text-secondary-foreground">
                  <Home className="w-3 h-3 inline mr-1" />
                  {getPropertyTypeLabel(propertyType)}
                </span>
              )}
              {listingType && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full text-white ${
                    listingType === 'sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                >
                  {getListingTypeLabel(listingType)}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
              {title}
            </h1>

            {/* Critical Specs Row */}
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              {price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-xl font-bold text-success">{formatPrice(price)}</span>
                </div>
              )}

              {area && (
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  <span className="font-medium">{formatArea(area)}</span>
                </div>
              )}

              {neighborhood && typeof neighborhood === 'object' && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{neighborhood.name}</span>
                </div>
              )}

              {owner && typeof owner === 'object' && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{owner.name || 'Property Owner'}</span>
                </div>
              )}

              {createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDateTime(createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Image and Map Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Slider Section */}
            <div className="space-y-4">
              {/* Main Image Slider */}
              <div className="relative rounded-lg overflow-hidden bg-muted border border-border">
                {/* Image Carousel */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {!allImages.length && (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                      <Home className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}

                  {allImages.length > 0 && typeof allImages[currentImageIndex] !== 'string' && (
                    <div
                      className="cursor-pointer group"
                      onClick={() => openLightbox(currentImageIndex)}
                    >
                      <Media
                        fill
                        priority={currentImageIndex === 0}
                        imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                        resource={allImages[currentImageIndex]}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  )}

                  {/* Navigation Controls */}
                  {allImages.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-between items-center p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevImage()
                        }}
                        className="p-2 rounded-full bg-card/70 hover:bg-card/90 text-card-foreground shadow-theme-md transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="bg-black/60 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextImage()
                        }}
                        className="p-2 rounded-full bg-card/70 hover:bg-card/90 text-card-foreground shadow-theme-md transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {allImages.map((image, index) => {
                    if (typeof image !== 'string') {
                      return (
                        <div
                          key={index}
                          className={cn(
                            'aspect-square rounded overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-all relative',
                            currentImageIndex === index
                              ? 'ring-2 ring-offset-2 ring-blue-500'
                              : 'opacity-70',
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentImageIndex(index)
                          }}
                        >
                          <Media fill imgClassName="object-cover" resource={image} />
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-foreground">Location</h3>
                {getDirectionsUrl() && (
                  <a
                    href={getDirectionsUrl() || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border">
                {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? (
                  <Map
                    initialViewState={{
                      ...mapCenter,
                      zoom: 14,
                    }}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    interactive={true}
                  >
                    <Marker
                      longitude={mapCenter.longitude}
                      latitude={mapCenter.latitude}
                      color="#ef4444"
                      onClick={() => setShowPopup(!showPopup)}
                    />
                    {showPopup && (
                      <Popup
                        longitude={mapCenter.longitude}
                        latitude={mapCenter.latitude}
                        anchor="bottom"
                        closeButton={true}
                        closeOnClick={false}
                        onClose={() => setShowPopup(false)}
                        className="z-10"
                      >
                        <div className="p-2">
                          <h4 className="font-medium text-sm">{title}</h4>
                          {neighborhood && typeof neighborhood === 'object' && (
                            <p className="text-xs text-muted-foreground">{neighborhood.name}</p>
                          )}
                          {getDirectionsUrl() && (
                            <a
                              href={getDirectionsUrl() || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover mt-1"
                            >
                              Get Directions
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </Popup>
                    )}
                    <NavigationControl position="top-right" />
                  </Map>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Map not available</p>
                      <p className="text-sm">Mapbox token required</p>
                    </div>
                  </div>
                )}
              </div>

              {neighborhood && typeof neighborhood === 'object' && (
                <div className="bg-secondary p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Neighborhood</h4>
                  <p className="text-muted-foreground">{neighborhood.name}</p>
                  {neighborhood.description && (
                    <p className="text-sm text-muted-foreground mt-1">{neighborhood.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Control Panel - Top */}
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-between px-4">
              <div className="flex gap-2">
                {/* Zoom Button */}
                <button
                  onClick={toggleZoom}
                  className="p-2 bg-card shadow-theme-md text-card-foreground rounded-full hover:bg-card/90 transition-colors"
                  aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
                
                {/* Move Indicator - Only show when zoomed */}
                {isZoomed && (
                  <div className="p-2 bg-card shadow-theme-md text-card-foreground rounded-full flex items-center gap-1">
                    <Move className="w-5 h-5" />
                    <span className="text-xs font-medium hidden sm:inline">Drag to move</span>
                  </div>
                )}
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="p-2 bg-card shadow-theme-md text-card-foreground rounded-full hover:bg-card/90 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-card shadow-theme-md text-card-foreground rounded-full hover:bg-card/90 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-card shadow-theme-md text-card-foreground rounded-full hover:bg-card/90 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card shadow-theme-md text-card-foreground px-4 py-2 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {allImages.length}
            </div>

            {/* Main Image Container */}
            <div 
              ref={imageContainerRef}
              className={cn(
                'max-w-full max-h-full overflow-hidden',
                isZoomed ? 'cursor-move' : 'cursor-zoom-in',
              )}
              style={{
                touchAction: isZoomed ? 'none' : 'auto',
              }}
              onClick={isZoomed ? undefined : toggleZoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {typeof allImages[currentImageIndex] !== 'string' && (
                <div 
                  className={cn(
                    'transition-transform',
                    isZoomed ? 'scale-150' : 'scale-100'
                  )}
                  style={{
                    transform: isZoomed ? `scale(1.5) translate(${position.x}px, ${position.y}px)` : 'scale(1)',
                  }}
                >
                  <Media
                    resource={allImages[currentImageIndex]}
                    className="max-w-full max-h-full object-contain"
                    imgClassName="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
