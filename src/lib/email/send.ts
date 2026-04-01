import { resend } from "./client";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ClubOS <noreply@clubos.app>";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    return { success: false, error: message };
  }
}

export async function sendWelcomeEmail(opts: {
  to: string;
  memberName: string;
  orgName: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Welcome to ${opts.orgName}!`,
    html: welcomeTemplate(opts.memberName, opts.orgName),
  });
}

export async function sendReceiptEmail(opts: {
  to: string;
  memberName: string;
  orgName: string;
  membershipType: string;
  amount: string;
  currency: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Payment receipt — ${opts.orgName}`,
    html: receiptTemplate(opts),
  });
}

export async function sendReminderEmail(opts: {
  to: string;
  memberName: string;
  orgName: string;
  daysUntilExpiry: number;
  renewUrl: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Membership renewal reminder — ${opts.orgName}`,
    html: reminderTemplate(opts),
  });
}

// ---------------------------------------------------------------------------
// Templates (inline HTML — no react-email dependency needed)
// ---------------------------------------------------------------------------

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
<div style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;padding:32px;color:#e5e5e5">
${content}
<hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0">
<p style="font-size:12px;color:#666;margin:0">Powered by ClubOS — AI-powered club management</p>
</div>
</div>
</body>
</html>`;
}

function welcomeTemplate(name: string, orgName: string): string {
  return baseLayout(`
<h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px">Welcome, ${escHtml(name)}!</h1>
<p style="font-size:15px;color:#a1a1a1;margin:0 0 20px">You're now registered with <strong style="color:#fff">${escHtml(orgName)}</strong>.</p>
<p style="font-size:14px;line-height:1.6;color:#ccc;margin:0 0 16px">Here's what happens next:</p>
<ul style="font-size:14px;line-height:1.8;color:#ccc;padding-left:20px;margin:0 0 20px">
<li>You'll receive fixture updates and results via WhatsApp</li>
<li>Your membership card is available in the member portal</li>
<li>Contact your club secretary with any questions</li>
</ul>
<p style="font-size:14px;color:#ccc;margin:0">Thank you for your support. Up the parish!</p>
`);
}

function receiptTemplate(opts: {
  memberName: string;
  orgName: string;
  membershipType: string;
  amount: string;
  currency: string;
}): string {
  const currencySymbol = opts.currency.toUpperCase() === "GBP" ? "£" : opts.currency.toUpperCase();
  return baseLayout(`
<h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px">Payment Received</h1>
<p style="font-size:15px;color:#a1a1a1;margin:0 0 24px">Thank you, ${escHtml(opts.memberName)}</p>
<div style="background:#222;border-radius:8px;padding:16px;margin:0 0 20px">
<table style="width:100%;font-size:14px;color:#ccc;border-collapse:collapse">
<tr><td style="padding:6px 0;color:#888">Organisation</td><td style="padding:6px 0;text-align:right;color:#fff">${escHtml(opts.orgName)}</td></tr>
<tr><td style="padding:6px 0;color:#888">Membership</td><td style="padding:6px 0;text-align:right;color:#fff">${escHtml(opts.membershipType)}</td></tr>
<tr><td style="padding:6px 0;border-top:1px solid #333;color:#888;font-weight:600">Total</td><td style="padding:6px 0;border-top:1px solid #333;text-align:right;color:#10b981;font-weight:700;font-size:18px">${currencySymbol}${escHtml(opts.amount)}</td></tr>
</table>
</div>
<p style="font-size:13px;color:#888;margin:0">Your membership is now active. This email serves as your receipt.</p>
`);
}

function reminderTemplate(opts: {
  memberName: string;
  orgName: string;
  daysUntilExpiry: number;
  renewUrl: string;
}): string {
  const urgency = opts.daysUntilExpiry <= 7 ? "color:#ef4444" : "color:#f59e0b";
  return baseLayout(`
<h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px">Membership Renewal</h1>
<p style="font-size:15px;color:#a1a1a1;margin:0 0 20px">Hi ${escHtml(opts.memberName)},</p>
<p style="font-size:14px;line-height:1.6;color:#ccc;margin:0 0 16px">Your <strong style="color:#fff">${escHtml(opts.orgName)}</strong> membership expires in <strong style="${urgency}">${opts.daysUntilExpiry} day${opts.daysUntilExpiry !== 1 ? "s" : ""}</strong>.</p>
<p style="font-size:14px;color:#ccc;margin:0 0 24px">Renew now to keep your access to fixtures, results, and club communications.</p>
<a href="${escHtml(opts.renewUrl)}" style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">Renew Membership</a>
<p style="font-size:12px;color:#666;margin:16px 0 0">If you've already renewed, please disregard this email.</p>
`);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
