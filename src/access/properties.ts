import type { Access } from 'payload'

export const propertiesRead: Access = ({ req: { user } }) => {
  // Admins can see all properties
  if (user?.role === 'admin') return true

  // Authenticated users can see their own properties and approved ones
  if (user) {
    return {
      or: [
        {
          owner: {
            equals: user.id,
          },
        },
        {
          status: {
            equals: 'approved',
          },
        },
      ],
    }
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
