import type { Access } from 'payload'

export const usersUpdate: Access = ({ req: { user } }) => {
  // Users can update their own profile, admins can update any
  if (user?.role === 'admin') return true
  return {
    id: {
      equals: user?.id,
    },
  }
}
