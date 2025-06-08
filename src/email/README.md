# Email System

This directory contains the email functionality for The Real Notice Board, extracted from the Users collection for better organization and reusability.

## Structure

```
src/email/
├── index.ts                    # Main exports and types
├── generateEmailHTML.ts        # Core email template generator
├── authEmails.ts              # Basic auth email handlers
├── authEmailsWithLogging.ts   # Auth email handlers with database logging
└── README.md                  # This file
```

## Features

- **Centralized Email Templates**: All email HTML generation is handled in `generateEmailHTML.ts`
- **Consistent Styling**: Shared styles and structure across all email types
- **Database Logging**: Optional email activity logging to the `EmailLogs` collection
- **Type Safety**: Full TypeScript support with proper types
- **Extensible**: Easy to add new email types

## Usage

### Basic Usage (Users Collection)

The Users collection now imports the email handlers:

```typescript
import {
  generateVerificationEmailHTML,
  generateVerificationEmailSubject,
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailSubject,
} from '../../email/authEmailsWithLogging'
```

### Creating Custom Emails

To create a new email type:

1. Add the new type to `EmailTemplateProps` in `generateEmailHTML.ts`
2. Add the template configuration in the `templates` object
3. Create a handler function similar to the auth email handlers

### Email Logging

The system automatically logs all emails to the `EmailLogs` collection, which tracks:

- Recipient email
- Subject line
- Email type
- Send status
- Timestamp
- User relationship
- HTML content
- Error messages (if failed)
- Metadata (user agent, IP, etc.)

### Available Email Types

- `verification`: Email address verification
- `password-reset`: Password reset emails
- `newsletter`: Newsletter emails (extensible)
- `notification`: General notifications (extensible)
- `other`: Custom email types (extensible)

## Environment Variables

Make sure these environment variables are set:

- `PAYLOAD_PUBLIC_SERVER_URL`: Your application's public URL
- Email configuration (SMTP settings) in your Payload config

## Benefits of This Structure

1. **Separation of Concerns**: Email logic is separated from collection configuration
2. **Reusability**: Email templates can be used across different collections
3. **Maintainability**: Centralized email styling and content management
4. **Monitoring**: Built-in email activity logging
5. **Extensibility**: Easy to add new email types and features
6. **Testing**: Email functions can be unit tested independently

## Example: Adding a Newsletter Email

1. Update `generateEmailHTML.ts`:
```typescript
const templates = {
  // ... existing templates
  newsletter: {
    title: 'Newsletter Update',
    greeting: `Hello ${user.name || user.email},`,
    message: 'Here\'s your latest newsletter update:',
    buttonText: 'Read More',
    footer: 'You can unsubscribe at any time.',
    disclaimer: 'This email was sent because you subscribed to our newsletter.'
  }
}
```

2. Create a newsletter handler:
```typescript
export const generateNewsletterEmailHTML = ({ req, user, content }) => {
  const htmlContent = generateEmailHTML({
    user,
    url: content.url,
    type: 'newsletter'
  })
  
  // Log to database
  logEmailToDatabase({
    req,
    to: user.email,
    subject: content.subject,
    type: 'newsletter',
    htmlContent,
    userId: user.id,
  })
  
  return htmlContent
}
```

This structure follows the patterns shown in the [Payload Email Example](https://github.com/payloadcms/payload/tree/main/examples/email) and provides a solid foundation for email management in your application.