'use client'

import React, { useState, useEffect } from 'react'
import { User, VerificationRequest } from '@/payload-types'
import Link from 'next/link'

// interface VerificationRequest {
//   id: string
//   userName: string
//   userEmail: string
//   phone: string
//   address: string
//   status: 'pending' | 'approved' | 'rejected'
//   submittedAt: string
//   reviewedAt?: string
//   adminNotes?: string
//   identificationDocument: {
//     id: string
//     filename: string
//     url: string
//   }
//   selfieWithId: {
//     id: string
//     filename: string
//     url: string
//   }
// }

interface AdminVerificationPanelProps {
  user: User
}

export const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/verification-requests?status=pending', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification requests')
      }
      
      const data = await response.json()
      setPendingRequests(data.docs || [])
    } catch (error) {
      console.error('Error fetching verification requests:', error)
      setError('Failed to load verification requests')
    } finally {
      setLoading(false)
    }
  }

  if (user.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg mr-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verification Requests</h2>
            <p className="text-sm text-gray-600">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {pendingRequests.length > 0 && (
          <Link
            href="/dashboard/admin/verification-requests"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Review All
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No pending verification requests</p>
          <p className="text-sm text-gray-400 mt-1">All verification requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-gray-900 mr-2">{request.userName}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{request.userEmail}</p>
                  <p className="text-xs text-gray-500">
                    Submitted {request.submittedAt && new Date(request.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/dashboard/admin/verification-requests/${request.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
          
          {pendingRequests.length > 3 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                href="/dashboard/admin/verification-requests"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View {pendingRequests.length - 3} more pending request{pendingRequests.length - 3 !== 1 ? 's' : ''}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}