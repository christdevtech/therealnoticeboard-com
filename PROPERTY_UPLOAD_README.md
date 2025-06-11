# Property Upload Feature

This document describes the new property upload feature that allows verified users to list properties on The Real Notice Board.

## Overview

The property upload feature includes:
- Multi-step form with tabbed interface
- Mapbox integration for location selection
- Image upload with preview
- Dynamic form fields based on property type
- Amenities selection
- Contact information management

## Setup Instructions

### 1. Install Dependencies

The following dependencies have been added to support the property upload feature:

```bash
pnpm install react-map-gl mapbox-gl @types/mapbox-gl
```

### 2. Mapbox Configuration

1. Create a Mapbox account at [https://account.mapbox.com/](https://account.mapbox.com/)
2. Get your access token from [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
3. Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12
```

### 3. User Verification Requirement

Only users with `verificationStatus: 'verified'` can access the property upload feature. Users must:
1. Complete email verification
2. Submit identity verification documents
3. Have their verification approved by an admin

## File Structure

```
src/app/(frontend)/dashboard/properties/new/
├── page.tsx                           # Server component (data fetching)
└── PropertyUploadForm.client.tsx      # Client component (form & map)
```

## Features

### Multi-Step Form

The form is divided into 4 tabs:

1. **Basic Information**
   - Property title and description
   - Property type (residential, commercial, industrial, land)
   - Listing type (sale/rent)
   - Area and price

2. **Location**
   - Neighborhood selection
   - Address input
   - Interactive Mapbox map for precise location
   - GPS coordinates (auto-filled from map)

3. **Property Features**
   - Dynamic fields based on property type:
     - **Residential**: bedrooms, bathrooms, floors, year built
     - **Commercial**: business type, offices, year built
     - **Industrial**: industrial type, ceiling height, loading docks, power supply
     - **Land**: land type, topography
   - Amenities selection (filtered by property type)

4. **Contact & Images**
   - Contact information (phone, email, WhatsApp)
   - Image upload (up to 10 images)
   - Image preview and removal

### Mapbox Integration

- Interactive map with click-to-select location
- Marker shows selected property location
- Navigation and geolocation controls
- Coordinates automatically update form fields
- Default center: Yaoundé, Cameroon (3.848, 11.502)

### Form Validation

- Required field validation
- Image count limits (max 10)
- Numeric field validation
- Real-time error display

### API Integration

The form submits to Payload CMS's REST API:
- Endpoint: `POST /api/properties`
- Supports file uploads via FormData
- Automatic user assignment as property owner
- Status defaults to 'pending' for admin review

## Access Control

The property upload feature respects Payload CMS access control:

- **Create**: Only verified users (`verifiedOrAdmin`)
- **Read**: Owners can see their properties, public can see approved properties
- **Update**: Owners and admins only
- **Delete**: Owners and admins only

## Navigation

Users can access the property upload feature:
1. From the dashboard "Add Property" quick action (only visible to verified users)
2. Direct URL: `/dashboard/properties/new`

## Error Handling

- Form validation errors displayed inline
- API errors shown in error banner
- Loading states during submission
- Graceful fallbacks for missing data

## Responsive Design

The form is fully responsive:
- Mobile-friendly tabbed interface
- Responsive grid layouts
- Touch-friendly map controls
- Optimized image upload on mobile

## Future Enhancements

Potential improvements:
- Drag-and-drop image reordering
- Image compression before upload
- Property draft saving
- Bulk property import
- Advanced map features (drawing tools, satellite view)
- Property templates for faster listing

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Mapbox access token is set correctly
   - Verify token has appropriate scopes
   - Check browser console for errors

2. **Form submission fails**
   - Ensure user is verified
   - Check file size limits
   - Verify all required fields are filled

3. **Images not uploading**
   - Check file formats (JPG, PNG, WebP supported)
   - Verify file size limits
   - Ensure proper FormData construction

### Debug Mode

To enable debug logging, add to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## Support

For issues or questions about the property upload feature:
1. Check the browser console for errors
2. Verify environment variables are set
3. Ensure user verification status
4. Review Payload CMS logs for API errors