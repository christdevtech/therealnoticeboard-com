'use client'

import React, { useState } from 'react'
import { User, VerificationRequest } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { Media } from '@/components/Media'

interface VerificationRequestReviewProps {
  user: User
  verificationRequest: VerificationRequest
}

export const VerificationRequestReview: React.FC<VerificationRequestReviewProps> = ({
  user,
  verificationRequest,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState(verificationRequest.adminNotes || '')
  const [showImageModal, setShowImageModal] = useState<{
    type: 'id' | 'selfie'
    resource: any
  } | null>(null)

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/verification-requests/${verificationRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Redirect back to the list with a success message
        router.push('/dashboard/admin/verification-requests?updated=true')
      } else {
        const errorData = await response.json()
        alert(`Error updating request: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating verification request:', error)
      alert('Error updating verification request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'approved':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(verificationRequest.status)}`}
              >
                {getStatusIcon(verificationRequest.status)}
                <span className="ml-2 capitalize">{verificationRequest.status}</span>
              </div>
              <span className="text-sm text-gray-500">
                Submitted on{' '}
                {verificationRequest.submittedAt &&
                  new Date(verificationRequest.submittedAt).toLocaleDateString()}
              </span>
              {verificationRequest.reviewedAt && (
                <span className="text-sm text-gray-500">
                  • Reviewed on {new Date(verificationRequest.reviewedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {verificationRequest.userName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {verificationRequest.userEmail}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {verificationRequest.phone}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {verificationRequest.address}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identification Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identification Document
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <Media
                    resource={verificationRequest.identificationDocument}
                    alt={verificationRequest.userName || 'Identification Document'}
                    className="object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      setShowImageModal({
                        type: 'id',
                        resource: verificationRequest.identificationDocument,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {typeof verificationRequest.identificationDocument === 'object' &&
                    verificationRequest.identificationDocument.filename}
                </p>
                <button
                  onClick={() =>
                    setShowImageModal({
                      type: 'id',
                      resource: verificationRequest.identificationDocument,
                    })
                  }
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Full Size
                </button>
              </div>
            </div>

            {/* Selfie with ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selfie with ID</label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="aspect-w-16 aspect-h-9 mb-3">
                  <Media
                    resource={verificationRequest.selfieWithId}
                    alt={`${verificationRequest.userName}'s Selfie with ID`}
                    className="object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      setShowImageModal({
                        type: 'selfie',
                        resource: verificationRequest.selfieWithId,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-gray-500">{`${verificationRequest.userName}'s Selfie with ID`}</p>
                <button
                  onClick={() =>
                    setShowImageModal({
                      type: 'selfie',
                      resource: verificationRequest.selfieWithId,
                    })
                  }
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Full Size
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this verification request (optional)..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            These notes will be saved with the request for future reference.
          </p>
        </div>

        {/* Action Buttons */}
        {verificationRequest.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
                ) : (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                Approve Request
              </button>

              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
                ) : (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                Reject Request
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              The user will receive an email notification about your decision.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to List
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Media
              resource={showImageModal.resource}
              alt={showImageModal.type === 'id' ? 'Identification Document' : 'Selfie with ID'}
              className="object-contain max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
