import { Metadata } from 'next'
import { VerifyEmailForm } from './VerifyEmailForm.client'

export const metadata: Metadata = {
  title: 'Verify Email | The Real Notice Board',
  description: 'Verify your email address to activate your account.',
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">Activating your account...</p>
        </div>
        <VerifyEmailForm />
      </div>
    </div>
  )
}
