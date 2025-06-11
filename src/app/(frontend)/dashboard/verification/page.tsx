import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { VerificationContent } from './VerificationContent.client'
import type { User } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Identity Verification | The Real Notice Board',
  description: 'Complete your identity verification to start listing properties.',
}

export default async function VerificationPage() {
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

  // Check if user already has a verification request
  let existingRequest = null
  try {
    const requests = await payload.find({
      collection: 'verification-requests',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1,
    })
    
    if (requests.docs.length > 0) {
      existingRequest = requests.docs[0]
    }
  } catch (error) {
    console.error('Error fetching verification request:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VerificationContent user={user as User} existingRequest={existingRequest} />
    </div>
  )
}