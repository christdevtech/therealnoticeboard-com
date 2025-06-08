import { Metadata } from 'next'
import { ResetPasswordForm } from './ResetPasswordForm.client'

export const metadata: Metadata = {
  title: 'Reset Password | The Real Notice Board',
  description: 'Create a new password for your account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
