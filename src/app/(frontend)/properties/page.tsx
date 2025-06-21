import type { Metadata } from 'next'
import type { Where } from 'payload'
import { PropertyCollectionArchive } from '@/components/PropertyCollectionArchive'
import { PropertyFilters } from '@/components/PropertyFilters'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'
export const revalidate = 600

type Props = {
  searchParams: Promise<{
    page?: string
    propertyType?: string
    listingType?: string
    neighborhood?: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
    sort?: string
  }>
}

export default async function Page({ searchParams }: Props) {
  const {
    page = '1',
    propertyType,
    listingType,
    neighborhood,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    sort = '-createdAt',
  } = await searchParams

  const currentPage = parseInt(page, 10)
  const limit = 12

  const payload = await getPayload({ config: configPromise })

  // Fetch neighborhoods for filters
  const neighborhoods = await payload.find({
    collection: 'neighborhoods',
    limit: 1000,
    select: {
      id: true,
      name: true,
    },
  })

  // Build where conditions with proper typing
  const whereConditions: Where = {
    status: {
      equals: 'approved',
    },
  }

  // Property type filter
  if (propertyType && propertyType !== 'all') {
    whereConditions.propertyType = {
      equals: propertyType,
    }
  }

  // Listing type filter
  if (listingType && listingType !== 'all') {
    whereConditions.listingType = {
      equals: listingType,
    }
  }

  // Neighborhood filter (relationship field)
  if (neighborhood && neighborhood !== 'all') {
    whereConditions.neighborhood = {
      equals: neighborhood,
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    const priceConditions: any = {}
    if (minPrice) {
      priceConditions.greater_than_equal = parseInt(minPrice, 10)
    }
    if (maxPrice) {
      priceConditions.less_than_equal = parseInt(maxPrice, 10)
    }
    whereConditions.price = priceConditions
  }

  // Area range filter
  if (minArea || maxArea) {
    const areaConditions: any = {}
    if (minArea) {
      areaConditions.greater_than_equal = parseInt(minArea, 10)
    }
    if (maxArea) {
      areaConditions.less_than_equal = parseInt(maxArea, 10)
    }
    whereConditions.area = areaConditions
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit,
    page: currentPage,
    overrideAccess: false,
    where: whereConditions,
    sort,
    select: {
      title: true,
      slug: true,
      description: true,
      propertyType: true,
      listingType: true,
      price: true,
      area: true,
      images: true,
      neighborhood: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Properties</h1>
          <p>Find your perfect property from our extensive collection of residential, commercial, industrial, and land listings.</p>
        </div>
      </div>

      <PropertyFilters neighborhoods={neighborhoods.docs} />

      <div className="container mb-8">
        <PageRange
          collection="properties"
          currentPage={properties.page}
          limit={limit}
          totalDocs={properties.totalDocs}
        />
      </div>

      <PropertyCollectionArchive properties={properties.docs} />

      <div className="container">
        {properties.totalPages > 1 && properties.page && (
          <Pagination page={properties.page} totalPages={properties.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Properties - Find Your Perfect Property`,
    description: 'Browse our extensive collection of properties including residential, commercial, industrial, and land listings.',
  }
}