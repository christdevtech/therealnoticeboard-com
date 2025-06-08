'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Invalid or missing verification token.')
      setIsLoading(false)
      return
    }

    setToken(tokenParam)
    verifyEmail(tokenParam)
  }, [searchParams])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/users/verify/${verificationToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.message?.includes('token')) {
          throw new Error('Verification link has expired or is invalid.')
        }
        throw new Error(data.message || 'Failed to verify email')
      }

      setIsSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during verification.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      // This would need to be implemented as a separate endpoint
      // For now, we'll just show a message
      setError('Please contact support to resend verification email.')
    } catch (error) {
      setError('Failed to resend verification email.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
        <p className="text-gray-600">Please wait while we verify your email address...</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email address has been successfully verified. You can now sign in to your account and
          start using The Real Notice Board.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="block w-full text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In Instead
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Account
          </Link>
          <Link
            href="/login"
            className="block w-full text-gray-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          If you continue to have issues, please contact our support team.
        </p>
      </div>
    )
  }

  return null
}
