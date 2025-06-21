import type { Access } from 'payload'

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
