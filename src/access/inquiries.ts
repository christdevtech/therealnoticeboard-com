import type { Access } from 'payload'

export const inquiriesRead: Access = ({ req: { user } }) => {
  // Admins can see all inquiries
  if (user?.role === 'admin') return true

  // Users can see inquiries they made or received
  return {
    or: [
      {
        inquirer: {
          equals: user?.id,
        },
      },
      {
        'property.owner': {
          equals: user?.id,
        },
      },
    ],
  }
}

export const inquiriesDelete: Access = ({ req: { user } }) => {
  // Admins can delete any inquiry
  if (user?.role === 'admin') return true

  // Users can only delete inquiries they made
  return {
    inquirer: {
      equals: user?.id,
    },
  }
}
