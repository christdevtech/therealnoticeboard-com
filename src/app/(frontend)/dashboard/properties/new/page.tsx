import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User, Amenity, Neighborhood } from '@/payload-types'
import { PropertyUploadForm } from './PropertyUploadForm.client'
import Link from 'next/link'

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
                    Add New Property
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Add New Property</h1>
              <p className="text-muted-foreground mt-2">
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
    </div>
  )
}
