import type { Access } from 'payload'

export const mediaDelete: Access = ({ req: { user } }) => {
  // Admins can delete any media
  if (user?.role === 'admin') return true

  // Users can only delete their own media
  return {
    uploadedBy: {
      equals: user?.id,
    },
  }
}

export const mediaUpdate: Access = ({ req: { user } }) => {
  // Admins can update any media
  if (user?.role === 'admin') return true

  // Users can only update their own media
  return {
    uploadedBy: {
      equals: user?.id,
    },
  }
}
