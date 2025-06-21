import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import {
  MapPin,
  Home,
  DollarSign,
  Square,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  User,
  Eye,
  Bed,
  Bath,
  Building,
  Shield,
  Heart,
  Share2,
} from 'lucide-react'

import type { Property } from '@/payload-types'

import { PropertyHero } from '@/heros/PropertyHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const properties = await payload.find({
    collection: 'properties',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: {
      status: {
        equals: 'approved',
      },
    },
    select: {
      slug: true,
    },
  })

  const params = properties.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Property({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/properties/' + slug
  const property: Property | null = await queryPropertyBySlug({ slug })

  if (!property) return <PayloadRedirects url={url} />

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

  // Get amenity icon
  // const getAmenityIcon = (amenityName: string) => {
  //   const iconMap: { [key: string]: React.ReactNode } = {
  //     'Wi-Fi': <Wifi className="w-4 h-4" />,
  //     Security: <Shield className="w-4 h-4" />,
  //     Electricity: <Zap className="w-4 h-4" />,
  //     Water: <Droplets className="w-4 h-4" />,
  //     Parking: <Car className="w-4 h-4" />,
  //     Generator: <Zap className="w-4 h-4" />,
  //   }
  //   return iconMap[amenityName] || <Home className="w-4 h-4" />
  // }

  return (
    <article className="">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PropertyHero property={property} />

      <div className="bg-secondary py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {property.description && (
                <div className="bg-card rounded-lg p-6 shadow-theme-sm border border-card">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">About This Property</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Property Features Grid */}
              <div className="bg-card rounded-lg p-6 shadow-theme-sm border border-card">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Home className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold text-foreground">
                        {getPropertyTypeLabel(property.propertyType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <DollarSign className="w-6 h-6 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Listing</p>
                      <p className="font-semibold text-foreground">
                        {getListingTypeLabel(property.listingType)}
                      </p>
                    </div>
                  </div>

                  {property.area && (
                    <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                      <Square className="w-6 h-6 text-accent-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="font-semibold text-foreground">{formatArea(property.area)}</p>
                      </div>
                    </div>
                  )}

                  {property.neighborhood && typeof property.neighborhood === 'object' && (
                    <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                      <MapPin className="w-6 h-6 text-destructive" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground">
                          {property.neighborhood.name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Calendar className="w-6 h-6 text-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">Listed</p>
                      <p className="font-semibold text-foreground">
                        {formatDateTime(property.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Property-specific features */}
                  {property.propertyType === 'residential' && property.residentialFeatures && (
                    <>
                      {property.residentialFeatures.bedrooms && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Bed className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Bedrooms</p>
                            <p className="font-semibold text-foreground">
                              {property.residentialFeatures.bedrooms}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.residentialFeatures.bathrooms && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Bath className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Bathrooms</p>
                            <p className="font-semibold text-foreground">
                              {property.residentialFeatures.bathrooms}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.residentialFeatures.floors && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Building className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Floors</p>
                            <p className="font-semibold text-foreground">
                              {property.residentialFeatures.floors}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.residentialFeatures.yearBuilt && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Calendar className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Year Built</p>
                            <p className="font-semibold text-foreground">
                              {property.residentialFeatures.yearBuilt}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {property.propertyType === 'commercial' && property.commercialFeatures && (
                    <>
                      {property.commercialFeatures.businessType && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Building className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Business Type</p>
                            <p className="font-semibold text-foreground">
                              {property.commercialFeatures.businessType}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.commercialFeatures.offices && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Home className="w-6 h-6 text-success" />
                          <div>
                            <p className="text-sm text-muted-foreground">Offices</p>
                            <p className="font-semibold text-foreground">
                              {property.commercialFeatures.offices}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.commercialFeatures.floors && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Building className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Floors</p>
                            <p className="font-semibold text-foreground">
                              {property.commercialFeatures.floors}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.commercialFeatures.yearBuilt && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Calendar className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Year Built</p>
                            <p className="font-semibold text-foreground">
                              {property.commercialFeatures.yearBuilt}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {property.propertyType === 'industrial' && property.industrialFeatures && (
                    <>
                      {property.industrialFeatures.industrialType && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Building className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Industrial Type</p>
                            <p className="font-semibold text-foreground">
                              {property.industrialFeatures.industrialType}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.industrialFeatures.ceilingHeight && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Square className="w-6 h-6 text-accent" />
                          <div>
                            <p className="text-sm text-muted-foreground">Ceiling Height</p>
                            <p className="font-semibold text-foreground">
                              {property.industrialFeatures.ceilingHeight}m
                            </p>
                          </div>
                        </div>
                      )}
                      {property.industrialFeatures.loadingDocks && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Home className="w-6 h-6 text-warning" />
                          <div>
                            <p className="text-sm text-muted-foreground">Loading Docks</p>
                            <p className="font-semibold text-foreground">
                              {property.industrialFeatures.loadingDocks}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.industrialFeatures.yearBuilt && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Calendar className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Year Built</p>
                            <p className="font-semibold text-foreground">
                              {property.industrialFeatures.yearBuilt}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {property.propertyType === 'land' && property.landFeatures && (
                    <>
                      {property.landFeatures.landType && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <Square className="w-6 h-6 text-success" />
                          <div>
                            <p className="text-sm text-muted-foreground">Land Type</p>
                            <p className="font-semibold text-foreground">
                              {property.landFeatures.landType}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.landFeatures.topography && (
                        <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                          <MapPin className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Topography</p>
                            <p className="font-semibold text-foreground">
                              {property.landFeatures.topography}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-theme-sm border border-card">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => {
                      if (typeof amenity === 'object' && amenity.name) {
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                          >
                            {amenity.icon && (
                              <Media resource={amenity.icon} className="w-8 h-8 text-success" />
                            )}
                            <span className="font-medium text-foreground">{amenity.name}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}

              {/* Property Images Gallery
              {property.images && property.images.length > 1 && (
                <div className="bg-card rounded-lg p-6 shadow-theme-sm border border-card">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.slice(1).map((image, index) => {
                      if (typeof image !== 'string') {
                        return (
                          <div
                            key={index}
                            className="relative aspect-[4/3] rounded-lg overflow-hidden hover:shadow-theme-md transition-shadow"
                          >
                            <Media resource={image} fill className="w-full h-full object-cover" />
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )} */}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Price Card */}
                <div className="bg-card border border-card rounded-lg p-6 shadow-theme-sm">
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-success mb-2">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-muted-foreground">
                      {getListingTypeLabel(property.listingType)}
                    </p>
                  </div>

                  {/* Express Interest CTA */}
                  <div className="mb-6">
                    <button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors mb-3">
                      <Heart className="w-4 h-4 inline mr-2" />
                      Express Interest
                    </button>
                    <button className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Property
                    </button>
                  </div>

                  {/* Contact Information */}
                  {property.owner && typeof property.owner === 'object' && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4" />
                        Contact Owner
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {property.owner.name || 'Property Owner'}
                            </p>
                            <p className="text-sm text-muted-foreground">Property Owner</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {property.contactInfo?.phone && (
                            <a
                              href={`tel:${property.contactInfo.phone}`}
                              className="flex items-center gap-3 p-3 bg-secondary rounded-lg text-secondary-foreground hover:bg-secondary-hover transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">{property.contactInfo.phone}</span>
                            </a>
                          )}

                          {property.contactInfo?.email && (
                            <a
                              href={`mailto:${property.contactInfo.email}`}
                              className="flex items-center gap-3 p-3 bg-secondary rounded-lg text-secondary-foreground hover:bg-secondary-hover transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              <span className="font-medium">{property.contactInfo.email}</span>
                            </a>
                          )}

                          {property.contactInfo?.whatsapp && (
                            <a
                              href={`https://wa.me/${property.contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-success/10 rounded-lg text-success hover:bg-success/20 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="font-medium">WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Stats */}
                <div className="bg-card border border-card rounded-lg p-6 shadow-theme-sm">
                  <h3 className="font-semibold mb-4 text-foreground">Property Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Views
                      </span>
                      <span className="font-medium text-foreground">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Interested
                      </span>
                      <span className="font-medium text-foreground">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Days Listed
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.floor(
                          (new Date().getTime() - new Date(property.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Notice - Dynamic based on property status */}
                {property.status === 'approved' ? (
                  <div className="bg-success border border-success/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="aspect-square border border-success-foreground rounded-full p-1">
                        <Shield className="w-5 h-5 text-success-foreground mt-0.5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-success-foreground mb-1">
                          Verified Property
                        </h4>
                        <p className="text-sm text-success-foreground">
                          This property has been verified by our team. You can proceed with
                          confidence, but always meet in safe, public locations for viewings.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-warning border border-warning/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="aspect-square border border-warning-foreground rounded-full p-1">
                        <Shield className="w-5 h-5 text-warning-foreground mt-0.5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-warning-foreground mb-1">
                          Unverified Property
                        </h4>
                        <p className="text-sm text-warning-foreground">
                          This property is still pending verification. We advise you to only verify
                          property details and meet in safe, public locations. Never send money
                          without viewing the property.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const property = await queryPropertyBySlug({ slug })

  return generateMeta({ doc: property })
}

const queryPropertyBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'properties',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(!draft
          ? [
              {
                status: {
                  equals: 'approved',
                },
              },
            ]
          : []),
      ],
    },
  })

  return result.docs?.[0] || null
})
