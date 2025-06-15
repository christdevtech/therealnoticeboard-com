import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { AdminPropertiesList } from './AdminPropertiesList.client'
import { headers as nextHeaders } from 'next/headers'

interface PageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    search?: string
    propertyType?: string
    listingType?: string
  }>
}

export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  const payload = await getPayload({ config: configPromise })
  const headers = await nextHeaders()
  // Get current user
  const { user } = await payload.auth({ headers })

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const {
    status = 'all',
    page = '1',
    search = '',
    propertyType = 'all',
    listingType = 'all',
  } = params

  const currentPage = parseInt(page, 10)
  const limit = 20

  // Build query conditions
  const where: any = {}

  if (status !== 'all') {
    where.status = { equals: status }
  }

  if (search) {
    where.or = [{ title: { contains: search } }, { description: { contains: search } }]
  }

  if (propertyType !== 'all') {
    where.propertyType = { equals: propertyType }
  }

  if (listingType !== 'all') {
    where.listingType = { equals: listingType }
  }

  // Fetch properties
  const propertiesResult = await payload.find({
    collection: 'properties',
    where,
    limit,
    page: currentPage,
    sort: '-createdAt',
    depth: 2,
  })

  // Fetch neighborhoods for filtering
  const neighborhoodsResult = await payload.find({
    collection: 'neighborhoods',
    limit: 1000,
    sort: 'name',
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Property Management</h1>
        <p className="text-muted-foreground">
          Manage and review property listings submitted by users
        </p>
      </div>

      <AdminPropertiesList
        properties={propertiesResult.docs}
        totalPages={propertiesResult.totalPages}
        currentPage={currentPage}
        totalDocs={propertiesResult.totalDocs}
        neighborhoods={neighborhoodsResult.docs}
        initialFilters={{
          status,
          search,
          propertyType,
          listingType,
        }}
      />
    </div>
  )
}
