'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


interface PropertyFiltersProps {
  neighborhoods?: Array<{ id: string; name: string }>
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ neighborhoods = [] }) => {
  const router = useRouter()
  const searchParams = useSearchParams()


  // Filter states
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'all')
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all')
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || 'all')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minArea, setMinArea] = useState(searchParams.get('minArea') || '')
  const [maxArea, setMaxArea] = useState(searchParams.get('maxArea') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt')

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (propertyType !== 'all') params.set('propertyType', propertyType)
    if (listingType !== 'all') params.set('listingType', listingType)
    if (neighborhood !== 'all') params.set('neighborhood', neighborhood)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minArea) params.set('minArea', minArea)
    if (maxArea) params.set('maxArea', maxArea)
    if (sort !== '-createdAt') params.set('sort', sort)
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    const queryString = params.toString()
    router.push(`/properties${queryString ? `?${queryString}` : ''}`)
  }

  // Clear all filters
  const clearFilters = () => {
    setPropertyType('all')
    setListingType('all')
    setNeighborhood('all')
    setMinPrice('')
    setMaxPrice('')
    setMinArea('')
    setMaxArea('')
    setSort('-createdAt')
    router.push('/properties')
  }

  // Check if any filters are active
  const hasActiveFilters = 
    propertyType !== 'all' ||
    listingType !== 'all' ||
    neighborhood !== 'all' ||
    minPrice ||
    maxPrice ||
    minArea ||
    maxArea ||
    sort !== '-createdAt'



  return (
    <div className="container mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Quick Filters */}
          <div className="flex items-center gap-4">
            <Select value={propertyType} onValueChange={(value) => {
              setPropertyType(value)
              // Auto-apply on desktop
              const params = new URLSearchParams(searchParams)
              if (value !== 'all') {
                params.set('propertyType', value)
              } else {
                params.delete('propertyType')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Select value={listingType} onValueChange={(value) => {
              setListingType(value)
              const params = new URLSearchParams(searchParams)
              if (value !== 'all') {
                params.set('listingType', value)
              } else {
                params.delete('listingType')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Listing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            {neighborhoods && neighborhoods.length > 0 && (
              <Select value={neighborhood} onValueChange={(value) => {
                setNeighborhood(value)
                const params = new URLSearchParams(searchParams)
                if (value !== 'all') {
                  params.set('neighborhood', value)
                } else {
                  params.delete('neighborhood')
                }
                params.delete('page')
                router.push(`/properties?${params.toString()}`)
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sort} onValueChange={(value) => {
              setSort(value)
              const params = new URLSearchParams(searchParams)
              if (value !== '-createdAt') {
                params.set('sort', value)
              } else {
                params.delete('sort')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest</SelectItem>
                <SelectItem value="price">Price ↑</SelectItem>
                <SelectItem value="-price">Price ↓</SelectItem>
                <SelectItem value="area">Area ↑</SelectItem>
                <SelectItem value="-area">Area ↓</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}