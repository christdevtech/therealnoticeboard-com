'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { useAuth } from '@/providers/Auth'
import { User } from '@/payload-types'
import Link from 'next/link'
import { AdminVerificationPanel } from './admin/AdminVerificationPanel.client'
// import { AdminVerificationPanel } from './AdminVerificationPanel.client'

interface DashboardContentProps {
  user: User
}

interface DashboardStats {
  totalProperties: number
  totalInquiries: number
  pendingInquiries: number
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  // const { logout } = useAuth()
  const router = useRouter()

  // Mock stats data - in a real app, this would come from the server or API
  const stats: DashboardStats = {
    totalProperties: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
  }

  // Check if user needs verification
  const needsVerification = user.verificationStatus !== 'verified'
  const isVerificationPending = user.verificationStatus === 'pending'
  const isVerificationRejected = user.verificationStatus === 'rejected'

  const handleLogout = async () => {
    // await logout()
    try {
      const req = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await req.json()
    } catch (err) {
      console.log(err)
    }

    await router.push('/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{user.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Verification Status Alert */}
      {needsVerification && (
        <div className={`rounded-lg border p-6 mb-8 ${
          isVerificationPending 
            ? 'bg-yellow-50 border-yellow-200' 
            : isVerificationRejected 
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-lg mr-4 ${
              isVerificationPending 
                ? 'bg-yellow-100' 
                : isVerificationRejected 
                ? 'bg-red-100'
                : 'bg-blue-100'
            }`}>
              <svg
                className={`w-6 h-6 ${
                  isVerificationPending 
                    ? 'text-yellow-600' 
                    : isVerificationRejected 
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isVerificationPending ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : isVerificationRejected ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${
                isVerificationPending 
                  ? 'text-yellow-800' 
                  : isVerificationRejected 
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {isVerificationPending 
                  ? 'Verification Pending' 
                  : isVerificationRejected 
                  ? 'Verification Rejected'
                  : 'Identity Verification Required'
                }
              </h3>
              <p className={`mb-4 ${
                isVerificationPending 
                  ? 'text-yellow-700' 
                  : isVerificationRejected 
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {isVerificationPending 
                  ? 'Your verification documents are being reviewed. You will receive an email once the review is complete.' 
                  : isVerificationRejected 
                  ? 'Your verification was rejected. Please review the feedback and submit new documents.'
                  : 'Complete your identity verification to start listing properties on The Real Notice Board.'
                }
              </p>
              {!isVerificationPending && (
                <Link
                  href="/dashboard/verification"
                  className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors ${
                    isVerificationRejected 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isVerificationRejected ? 'Resubmit Verification' : 'Start Verification'}
                </Link>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Admin Verification Panel */}
        {user.role === 'admin' && (
          <div className="mb-8">
            <AdminVerificationPanel user={user} />
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalInquiries || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingInquiries || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.verificationStatus === 'verified' ? (
            <Link
              href="/properties/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Add Property</span>
            </Link>
          ) : (
            <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-500">Add Property</span>
                <p className="text-xs text-gray-400">Verification required</p>
              </div>
            </div>
          )}

          <Link
            href="/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">View Properties</span>
          </Link>

          <Link
            href="/inquiries"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">View Inquiries</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500">No recent activity to display</p>
          <p className="text-sm text-gray-400 mt-1">
            Start by adding your first property or inquiry
          </p>
        </div>
      </div>
    </div>
  )
}
