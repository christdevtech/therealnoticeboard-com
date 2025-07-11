'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FormData {
  email: string
}

interface FormErrors {
  email?: string
  general?: string
}

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        return
      }

      // Parse error response
      const errorData = await response.json()

      // Handle different error types based on status and error data
      if (response.status === 404) {
        setErrors({ general: errorData.message || 'No account found with this email address.' })
      } else if (response.status === 400) {
        setErrors({ general: errorData.message || 'Invalid email address.' })
      } else {
        setErrors({ general: errorData.message || 'Failed to send reset email. Please try again.' })
      }
    } catch (error: any) {
      // Handle network or parsing errors
      setErrors({
        general: error.message || 'An error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setFormData({ email: value })
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
        <p className="text-muted-foreground mb-6">
          We have sent a password reset link to <strong>{formData.email}</strong>. Please check your
          inbox and follow the instructions to reset your password.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Back to Login
          </Link>
          <button
            onClick={() => {
              setIsSuccess(false)
              setFormData({ email: '' })
            }}
            className="block w-full text-muted-foreground py-3 px-4 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Try Different Email
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Didn&rsquo;t receive the email? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      <form onSubmit={handleSubmit} className="p-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-input text-input-foreground ${
                errors.email ? 'border-destructive bg-destructive/10' : 'border-border'
              }`}
              placeholder="Enter your email address"
              autoFocus
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email address associated with your account and we will send you a link to
              reset your password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </div>
      </form>

      <div className="px-8 py-4 bg-muted border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
