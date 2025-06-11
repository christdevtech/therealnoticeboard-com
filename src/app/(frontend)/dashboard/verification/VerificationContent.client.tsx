'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/payload-types'
import Link from 'next/link'

interface VerificationContentProps {
  user: User
  existingRequest: any
}

export const VerificationContent: React.FC<VerificationContentProps> = ({ user, existingRequest }) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phone: user.phone || '',
    address: user.address || '',
    identificationDocument: null as File | null,
    selfieWithId: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
      // Clear error when user selects file
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.identificationDocument && !existingRequest) {
      newErrors.identificationDocument = 'Identification document is required'
    }

    if (!formData.selfieWithId && !existingRequest) {
      newErrors.selfieWithId = 'Selfie with ID is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }

    const result = await response.json()
    return result.doc.id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      let identificationDocumentId = existingRequest?.identificationDocument?.id
      let selfieWithIdId = existingRequest?.selfieWithId?.id

      // Upload new files if provided
      if (formData.identificationDocument) {
        identificationDocumentId = await uploadFile(formData.identificationDocument)
      }

      if (formData.selfieWithId) {
        selfieWithIdId = await uploadFile(formData.selfieWithId)
      }

      const requestData = {
        user: user.id,
        userName: user.name,
        userEmail: user.email,
        phone: formData.phone,
        address: formData.address,
        identificationDocument: identificationDocumentId,
        selfieWithId: selfieWithIdId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }

      let response
      if (existingRequest) {
        // Update existing request
        response = await fetch(`/api/verification-requests/${existingRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include',
        })
      } else {
        // Create new request
        response = await fetch('/api/verification-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include',
        })
      }

      if (!response.ok) {
        throw new Error('Failed to submit verification request')
      }

      // Update user's verification status to pending
      await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationStatus: 'pending',
        }),
        credentials: 'include',
      })

      setSubmitMessage('Verification request submitted successfully! You will receive an email once your documents are reviewed.')
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error) {
      console.error('Error submitting verification request:', error)
      setSubmitMessage('Failed to submit verification request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is already verified, show success message
  if (user.verificationStatus === 'verified') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified</h1>
          <p className="text-gray-600 mb-6">Your identity has been successfully verified. You can now list properties on The Real Notice Board.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show pending status if request exists and is pending
  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
          <p className="text-gray-600 mb-6">Your verification request is currently being reviewed. You will receive an email once the review is complete.</p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Submitted: {new Date(existingRequest.submittedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show rejection message and allow resubmission
  if (existingRequest && existingRequest.status === 'rejected') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Rejected</h1>
            <p className="text-gray-600 mb-4">Your previous verification request was rejected. Please review the feedback below and submit new documents.</p>
            {existingRequest.adminNotes && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h3 className="font-medium text-red-800 mb-2">Admin Feedback:</h3>
                <p className="text-red-700">{existingRequest.adminNotes}</p>
              </div>
            )}
          </div>
          
          {/* Show the form for resubmission */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New Verification Documents</h2>
            
            {/* Rest of the form content will be the same as below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="identificationDocument" className="block text-sm font-medium text-gray-700 mb-2">
                  Identification Document *
                </label>
                <input
                  type="file"
                  id="identificationDocument"
                  name="identificationDocument"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.identificationDocument ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Upload a clear photo of your ID card, passport, or driver's license</p>
                {errors.identificationDocument && <p className="text-red-500 text-sm mt-1">{errors.identificationDocument}</p>}
              </div>

              <div>
                <label htmlFor="selfieWithId" className="block text-sm font-medium text-gray-700 mb-2">
                  Selfie with ID *
                </label>
                <input
                  type="file"
                  id="selfieWithId"
                  name="selfieWithId"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.selfieWithId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">Upload a selfie holding your identification document</p>
                {errors.selfieWithId && <p className="text-red-500 text-sm mt-1">{errors.selfieWithId}</p>}
              </div>
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-md ${
                submitMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {submitMessage}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Resubmit Verification'}
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Default form for new verification request
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
          <p className="text-gray-600">
            To ensure the safety and security of our platform, we require identity verification before you can list properties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="identificationDocument" className="block text-sm font-medium text-gray-700 mb-2">
                Identification Document *
              </label>
              <input
                type="file"
                id="identificationDocument"
                name="identificationDocument"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.identificationDocument ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">Upload a clear photo of your ID card, passport, or driver's license</p>
              {errors.identificationDocument && <p className="text-red-500 text-sm mt-1">{errors.identificationDocument}</p>}
            </div>

            <div>
              <label htmlFor="selfieWithId" className="block text-sm font-medium text-gray-700 mb-2">
                Selfie with ID *
              </label>
              <input
                type="file"
                id="selfieWithId"
                name="selfieWithId"
                onChange={handleFileChange}
                accept="image/*"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.selfieWithId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">Upload a selfie holding your identification document</p>
              {errors.selfieWithId && <p className="text-red-500 text-sm mt-1">{errors.selfieWithId}</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-800 mb-2">Verification Process:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your documents will be reviewed by our admin team</li>
              <li>• You will receive an email notification once the review is complete</li>
              <li>• Verification typically takes 1-3 business days</li>
              <li>• Once verified, you can start listing properties immediately</li>
            </ul>
          </div>

          {submitMessage && (
            <div className={`p-4 rounded-md ${
              submitMessage.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {submitMessage}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}