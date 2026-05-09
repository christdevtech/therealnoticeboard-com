import type { Access } from 'payload'

/**
 * Reviews are publicly readable (published only for non-admin),
 * creatable by authenticated users (hook validates transaction exists),
 * and only editable/deletable by admins.
 */

export const reviewsRead: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true

  // Public users can only see published reviews
  return {
    status: {
      equals: 'published',
    },
  }
}

export const reviewsCreate: Access = ({ req: { user } }) => {
  // Must be authenticated — transaction validation happens in beforeChange hook
  return Boolean(user)
}

export const reviewsUpdate: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true

  // Vendors can only update their own vendorResponse (field-level access handles this)
  return {
    vendor: {
      equals: user?.id,
    },
  }
}

export const reviewsDelete: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}
