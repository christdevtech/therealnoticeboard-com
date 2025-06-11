import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { VerificationRequestsList } from './VerificationRequestsList.client'
import type { User } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Verification Requests | Admin Dashboard',
  description: 'Review and manage user verification requests.',
}

export default async function VerificationRequestsPage() {
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

  // Redirect to dashboard if not admin
  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all verification requests
  const verificationRequests = await payload.find({
    collection: 'verification-requests',
    sort: '-submittedAt',
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
          <p className="text-gray-600 mt-1">Review and manage user identity verification requests</p>
        </div>
        
        <VerificationRequestsList 
          user={user as User} 
          initialRequests={verificationRequests.docs}
        />
      </div>
    </div>
  )
}