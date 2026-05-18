import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "LegalMint AI <noreply@legalmint.ai>";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.log("Resend not configured, skipping welcome email");
    return;
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to LegalMint AI — Your compliance journey starts here",
    html: `
      <h1>Welcome to LegalMint AI, ${name}!</h1>
      <p>Thank you for joining India's AI-powered legal compliance platform.</p>
      <h2>Getting Started</h2>
      <ol>
        <li><strong>Complete onboarding</strong> — Tell us about your business to get a personalized compliance roadmap.</li>
        <li><strong>Generate documents</strong> — Create Privacy Policies, Terms of Service, and more in minutes.</li>
        <li><strong>Track compliance</strong> — Stay on top of DPDP Act, IT Act, GST, and other Indian regulations.</li>
      </ol>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding">Start Onboarding →</a></p>
      <hr>
      <p style="font-size: 12px; color: #666;">LegalMint AI is not a law firm and does not provide legal advice. Consult a qualified advocate for legal matters.</p>
    `,
  });
}

export async function sendComplianceAlertEmail(
  to: string,
  title: string,
  description: string
) {
  if (!resend) {
    console.log("Resend not configured, skipping compliance alert email");
    return;
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Compliance Alert: ${title}`,
    html: `
      <h2>Compliance Alert</h2>
      <p><strong>${title}</strong></p>
      <p>${description}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/compliance">View Compliance Dashboard →</a></p>
      <hr>
      <p style="font-size: 12px; color: #666;">You're receiving this because you have compliance alerts enabled on LegalMint AI.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log("Resend not configured, skipping password reset email");
    return;
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your LegalMint AI password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password →</a></p>
      <p>This link expires in 1 hour.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendDocumentReadyEmail(
  to: string,
  documentTitle: string
) {
  if (!resend) {
    console.log("Resend not configured, skipping document ready email");
    return;
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your document "${documentTitle}" is ready`,
    html: `
      <h2>Document Generated</h2>
      <p>Your document <strong>${documentTitle}</strong> has been generated successfully.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/documents">View Documents →</a></p>
      <hr>
      <p style="font-size: 12px; color: #666;">LegalMint AI is not a law firm and does not provide legal advice. Consult a qualified advocate for legal matters.</p>
    `,
  });
}
