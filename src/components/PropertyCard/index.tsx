'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'
import { MapPin, Home, DollarSign, Square } from 'lucide-react'

import type { Property } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPropertyData = Pick<
  Property,
  | 'slug'
  | 'title'
  | 'description'
  | 'propertyType'
  | 'listingType'
  | 'price'
  | 'area'
  | 'images'
  | 'neighborhood'
  | 'meta'
>

export const PropertyCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPropertyData
  relationTo?: 'properties'
  showNeighborhood?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showNeighborhood, title: titleFromProps } = props

  const {
    slug,
    title,
    description,
    propertyType,
    listingType,
    price,
    area,
    images,
    neighborhood,
    meta,
  } = doc || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`
  const firstImage = images && Array.isArray(images) && images.length > 0 ? images[0] : null
  const metaImage = meta?.image && typeof meta.image === 'object' ? meta.image : null
  const displayImage = metaImage || firstImage

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

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer transition-all duration-200 hover:shadow-lg',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-[4/3]">
        {!displayImage && (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {displayImage && typeof displayImage !== 'string' && (
          <Media
            resource={displayImage}
            size="33vw"
            fill
            imgClassName="w-full h-full object-cover"
          />
        )}

        {/* Listing type badge */}
        {listingType && (
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full text-primary-foreground',
                listingType === 'sale' ? 'bg-success' : 'bg-primary',
              )}
            >
              {getListingTypeLabel(listingType)}
            </span>
          </div>
        )}

        {/* Property type badge */}
        {propertyType && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-background/70 text-primary-foreground backdrop-blur-sm">
              {getPropertyTypeLabel(propertyType)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Price */}
        {price && (
          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="w-4 h-4 text-success" />
            <span className="text-lg font-bold text-success">{formatPrice(price)}</span>
          </div>
        )}

        {/* Title */}
        {titleToUse && (
          <div className="prose mb-2">
            <h3 className="text-lg font-semibold leading-tight m-0">
              <Link
                className="not-prose hover:text-primary transition-colors"
                href={href}
                ref={link.ref}
              >
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}

        {/* Neighborhood */}
        {showNeighborhood && neighborhood && typeof neighborhood === 'object' && (
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{neighborhood.name}</span>
          </div>
        )}

        {/* Area */}
        {area && (
          <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
            <Square className="w-3 h-3" />
            <span>{formatArea(area)}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            <p className="m-0">{sanitizedDescription}</p>
          </div>
        )}
      </div>
    </article>
  )
}
