import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User, Amenity, Neighborhood } from '@/payload-types'
import { PropertyUploadForm } from './PropertyUploadForm.client'

export const metadata: Metadata = {
  title: 'Add New Property | The Real Notice Board',
  description: 'List your property on The Real Notice Board to reach potential buyers and renters.',
}

export default async function NewPropertyPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate using Payload's local API
  const { user } = await payload.auth({ headers: requestHeaders })

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Redirect to login if email is not verified
  if (!user._verified) {
    redirect('/login?error=unverified')
  }

  // Check if user is verified to upload properties
  if (user.verificationStatus !== 'verified') {
    redirect('/dashboard?error=verification-required')
  }

  // Fetch amenities and neighborhoods for the form
  const [amenitiesResult, neighborhoodsResult] = await Promise.all([
    payload.find({
      collection: 'amenities',
      limit: 1000,
      sort: 'name',
    }),
    payload.find({
      collection: 'neighborhoods',
      limit: 1000,
      sort: 'name',
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-2">
              Fill in the details below to list your property on The Real Notice Board.
            </p>
          </div>

          <PropertyUploadForm
            user={user as User}
            amenities={amenitiesResult.docs as Amenity[]}
            neighborhoods={neighborhoodsResult.docs as Neighborhood[]}
          />
        </div>
      </div>
    </div>
  )
}
