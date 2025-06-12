import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SignupForm } from './SignupForm.client'

export const metadata: Metadata = {
  title: 'Sign Up | The Real Notice Board',
  description: 'Create your account to start posting and browsing properties.',
}

export default async function SignupPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Check if user is already authenticated
  const { user } = await payload.auth({ headers: requestHeaders })

  // Redirect authenticated users to dashboard
  if (user && user._verified) {
    redirect('/dashboard')
  }

  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Join The Real Notice Board</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
