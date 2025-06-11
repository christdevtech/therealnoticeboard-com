import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Find the user by email with hidden fields to get the current verification token
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      showHiddenFields: true,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { message: 'No account found with this email address' },
        { status: 404 },
      )
    }

    const user = users.docs[0]

    if (user) {
      // Check if user is already verified
      if (user?._verified) {
        return NextResponse.json(
          { message: 'This email address is already verified' },
          { status: 400 },
        )
      }

      // Generate a new verification token
      const newVerificationToken = crypto.randomBytes(32).toString('hex')

      // Update the user with the new verification token
      await payload.update({
        collection: 'users',
        id: user?.id,
        data: {
          _verificationToken: newVerificationToken,
        },
        showHiddenFields: true,
      })

      // Send verification email with the new token
      await payload.sendEmail({
        to: email,
        subject: 'Verify your email address for The Real Notice Board',
        html: `
        <h2>Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify-email?token=${newVerificationToken}" style="display: inline-block; background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Verify Email</a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/verify-email?token=${newVerificationToken}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>The Real Notice Board Team</p>
      `,
      })

      return NextResponse.json({ message: 'Verification email sent successfully' }, { status: 200 })
    }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 })
  }
}
