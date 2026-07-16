import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email, phone, businessDescription } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: 'Julianmanna14@gmail.com',
      subject: '🔥 New PocketCFO Lead',
      html: `
        <h2>New lead from the landing page demo</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Business description:</strong></p>
        <blockquote>${businessDescription}</blockquote>
      `,
    })
  } catch {
    // Don't block the user if email fails
  }

  return NextResponse.json({ success: true })
}
