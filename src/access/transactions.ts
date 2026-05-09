import type { Access, Where } from 'payload'

/**
 * Transactions are visible to involved parties + admin,
 * creatable by authenticated users,
 * and only deletable by admins.
 */

export const transactionsRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  // Users can only see transactions they are involved in
  const where: Where = {
    or: [
      { buyer: { equals: user.id } },
      { seller: { equals: user.id } },
    ],
  }
  return where
}

export const transactionsCreate: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const transactionsUpdate: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  const where: Where = {
    or: [
      { buyer: { equals: user.id } },
      { seller: { equals: user.id } },
    ],
  }
  return where
}

export const transactionsDelete: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}
