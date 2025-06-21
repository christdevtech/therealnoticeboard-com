import { Metadata } from 'next'
import { VerifyEmailForm } from './VerifyEmailForm.client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Verify Email | The Real Notice Board',
  description: 'Verify your email address to activate your account.',
}

export default function VerifyEmailPage() {
  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">Activating your account...</p>
          </div>
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  )
}
