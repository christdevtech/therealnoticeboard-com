import type { Payload } from 'payload'

export const seedPropertyTypes = async (payload: Payload): Promise<void> => {
  const propertyTypes = [
    {
      name: 'Land',
      description: 'Undeveloped land plots suitable for various development purposes',
      slug: 'land',
    },
    {
      name: 'Residential',
      description:
        'Properties designed for living purposes including houses, apartments, and condos',
      slug: 'residential',
    },
    {
      name: 'Commercial',
      description:
        'Properties used for business purposes such as offices, retail spaces, and warehouses',
      slug: 'commercial',
    },
    {
      name: 'Industrial',
      description: 'Properties designed for manufacturing, production, and heavy industrial use',
      slug: 'industrial',
    },
  ]

  for (const propertyType of propertyTypes) {
    const existing = await payload.find({
      collection: 'property-types',
      where: {
        slug: {
          equals: propertyType.slug,
        },
      },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'property-types',
        data: propertyType,
      })
      console.log(`✓ Created property type: ${propertyType.name}`)
    } else {
      console.log(`- Property type already exists: ${propertyType.name}`)
    }
  }
}
