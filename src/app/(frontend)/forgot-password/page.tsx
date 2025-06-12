import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ForgotPasswordForm } from './ForgotPasswordForm.client'

export const metadata: Metadata = {
  title: 'Forgot Password | The Real Notice Board',
  description: 'Reset your password to regain access to your account.',
}

export default async function ForgotPasswordPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Check if user is already authenticated
  const { user } = await payload.auth({ headers: requestHeaders })

  // Redirect authenticated users to dashboard
  if (user && user._verified) {
    redirect('/dashboard')
  }

  return (
    <div className="pt-24 pb-24 min-h-[60vh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
