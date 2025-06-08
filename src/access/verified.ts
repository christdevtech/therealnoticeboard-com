import type { Access } from 'payload'

import type { User } from '@/payload-types'

type isVerified = (args: { req: { user?: User | null } }) => boolean

export const verified: isVerified = ({ req: { user } }) => {
  return Boolean(user && user.verificationStatus === 'verified')
}

export const verifiedOrAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && (user.role === 'admin' || user.verificationStatus === 'verified'))
}
