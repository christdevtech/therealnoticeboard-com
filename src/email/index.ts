// Main email template generator
export { generateEmailHTML, generateEmailSubject } from './generateEmailHTML'

// Auth email handlers (basic version without logging)
export {
  generateVerificationEmailHTML as basicVerificationEmailHTML,
  generateVerificationEmailSubject as basicVerificationEmailSubject,
  generatePasswordResetEmailHTML as basicPasswordResetEmailHTML,
  generatePasswordResetEmailSubject as basicPasswordResetEmailSubject,
} from './authEmails'

// Auth email handlers with database logging (recommended)
export {
  generateVerificationEmailHTML,
  generateVerificationEmailSubject,
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailSubject,
} from './authEmailsWithLogging'

// Types for email templates
export interface EmailTemplateProps {
  user: {
    name?: string
    email: string
  }
  url: string
  type: 'verification' | 'password-reset'
}

export type EmailType = 'verification' | 'password-reset' | 'newsletter' | 'notification' | 'other'
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced'