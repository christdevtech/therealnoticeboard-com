import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Property } from '../../../payload-types'

export const revalidateProperty: CollectionAfterChangeHook<Property> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc.status === 'approved') {
      const path = `/properties/${doc.slug}`

      payload.logger.info(`Revalidating property at path: ${path}`)

      revalidatePath(path)
      revalidateTag('properties-sitemap')
    }

    // If the property was previously approved, we need to revalidate the old path
    if (previousDoc?.status === 'approved' && doc.status !== 'approved') {
      const oldPath = `/properties/${previousDoc.slug}`

      payload.logger.info(`Revalidating old property at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('properties-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Property> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/properties/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('properties-sitemap')
  }

  return doc
}