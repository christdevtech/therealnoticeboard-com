'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'all')
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || 'all')
  const [propertyCondition, setPropertyCondition] = useState(
    searchParams.get('propertyCondition') || 'all',
  )
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Validation functions for interdependent ranges
  const validatePriceRange = (min: string, max: string) => {
    if (!min || !max) return true
    const minVal = parseFloat(min)
    const maxVal = parseFloat(max)
    return minVal <= maxVal
  }

  const validateAreaRange = (min: string, max: string) => {
    if (!min || !max) return true
    const minVal = parseFloat(min)
    const maxVal = parseFloat(max)
    return minVal <= maxVal
  }

  // Handle price input changes with validation
  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
    if (maxPrice && value && !validatePriceRange(value, maxPrice)) {
      setMaxPrice('')
    }
  }

  const handleMaxPriceChange = (value: string) => {
    if (!minPrice || validatePriceRange(minPrice, value)) {
      setMaxPrice(value)
    }
  }

  // Handle area input changes with validation
  const handleMinAreaChange = (value: string) => {
    setMinArea(value)
    if (maxArea && value && !validateAreaRange(value, maxArea)) {
      setMaxArea('')
    }
  }

  const handleMaxAreaChange = (value: string) => {
    if (!minArea || validateAreaRange(minArea, value)) {
      setMaxArea(value)
    }
  }

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
    if (bedrooms !== 'all') params.set('bedrooms', bedrooms)
    if (bathrooms !== 'all') params.set('bathrooms', bathrooms)
    if (propertyCondition !== 'all') params.set('propertyCondition', propertyCondition)
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
    setBedrooms('all')
    setBathrooms('all')
    setPropertyCondition('all')
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
    bedrooms !== 'all' ||
    bathrooms !== 'all' ||
    propertyCondition !== 'all' ||
    sort !== '-createdAt'

  // Check if advanced filters are active
  const hasAdvancedFilters =
    minPrice ||
    maxPrice ||
    minArea ||
    maxArea ||
    bedrooms !== 'all' ||
    bathrooms !== 'all' ||
    propertyCondition !== 'all'

  return (
    <div className="container mb-8">
      <div className="space-y-4">
        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={propertyType}
            onValueChange={(value) => {
              setPropertyType(value)
              const params = new URLSearchParams(searchParams)
              if (value !== 'all') {
                params.set('propertyType', value)
              } else {
                params.delete('propertyType')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}
          >
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

          <Select
            value={listingType}
            onValueChange={(value) => {
              setListingType(value)
              const params = new URLSearchParams(searchParams)
              if (value !== 'all') {
                params.set('listingType', value)
              } else {
                params.delete('listingType')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}
          >
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
            <Select
              value={neighborhood}
              onValueChange={(value) => {
                setNeighborhood(value)
                const params = new URLSearchParams(searchParams)
                if (value !== 'all') {
                  params.set('neighborhood', value)
                } else {
                  params.delete('neighborhood')
                }
                params.delete('page')
                router.push(`/properties?${params.toString()}`)
              }}
            >
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

          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value)
              const params = new URLSearchParams(searchParams)
              if (value !== '-createdAt') {
                params.set('sort', value)
              } else {
                params.delete('sort')
              }
              params.delete('page')
              router.push(`/properties?${params.toString()}`)
            }}
          >
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

          {/* Advanced Filters Toggle */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={hasAdvancedFilters ? 'bg-primary/10 border-primary' : ''}
              >
                <Filter className="w-4 h-4 mr-1" />
                More Filters
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Advanced Filters</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Price Range (XAF)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        className="text-sm"
                        min={minPrice || undefined}
                      />
                    </div>
                  </div>
                  {minPrice && maxPrice && !validatePriceRange(minPrice, maxPrice) && (
                    <p className="text-xs text-destructive">Min price cannot exceed max price</p>
                  )}
                </div>

                {/* Area Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Area Range (m²)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minArea}
                        onChange={(e) => handleMinAreaChange(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxArea}
                        onChange={(e) => handleMaxAreaChange(e.target.value)}
                        className="text-sm"
                        min={minArea || undefined}
                      />
                    </div>
                  </div>
                  {minArea && maxArea && !validateAreaRange(minArea, maxArea) && (
                    <p className="text-xs text-destructive">Min area cannot exceed max area</p>
                  )}
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Bedrooms</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Bathrooms</Label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Condition */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Condition</Label>
                  <Select value={propertyCondition} onValueChange={setPropertyCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Condition</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={applyFilters} className="px-6">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
