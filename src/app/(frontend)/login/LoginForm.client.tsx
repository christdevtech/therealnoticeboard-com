'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface ResendState {
  isResending: boolean
  resendSuccess: boolean
  resendError?: string
}

export function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)
  const [resendState, setResendState] = useState<ResendState>({
    isResending: false,
    resendSuccess: false,
  })
  const router = useRouter()

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setShowResendOption(false)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
        return
      }

      // If response is not ok, throw an error with response data
      const errorData = await response.json()
      const error = new Error(errorData.message || 'Request failed')
      ;(error as any).response = response
      ;(error as any).data = errorData
      // console.log('Checking if I can see this in any console or terminal', errorData)
      throw error
    } catch (error: any) {
      // Handle all errors here
      if (error.response && error.data) {
        const { response, data } = error

        // Handle different error types based on status and error data
        if (response.status === 401) {
          const errorMessage =
            data.errors?.[0]?.message || data.message || 'Invalid email or password'
          setErrors({ general: errorMessage })
        } else if (response.status === 403) {
          const errorMessage = data.errors?.[0]?.message || data.message || 'Access denied'

          // Check if this is an UnverifiedEmail error by looking at the message content
          if (
            errorMessage.toLowerCase().includes('verify your email') ||
            errorMessage.toLowerCase().includes('email verification') ||
            data.name === 'UnverifiedEmail' ||
            data.type === 'UnverifiedEmail'
          ) {
            setErrors({
              general: errorMessage,
            })
            setShowResendOption(true)
          } else {
            setErrors({ general: errorMessage })
          }
        } else {
          const errorMessage =
            data.errors?.[0]?.message || data.message || 'An error occurred. Please try again.'
          setErrors({ general: errorMessage })
        }
      } else {
        // Handle network or parsing errors
        setErrors({
          general: error.message || 'An error occurred. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
      setShowResendOption(false)
    }
  }

  const handleResendVerification = async () => {
    setResendState({ isResending: true, resendSuccess: false })

    try {
      const response = await fetch('/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email')
      }

      setResendState({
        isResending: false,
        resendSuccess: true,
      })

      // Clear the resend success message after 5 seconds
      setTimeout(() => {
        setResendState((prev) => ({ ...prev, resendSuccess: false }))
      }, 5000)
    } catch (error) {
      setResendState({
        isResending: false,
        resendSuccess: false,
        resendError: error instanceof Error ? error.message : 'Failed to resend verification email',
      })

      // Clear the error after 5 seconds
      setTimeout(() => {
        setResendState((prev) => ({ ...prev, resendError: undefined }))
      }, 5000)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      <form onSubmit={handleSubmit} className="p-8">
        {errors.general && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{errors.general}</p>
            {showResendOption && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&rsquo;t receive the verification email?
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendState.isResending}
                  className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendState.isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}
          </div>
        )}

        {resendState.resendSuccess && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-success text-sm">
              Verification email sent successfully! Please check your inbox.
            </p>
          </div>
        )}

        {resendState.resendError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{resendState.resendError}</p>
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
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors bg-input text-input-foreground ${
                errors.email ? 'border-destructive bg-destructive/10' : 'border-border'
              }`}
              placeholder="Enter your email address"
              autoFocus
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors pr-12 bg-input text-input-foreground ${
                  errors.password ? 'border-destructive bg-destructive/10' : 'border-border'
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary-hover focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>

      <div className="px-8 py-4 bg-muted border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
