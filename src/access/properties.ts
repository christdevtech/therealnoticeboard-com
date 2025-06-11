import type { Access } from 'payload'

export const propertiesRead: Access = ({ req: { user, data } }) => {
  // Admins can see all properties
  if (user?.role === 'admin') return true

  // Users can only see their own properties
  if (user?.role === 'user' && data?.owner === user.id) {
    return true
  }
  // Non-authenticated users can only see approved properties
  return {
    status: {
      equals: 'approved',
    },
  }
}

export const propertiesUpdate: Access = ({ req: { user } }) => {
  // Admins can update any property
  if (user?.role === 'admin') return true

  // Users can only update their own properties
  return {
    owner: {
      equals: user?.id,
    },
  }
}

export const propertiesDelete: Access = ({ req: { user } }) => {
  // Admins can delete any property
  if (user?.role === 'admin') return true

  // Users can only delete their own properties
  return {
    owner: {
      equals: user?.id,
    },
  }
}
