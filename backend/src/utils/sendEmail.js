const nodemailer = require('nodemailer');
const logger     = require('../config/logger');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ─── Email templates ──────────────────────────────────────────────────────────
const templates = {
  emailVerification: ({ name, verifyUrl }) => ({
    subject: '✅ Verify Your SareeBazaar Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#c41e3a,#8b1a2e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">🪡 SareeBazaar</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1f2937">Hello ${name}! 👋</h2>
          <p style="color:#6b7280;line-height:1.6">Please verify your email address to start shopping.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${verifyUrl}" style="background:#c41e3a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Verify Email</a>
          </div>
          <p style="color:#9ca3af;font-size:12px">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      </div>`,
  }),

  passwordReset: ({ name, resetUrl }) => ({
    subject: '🔐 Reset Your SareeBazaar Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#c41e3a,#8b1a2e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">🪡 SareeBazaar</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1f2937">Hi ${name},</h2>
          <p style="color:#6b7280">We received a request to reset your password.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="background:#c41e3a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
          </div>
          <p style="color:#9ca3af;font-size:12px">Link expires in 1 hour. If you didn't request this, please ignore.</p>
        </div>
      </div>`,
  }),

  orderConfirmation: ({ order, user }) => ({
    subject: `🎉 Order Confirmed — #${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#c41e3a,#8b1a2e);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">🪡 SareeBazaar</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Order Confirmation</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1f2937">Thank you, ${user.name}! 🎊</h2>
          <p style="color:#6b7280">Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0;color:#92400e;font-weight:bold">Order Total: ₹${order.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <p style="color:#6b7280;font-size:14px">Estimated delivery: 5–7 business days.</p>
        </div>
      </div>`,
  }),

  orderCancelled: ({ order }) => ({
    subject: `❌ Order Cancelled — #${order.orderNumber}`,
    html: `<p>Your order #${order.orderNumber} has been cancelled. A refund will be processed in 5–7 business days if applicable.</p>`,
  }),

  vendorReview: ({ vendor, action, reason }) => ({
    subject: `Your SareeBazaar vendor application has been ${action}d`,
    html: `<p>Dear ${vendor.businessName},</p><p>Your vendor application has been <strong>${action}d</strong>.${reason ? `<br/>Reason: ${reason}` : ''}</p>`,
  }),
};

// ─── Main send function ───────────────────────────────────────────────────────
const sendEmail = async ({ to, template, data, subject, html }) => {
  // In development without SMTP configured, just log the email
  if (!process.env.SMTP_EMAIL || process.env.SMTP_EMAIL === 'your_email@gmail.com') {
    logger.info(`[EMAIL SKIPPED - no SMTP] To: ${to} | Template: ${template || 'custom'}`);
    if (data?.verifyUrl)  logger.info(`  Verify URL:  ${data.verifyUrl}`);
    if (data?.resetUrl)   logger.info(`  Reset URL:   ${data.resetUrl}`);
    if (data?.devOTP)     logger.info(`  OTP:         ${data.devOTP}`);
    return;
  }
  try {
    let emailSubject = subject;
    let emailHtml    = html;

    if (template && templates[template]) {
      const tpl    = templates[template](data);
      emailSubject = tpl.subject;
      emailHtml    = tpl.html;
    }

    await transporter.sendMail({
      from:    `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject: emailSubject,
      html:    emailHtml,
    });

    logger.info(`Email sent: ${template || 'custom'} → ${to}`);
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    // Don't throw — email failure should not break the request
  }
};

module.exports = sendEmail;
