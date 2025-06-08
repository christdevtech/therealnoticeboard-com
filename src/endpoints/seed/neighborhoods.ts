import type { Payload } from 'payload'

export const seedNeighborhoods = async (payload: Payload): Promise<void> => {
  const neighborhoods = [
    // Douala neighborhoods
    {
      name: 'Akwa',
      city: 'Douala',
      region: 'littoral',
      description: 'Central business district of Douala with modern offices and commercial centers',
      coordinates: {
        latitude: 4.0511,
        longitude: 9.7679,
      },
    },
    {
      name: 'Bonanjo',
      city: 'Douala',
      region: 'littoral',
      description: 'Historic administrative and commercial quarter of Douala',
      coordinates: {
        latitude: 4.0483,
        longitude: 9.7006,
      },
    },
    {
      name: 'Bonapriso',
      city: 'Douala',
      region: 'littoral',
      description: 'Upscale residential area with embassies and luxury accommodations',
      coordinates: {
        latitude: 4.0614,
        longitude: 9.7089,
      },
    },
    // Yaoundé neighborhoods
    {
      name: 'Centre Ville',
      city: 'Yaoundé',
      region: 'centre',
      description: 'Downtown Yaoundé with government buildings and commercial activities',
      coordinates: {
        latitude: 3.848,
        longitude: 11.5021,
      },
    },
    {
      name: 'Bastos',
      city: 'Yaoundé',
      region: 'centre',
      description: 'Diplomatic quarter with embassies and upscale residences',
      coordinates: {
        latitude: 3.8691,
        longitude: 11.5174,
      },
    },
    {
      name: 'Nlongkak',
      city: 'Yaoundé',
      region: 'centre',
      description: 'Residential area popular with expatriates and professionals',
      coordinates: {
        latitude: 3.8756,
        longitude: 11.5156,
      },
    },
    // Other major cities
    {
      name: 'Centre Ville',
      city: 'Bamenda',
      region: 'northwest',
      description: 'Commercial center of Bamenda with markets and business districts',
      coordinates: {
        latitude: 5.9597,
        longitude: 10.1494,
      },
    },
    {
      name: 'Centre Ville',
      city: 'Bafoussam',
      region: 'west',
      description: 'Central business area of Bafoussam',
      coordinates: {
        latitude: 5.4781,
        longitude: 10.4199,
      },
    },
    {
      name: 'Centre Ville',
      city: 'Garoua',
      region: 'north',
      description: 'Commercial hub of northern Cameroon',
      coordinates: {
        latitude: 9.3265,
        longitude: 13.3958,
      },
    },
    {
      name: 'Centre Ville',
      city: 'Maroua',
      region: 'far-north',
      description: 'Administrative and commercial center of Far North region',
      coordinates: {
        latitude: 10.5913,
        longitude: 14.3153,
      },
    },
  ]

  for (const neighborhood of neighborhoods) {
    const existing = await payload.find({
      collection: 'neighborhoods',
      where: {
        and: [
          {
            name: {
              equals: neighborhood.name,
            },
          },
          {
            city: {
              equals: neighborhood.city,
            },
          },
        ],
      },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'neighborhoods',
        data: neighborhood,
      })
      console.log(`✓ Created neighborhood: ${neighborhood.name}, ${neighborhood.city}`)
    } else {
      console.log(`- Neighborhood already exists: ${neighborhood.name}, ${neighborhood.city}`)
    }
  }
}
