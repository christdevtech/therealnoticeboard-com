import type { PropertyArchiveBlock as PropertyArchiveBlockProps, Property } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { PropertyCollectionArchive } from '@/components/PropertyCollectionArchive'

export const PropertyArchiveBlock: React.FC<
  PropertyArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { 
    id, 
    propertyTypes, 
    listingTypes, 
    neighborhoods, 
    introContent, 
    limit: limitFromProps, 
    populateBy, 
    selectedDocs 
  } = props

  const limit = limitFromProps || 3

  let properties: Property[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedNeighborhoods = neighborhoods?.map((neighborhood) => {
      if (typeof neighborhood === 'object') return neighborhood.id
      else return neighborhood
    })

    // Build where conditions
    const whereConditions: any = {
      status: {
        equals: 'approved',
      },
    }

    // Add property type filter
    if (propertyTypes && propertyTypes.length > 0) {
      whereConditions.propertyType = {
        in: propertyTypes,
      }
    }

    // Add listing type filter
    if (listingTypes && listingTypes.length > 0) {
      whereConditions.listingType = {
        in: listingTypes,
      }
    }

    // Add neighborhood filter
    if (flattenedNeighborhoods && flattenedNeighborhoods.length > 0) {
      whereConditions.neighborhood = {
        in: flattenedNeighborhoods,
      }
    }

    const fetchedProperties = await payload.find({
      collection: 'properties',
      depth: 1,
      limit,
      where: whereConditions,
      sort: '-createdAt',
    })

    properties = fetchedProperties.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedProperties = selectedDocs.map((property) => {
        if (typeof property.value === 'object') return property.value
      }) as Property[]

      properties = filteredSelectedProperties
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <PropertyCollectionArchive properties={properties} />
    </div>
  )
}