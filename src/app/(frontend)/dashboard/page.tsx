import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DashboardContent } from './DashboardContent.client'
import type { User } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Dashboard | The Real Notice Board',
  description: 'Your personal dashboard to manage properties, inquiries, and account settings.',
}

export default async function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardContent user={user as User} />
    </div>
  )
}
