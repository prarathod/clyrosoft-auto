import { Resend } from 'resend'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cliniqo.in'
const TEMPLATE_URL  = process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'https://cliniqo.in'

function resend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const FROM = process.env.EMAIL_FROM ?? 'Cliniqo <hello@cliniqo.in>'

// ─── Shared styles ───────────────────────────────────────────────────────────
const wrap = (body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`

const header = (title: string, subtitle: string, color = '#2563EB') => `
  <tr>
    <td style="background:linear-gradient(135deg,${color},${color}dd);padding:32px 40px;text-align:center;">
      <p style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-.5px;">Cliniqo</p>
      <p style="margin:8px 0 0;color:#ffffff99;font-size:14px;">${subtitle}</p>
    </td>
  </tr>`

const footer = () => `
  <tr>
    <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        Questions? Reply to this email or WhatsApp us anytime.<br/>
        Cliniqo · Professional websites for clinics across India
      </p>
    </td>
  </tr>`

const creds = (email: string, password: string) => `
  <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">Your Login Credentials</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">Email</p>
        <p style="margin:0 0 14px;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${email}</p>
        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">Password</p>
        <p style="margin:0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${password}</p>
      </td>
    </tr>
  </table>`

const ctaButton = (href: string, label: string, color = '#2563EB') => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td align="center">
        <a href="${href}" style="display:inline-block;background:${color};color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`

// ─── 1. Welcome email (on signup) ────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  doctor_name,
  clinic_name,
  email,
  password,
}: {
  to: string
  doctor_name: string
  clinic_name: string
  email: string
  password: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const dashboardUrl = `${DASHBOARD_URL}/dashboard`

  const html = wrap(`
    ${header('Welcome to Cliniqo!', 'Your demo site is ready', '#2563EB')}
    <tr>
      <td style="padding:36px 40px;">
        <p style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">
          Welcome, Dr. ${doctor_name}!
        </p>
        <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
          Your demo website for <strong>${clinic_name}</strong> is ready to explore.
          Log in to your dashboard to preview your site, customise the theme, edit content, and go live.
        </p>

        ${creds(email, password)}

        ${ctaButton(dashboardUrl, 'Open My Dashboard →')}

        <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">What can you do?</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['🎨', 'Change your website theme'],
            ['📝', 'Edit your services, bio & info'],
            ['📅', 'View appointment bookings'],
            ['🚀', 'Upgrade to go live (remove demo banner)'],
          ].map(([icon, text]) => `
          <tr>
            <td style="padding:5px 0;color:#374151;font-size:13px;">${icon} &nbsp;${text}</td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>
    ${footer()}
  `)

  try {
    await resend().emails.send({
      from: FROM,
      to,
      subject: `Welcome to Cliniqo — Your demo site for ${clinic_name} is ready`,
      html,
    })
  } catch (err) {
    console.error('[email] sendWelcomeEmail error:', err)
  }
}

// ─── 2. Payment confirmation email ───────────────────────────────────────────
export async function sendPaymentConfirmationEmail({
  to,
  doctor_name,
  clinic_name,
  email,
  password,
  subdomain,
  plan_label,
  amount,
}: {
  to: string
  doctor_name: string
  clinic_name: string
  email: string
  password: string | null
  subdomain: string
  plan_label: string
  amount: number
}) {
  if (!process.env.RESEND_API_KEY) return

  const siteUrl      = `${TEMPLATE_URL}/${subdomain}`
  const dashboardUrl = `${DASHBOARD_URL}/dashboard`

  const html = wrap(`
    ${header('Payment Successful 🎉', 'Your clinic website is now LIVE', '#059669')}
    <tr>
      <td style="padding:36px 40px;">
        <p style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:700;">
          Congratulations, Dr. ${doctor_name}!
        </p>
        <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
          Payment of <strong>₹${amount}</strong> (${plan_label} plan) received successfully.
          <strong>${clinic_name}</strong> is now fully live — the demo banner has been removed.
        </p>

        <!-- Live site link -->
        <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">Your Live Website</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 24px;">
              <a href="${siteUrl}" style="color:#059669;font-size:16px;font-weight:700;text-decoration:none;">${siteUrl}</a>
            </td>
          </tr>
        </table>

        ${password ? creds(email, password) : `
        <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">Your Dashboard Login</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 24px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">Email</p>
              <p style="margin:0;color:#111827;font-size:14px;font-weight:700;font-family:monospace;">${email}</p>
            </td>
          </tr>
        </table>`}

        ${ctaButton(dashboardUrl, 'Go to Dashboard →', '#059669')}

        <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;">What you can do now</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['🎨', 'Change your website theme', `${dashboardUrl}/website`],
            ['📝', 'Edit your services & content', `${dashboardUrl}/content`],
            ['📅', 'View appointment bookings', `${dashboardUrl}/appointments`],
            ['📊', 'Check your site analytics', `${dashboardUrl}/analytics`],
          ].map(([icon, text, link]) => `
          <tr>
            <td style="padding:5px 0;font-size:13px;">
              <a href="${link}" style="color:#374151;text-decoration:none;">${icon} &nbsp;${text}</a>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>
    ${footer()}
  `)

  try {
    await resend().emails.send({
      from: FROM,
      to,
      subject: `🎉 ${clinic_name} is LIVE — Payment confirmed`,
      html,
    })
  } catch (err) {
    console.error('[email] sendPaymentConfirmationEmail error:', err)
  }
}
