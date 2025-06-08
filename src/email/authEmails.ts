import type { PayloadRequest } from 'payload'
import { generateEmailHTML, generateEmailSubject } from './generateEmailHTML'

type VerificationEmailArgs = 
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

type ForgotPasswordEmailArgs = 
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

type EmailSubjectArgs = 
  | {
      req?: PayloadRequest
      token?: string
      user?: any
    }
  | undefined

// Email verification handler
export const generateVerificationEmailHTML = async (
  args: VerificationEmailArgs,
): Promise<string> => {
  const url = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify-email?token=${args?.token}`
  
  // Log email activity (you could also save to database here)
  console.log(`Sending verification email to ${args?.user?.email} at ${new Date().toISOString()}`)
  
  // Optional: Save email record to database
  // You could create an EmailLogs collection and save the email details here
  
  return generateEmailHTML({
    user: args?.user || { email: '', name: '' },
    url,
    type: 'verification'
  })
}

export const generateVerificationEmailSubject = async (
  args: EmailSubjectArgs,
): Promise<string> => {
  return generateEmailSubject('verification')
}

// Password reset handler
export const generatePasswordResetEmailHTML = async (
  args: ForgotPasswordEmailArgs,
): Promise<string> => {
  const resetPasswordURL = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/reset-password?token=${args?.token}`
  
  // Log email activity
  console.log(`Sending password reset email to ${args?.user?.email} at ${new Date().toISOString()}`)
  
  // Optional: Save email record to database
  // You could create an EmailLogs collection and save the email details here
  
  return generateEmailHTML({
    user: args?.user || { email: '', name: '' },
    url: resetPasswordURL,
    type: 'password-reset'
  })
}

export const generatePasswordResetEmailSubject = async (
  args: EmailSubjectArgs,
): Promise<string> => {
  return generateEmailSubject('password-reset')
}