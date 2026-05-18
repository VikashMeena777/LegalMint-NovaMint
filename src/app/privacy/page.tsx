import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-slate-900">LegalEase AI</span>
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: May 17, 2026</p>

        <div className="prose prose-slate max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>DPDP Act 2023 Compliance:</strong> This Privacy Policy is drafted in accordance with the
              Digital Personal Data Protection Act, 2023 (India). LegalEase AI acts as a Data Fiduciary.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Data We Collect</h2>
          <p className="text-slate-700 mb-4">We collect the following categories of personal data:</p>
          <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
            <li><strong>Account Data:</strong> Name, email address, phone number</li>
            <li><strong>Business Data:</strong> Company name, business type, entity structure, GSTIN, PAN, CIN</li>
            <li><strong>Usage Data:</strong> Pages visited, documents generated, features used</li>
            <li><strong>Payment Data:</strong> Processed by Cashfree (we do not store card details)</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Purpose of Processing</h2>
          <p className="text-slate-700 mb-4">We process your data for:</p>
          <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
            <li>Providing and improving the Platform</li>
            <li>Generating legal documents based on your business profile</li>
            <li>Tracking compliance requirements applicable to your business</li>
            <li>Sending regulatory alerts and compliance reminders</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Communicating with you about service updates</li>
            <li>Complying with legal obligations under Indian law</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Legal Basis</h2>
          <p className="text-slate-700 mb-4">
            We process personal data based on your <strong>consent</strong> (Section 6, DPDP Act 2023) and for
            <strong> legitimate purposes</strong> including contract performance and legal compliance.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Data Storage & Localization</h2>
          <p className="text-slate-700 mb-4">
            All personal data is stored in <strong>India</strong> using Supabase&apos;s Mumbai region. We do not
            transfer personal data outside India without your explicit consent, in compliance with DPDP Act data
            localization requirements.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Data Sharing</h2>
          <p className="text-slate-700 mb-4">We share data only with:</p>
          <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
            <li><strong>Cashfree:</strong> For payment processing (PCI-DSS compliant)</li>
            <li><strong>Resend:</strong> For email delivery</li>
            <li><strong>NVIDIA/Groq:</strong> For AI document generation (anonymized, no personal identifiers)</li>
            <li><strong>Vercel:</strong> For hosting and infrastructure</li>
          </ul>
          <p className="text-slate-700 mb-4">
            We do NOT sell your personal data to third parties. All service providers are bound by data processing
            agreements.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Data Retention</h2>
          <p className="text-slate-700 mb-4">
            We retain your data for as long as your account is active. Upon account deletion, personal data is
            permanently removed within 30 days, except where retention is required by Indian law (e.g., tax records
            under the Income Tax Act, 1961).
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Your Rights (Data Principal Rights)</h2>
          <p className="text-slate-700 mb-4">Under the DPDP Act 2023, you have the right to:</p>
          <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Grievance Redressal:</strong> Raise complaints about data processing</li>
            <li><strong>Nominate:</strong> Nominate a person to exercise rights in case of death/incapacity</li>
          </ul>
          <p className="text-slate-700 mb-4">
            Exercise these rights via Settings &gt; Data &amp; Privacy, or contact our Data Protection Officer.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Cookies</h2>
          <p className="text-slate-700 mb-4">
            We use essential cookies for authentication and session management. We may use analytics cookies to
            understand Platform usage. You can manage cookie preferences in your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">9. Security Measures</h2>
          <p className="text-slate-700 mb-4">
            We implement industry-standard security measures including encryption in transit (TLS 1.3), Row Level
            Security (RLS) in our database, rate limiting, and security headers. Sensitive fields (PAN, GSTIN) are
            encrypted at rest.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">10. Children&apos;s Data</h2>
          <p className="text-slate-700 mb-4">
            The Platform is not intended for individuals under 18. We do not knowingly collect data from children.
            If you believe a child has provided personal data, contact us immediately.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">11. Grievance Redressal</h2>
          <p className="text-slate-700 mb-4">
            For privacy concerns, contact our Grievance Officer:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-700">
              <strong>Grievance Officer, LegalEase AI</strong><br />
              Email: <strong>privacy@legalease.ai</strong><br />
              Response time: Within 72 hours
            </p>
          </div>
          <p className="text-slate-700 mb-4">
            If unresolved, you may approach the Data Protection Board of India.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">12. Changes to This Policy</h2>
          <p className="text-slate-700 mb-4">
            We may update this Privacy Policy. Material changes will be notified via email and in-app notification.
            Continued use constitutes acceptance of the updated policy.
          </p>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 text-center">
            © 2026 LegalEase AI. Data stored in India. Compliant with DPDP Act 2023.
          </p>
        </div>
      </footer>
    </div>
  );
}
