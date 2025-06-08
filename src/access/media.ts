import type { Access } from 'payload'

export const mediaRead: Access = ({ req: { user } }) => {
  // Public media (no uploadedBy field) is accessible to anyone
  // Private media is only accessible to the uploader and admins
  if (!user) {
    return {
      or: [
        {
          uploadedBy: {
            exists: false,
          },
        },
        {
          isPublic: {
            equals: true,
          },
        },
      ],
    }
  }

  // Admins can see all media
  if (user.role === 'admin') return true

  // Authenticated users can see public media and their own uploads
  return {
    or: [
      {
        uploadedBy: {
          exists: false,
        },
      },
      {
        isPublic: {
          equals: true,
        },
      },
      {
        uploadedBy: {
          equals: user.id,
        },
      },
    ],
  }
}

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
