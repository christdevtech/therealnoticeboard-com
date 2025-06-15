import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect, notFound } from 'next/navigation'
import { AdminPropertyDetail } from './AdminPropertyDetail.client'
import { headers as nextHeaders } from 'next/headers'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminPropertyDetailPage({ params }: PageProps) {
  const payload = await getPayload({ config: configPromise })
  const { id } = await params
  const headers = await nextHeaders()
  // Get current user
  const { user } = await payload.auth({ headers })

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  try {
    // Fetch property with full details
    const property = await payload.findByID({
      collection: 'properties',
      id,
      depth: 3,
    })

    if (!property) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <AdminPropertyDetail property={property} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    notFound()
  }
}
