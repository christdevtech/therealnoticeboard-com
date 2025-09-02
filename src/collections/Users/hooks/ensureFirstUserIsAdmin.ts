import type { CollectionBeforeChangeHook } from 'payload'
import type { User } from '../../../payload-types'

export const ensureFirstUserIsAdmin: CollectionBeforeChangeHook<User> = async ({
  data,
  req,
  operation,
}) => {
  // Only run this hook for create operations
  if (operation === 'create') {
    try {
      // Check if there are any existing users
      const existingUsers = await req.payload.find({
        collection: 'users',
        limit: 1,
      })

      // If this is the first user, make them an admin
      if (existingUsers.totalDocs === 0) {
        data.role = 'admin'
        req.payload.logger.info('First user created - automatically assigned admin role')
      }
    } catch (error) {
      req.payload.logger.error('Error checking for existing users:', error)
      // If there's an error checking, we'll let the user be created with default role
    }
  }

  return data
}
