import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { VerificationRequestReview } from './VerificationRequestReview.client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VerificationRequestPage({ params }: PageProps) {
 const { id } = await params
 const payload = await getPayload({ config })
 const requestHeaders = await headers()

 // Authenticate using Payload's local API
 const { user } = await payload.auth({ headers: requestHeaders })
  
  
  if (!user) {
    redirect('/login')
  }
  
  // Check if user is verified
  if (user.verificationStatus !== 'verified') {
    redirect('/dashboard')
  }
  
  // Check if user is admin
  if (user.role !== 'admin') {
    redirect('/dashboard')
  }
  
  try {
    // Fetch the specific verification request
    const verificationRequest = await payload.findByID({
      collection: 'verification-requests',
      id,
      depth: 2, // Include related documents
    })
    
    if (!verificationRequest) {
      redirect('/dashboard/admin/verification-requests')
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <a href="/dashboard" className="text-gray-400 hover:text-gray-500">
                      <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span className="sr-only">Home</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <a href="/dashboard/admin/verification-requests" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                      Verification Requests
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Review Request
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Review Verification Request</h1>
            <p className="mt-2 text-gray-600">
              Review and approve or reject the user's verification request.
            </p>
          </div>
          
          <VerificationRequestReview 
            user={user} 
            verificationRequest={verificationRequest}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching verification request:', error)
    redirect('/dashboard/admin/verification-requests')
  }
}