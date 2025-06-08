interface EmailTemplateProps {
  user: {
    name?: string
    email: string
  }
  url: string
  type: 'verification' | 'password-reset'
}

export const generateEmailHTML = ({ user, url, type }: EmailTemplateProps): string => {
  const baseStyles = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `

  const buttonStyles = `
    display: inline-block;
    background-color: #007cba;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    margin: 16px 0;
    font-weight: bold;
  `

  const templates = {
    verification: {
      title: 'Verify Your Email Address',
      greeting: `Hello ${user.name || user.email},`,
      message: 'Thank you for signing up! Please click the button below to verify your email address:',
      buttonText: 'Verify Email',
      footer: 'This link will expire in 24 hours.',
      disclaimer: "If you didn't create an account, please ignore this email."
    },
    'password-reset': {
      title: 'Reset Your Password',
      greeting: `Hello ${user.name || user.email},`,
      message: 'You requested to reset your password. Click the button below to set a new password:',
      buttonText: 'Reset Password',
      footer: 'This link will expire in 1 hour.',
      disclaimer: "If you didn't request this password reset, please ignore this email."
    }
  }

  const template = templates[type]

  return `
    <div style="${baseStyles}">
      <h2 style="color: #333; margin-bottom: 20px;">${template.title}</h2>
      <p style="color: #555; line-height: 1.6;">${template.greeting}</p>
      <p style="color: #555; line-height: 1.6;">${template.message}</p>
      <a href="${url}" style="${buttonStyles}">${template.buttonText}</a>
      <p style="color: #555; line-height: 1.6;">Or copy and paste this link into your browser:</p>
      <p style="color: #007cba; word-break: break-all;"><a href="${url}" style="color: #007cba;">${url}</a></p>
      <p style="color: #888; font-size: 14px; margin-top: 20px;">${template.footer}</p>
      <p style="color: #888; font-size: 14px;">${template.disclaimer}</p>
    </div>
  `
}

export const generateEmailSubject = (type: 'verification' | 'password-reset'): string => {
  const subjects = {
    verification: 'Verify your email address for The Real Notice Board',
    'password-reset': 'Reset your password for The Real Notice Board'
  }
  
  return subjects[type]
}