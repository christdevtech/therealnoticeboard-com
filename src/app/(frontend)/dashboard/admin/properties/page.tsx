import React from 'react'
import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { AdminPropertiesList } from './AdminPropertiesList.client'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    owner?: string
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
    owner = 'all',
    propertyType = 'all',
    listingType = 'all',
  } = params

  const currentPage = parseInt(page, 10)
  const limit = 20

  // Build query conditions
  const where: Where = {}

  if (status !== 'all') {
    where.status = { equals: status }
  }

  if (owner !== 'all') {
    where.owner = { equals: owner }
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

  // Fetch users for owner filtering
  const usersResult = await payload.find({
    collection: 'users',
    limit: 1000,
    sort: 'name',
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="sr-only">Home</span>
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-muted-foreground">
                    Property Management
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Property Management</h1>
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
          users={usersResult.docs}
          initialFilters={{
            status,
            owner,
            propertyType,
            listingType,
          }}
        />
      </div>
    </div>
  )
}
