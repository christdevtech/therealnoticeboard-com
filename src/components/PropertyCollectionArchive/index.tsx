import { cn } from '@/utilities/ui'
import React from 'react'

import { PropertyCard, CardPropertyData } from '@/components/PropertyCard'

export type Props = {
  properties: CardPropertyData[]
}

export const PropertyCollectionArchive: React.FC<Props> = (props) => {
  const { properties } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {properties?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <PropertyCard className="h-full" doc={result} relationTo="properties" showNeighborhood />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}