import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pocketcfo-jube.vercel.app'

export async function sendWelcomeEmail(email: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '👋 Welcome to PocketCFO — here\'s how to get your first insight',
    replyTo: 'julianmanna14@gmail.com',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#111;padding:32px 40px;border-bottom:1px solid #1e1e1e;">
          <span style="color:#00ff88;font-size:22px;font-weight:900;">Pocket<span style="color:#fff;">CFO</span></span>
        </td></tr>

        <!-- Headline -->
        <tr><td style="padding:36px 40px 20px;">
          <h1 style="color:#fff;font-size:26px;margin:0 0 12px;line-height:1.3;">You're in. Let's find your hidden money. 💸</h1>
          <p style="color:#888;font-size:15px;margin:0;line-height:1.6;">
            Most small business owners are overpaying by <strong style="color:#fff;">$1,200–$3,000/month</strong> and don't know it. We're about to change that.
          </p>
        </td></tr>

        <!-- Steps -->
        <tr><td style="padding:8px 40px 32px;">
          <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 20px;">Get your first insight in 3 steps:</p>

          <!-- Step 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="48" valign="top">
                <div style="width:36px;height:36px;background:#00ff8820;border:1px solid #00ff8840;border-radius:50%;text-align:center;line-height:36px;color:#00ff88;font-weight:900;font-size:15px;">1</div>
              </td>
              <td valign="top" style="padding-left:12px;">
                <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 4px;">Log in to your dashboard</p>
                <p style="color:#888;font-size:13px;margin:0;">Click the button below — takes 2 seconds.</p>
              </td>
            </tr>
          </table>

          <!-- Step 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td width="48" valign="top">
                <div style="width:36px;height:36px;background:#00ff8820;border:1px solid #00ff8840;border-radius:50%;text-align:center;line-height:36px;color:#00ff88;font-weight:900;font-size:15px;">2</div>
              </td>
              <td valign="top" style="padding-left:12px;">
                <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 4px;">Upload your numbers</p>
                <p style="color:#888;font-size:13px;margin:0;">Drop in a CSV, Excel spreadsheet, or PDF bank statement. Any format works.</p>
              </td>
            </tr>
          </table>

          <!-- Step 3 -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48" valign="top">
                <div style="width:36px;height:36px;background:#00ff8820;border:1px solid #00ff8840;border-radius:50%;text-align:center;line-height:36px;color:#00ff88;font-weight:900;font-size:15px;">3</div>
              </td>
              <td valign="top" style="padding-left:12px;">
                <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 4px;">See what your AI CFO finds</p>
                <p style="color:#888;font-size:13px;margin:0;">In about 30 seconds, you'll see your savings opportunities, cash flow gaps, and a step-by-step action plan.</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 36px;text-align:center;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#00ff88;color:#0a0a0a;font-weight:900;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;">
            Get my first insight →
          </a>
          <p style="color:#555;font-size:12px;margin:16px 0 0;">First 30 days free — no credit card needed.</p>
        </td></tr>

        <!-- Social proof -->
        <tr><td style="padding:0 40px 36px;">
          <div style="background:#0d2b1a;border:1px solid #00ff8820;border-radius:12px;padding:20px;">
            <p style="color:#888;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">What to expect</p>
            <p style="color:#fff;font-size:14px;margin:0;line-height:1.6;">
              "I uploaded my QuickBooks export and within a minute PocketCFO found $2,400 in monthly savings I had no idea about."
              <span style="color:#888;"> — Small business owner</span>
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
          <p style="color:#555;font-size:12px;margin:0;line-height:1.6;">
            Questions? Just reply to this email — I read every one.<br/>
            PocketCFO · <a href="${APP_URL}/dashboard" style="color:#00ff88;">Open dashboard</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
