import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://cliniqo.in'
const TEMPLATE_URL  = process.env.NEXT_PUBLIC_TEMPLATE_URL  ?? 'https://cliniqo.in'

function buildEmail(clinic: {
  clinic_name: string
  doctor_name: string
  email: string
  login_password: string | null
  subdomain: string
}) {
  const siteUrl      = `${TEMPLATE_URL}/${clinic.subdomain}`
  const dashboardUrl = `${DASHBOARD_URL}/dashboard`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Cliniqo</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Cliniqo</p>
              <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">Your clinic website is now LIVE 🎉</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">
                Congratulations, Dr. ${clinic.doctor_name}!
              </p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Payment received. <strong>${clinic.clinic_name}</strong> is now fully live — the demo banner has been removed from your website.
              </p>

              <!-- Site link -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Live Website</p>
                    <a href="${siteUrl}" style="color:#059669;font-size:16px;font-weight:700;text-decoration:none;">${siteUrl}</a>
                  </td>
                </tr>
              </table>

              <!-- Login creds -->
              <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">Your Dashboard Login</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <p style="margin:0;color:#6b7280;font-size:12px;">Email</p>
                          <p style="margin:4px 0 0;color:#111827;font-size:14px;font-weight:600;font-family:monospace;">${clinic.email}</p>
                        </td>
                      </tr>
                      ${clinic.login_password ? `
                      <tr>
                        <td>
                          <p style="margin:0;color:#6b7280;font-size:12px;">Password</p>
                          <p style="margin:4px 0 0;color:#111827;font-size:14px;font-weight:600;font-family:monospace;">${clinic.login_password}</p>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's next -->
              <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">What you can do now</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ['🎨', 'Change your website theme', `${dashboardUrl}/website`],
                  ['📝', 'Edit your services & content', `${dashboardUrl}/content`],
                  ['📅', 'View appointment bookings', `${dashboardUrl}/appointments`],
                  ['📊', 'Check your site analytics', `${dashboardUrl}/analytics`],
                ].map(([icon, text, link]) => `
                <tr>
                  <td style="padding:6px 0;">
                    <a href="${link}" style="color:#374151;text-decoration:none;font-size:13px;">
                      ${icon} <span style="color:#059669;">→</span> ${text}
                    </a>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Questions? Reply to this email or WhatsApp us anytime.<br/>
                Cliniqo · Professional websites for clinics across India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subdomain,
      plan,
      amount,
    } = await request.json()

    // Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = getAdminSupabase()

    // Mark client as paying
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        status: 'paying',
        monthly_amount: amount,
        payment_date: new Date().toISOString(),
      })
      .eq('subdomain', subdomain)
      .select('email, phone, clinic_name, doctor_name')
      .single()

    if (error || !client) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Get login_password from leads table
    const { data: lead } = await supabase
      .from('leads')
      .select('login_password')
      .eq('email', client.email)
      .maybeSingle()

    // Mark matching lead as paid
    await supabase
      .from('leads')
      .update({ lead_status: 'paid', contacted: true })
      .eq('email', client.email)

    // Send confirmation email
    if (process.env.RESEND_API_KEY && client.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'Cliniqo <hello@cliniqo.in>',
          to: client.email,
          subject: `🎉 ${client.clinic_name} is now LIVE — Your login details`,
          html: buildEmail({
            clinic_name:    client.clinic_name,
            doctor_name:    client.doctor_name,
            email:          client.email,
            login_password: lead?.login_password ?? null,
            subdomain,
          }),
        })
      } catch (emailErr) {
        // Don't fail the payment if email fails — just log it
        console.error('Email send error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Payment verify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
