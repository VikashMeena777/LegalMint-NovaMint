import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: May 17, 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-700 mb-4">
            By accessing or using LegalEase AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Platform. These terms are governed by the Indian Contract Act, 1872.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Eligibility</h2>
          <p className="text-slate-700 mb-4">
            You must be at least 18 years old and competent to contract under Indian law to use this Platform.
            By using the Platform, you represent and warrant that you meet these requirements.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Description of Service</h2>
          <p className="text-slate-700 mb-4">
            LegalEase AI provides AI-powered legal document generation, compliance tracking, and regulatory alerting
            services exclusively for Indian businesses. The Platform uses artificial intelligence to generate draft
            legal documents based on user-provided information and templates.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. No Legal Advice</h2>
          <p className="text-slate-700 mb-4">
            <strong>LegalEase AI is NOT a law firm and does NOT provide legal advice.</strong> All documents generated
            by the Platform are drafts and should be reviewed by a qualified advocate enrolled with the Bar Council of
            India before use. The Platform does not create an attorney-client relationship.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. User Accounts</h2>
          <p className="text-slate-700 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to accept
            responsibility for all activities under your account. You must notify us immediately of any unauthorized
            use.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Acceptable Use</h2>
          <p className="text-slate-700 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
            <li>Use the Platform for any unlawful purpose under Indian law</li>
            <li>Attempt to reverse engineer, decompile, or disassemble the Platform</li>
            <li>Use automated means to access the Platform except through provided APIs</li>
            <li>Share your account credentials with third parties</li>
            <li>Use generated documents without professional legal review</li>
            <li>Resell or redistribute the Platform without written consent</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-slate-700 mb-4">
            The Platform, including its software, templates, algorithms, and content, is owned by LegalEase AI and
            protected under the Indian Copyright Act, 1957. You retain ownership of documents you generate, but
            grant us a license to use anonymized data for service improvement.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Payment & Subscriptions</h2>
          <p className="text-slate-700 mb-4">
            Subscription fees are billed in advance via Cashfree (UPI, Cards, Net Banking, Wallets). All prices are
            in INR and exclusive of applicable GST. Refunds are governed by our Refund Policy. We reserve the right
            to modify pricing with 30 days notice.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-slate-700 mb-4">
            To the maximum extent permitted under Indian law, LegalEase AI shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Platform, including
            but not limited to losses from use of AI-generated documents without legal review.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">10. Indemnification</h2>
          <p className="text-slate-700 mb-4">
            You agree to indemnify and hold harmless LegalEase AI from any claims, damages, or expenses arising from
            your use of the Platform, violation of these terms, or use of generated documents without professional
            legal review.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">11. Data Protection</h2>
          <p className="text-slate-700 mb-4">
            We process personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
            Data is stored in India. See our Privacy Policy for details on data collection, processing, and your
            rights as a Data Principal.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">12. Termination</h2>
          <p className="text-slate-700 mb-4">
            We may suspend or terminate your access at any time for violation of these terms. Upon termination, your
            right to use the Platform ceases immediately. You may request data export before termination.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">13. Governing Law & Dispute Resolution</h2>
          <p className="text-slate-700 mb-4">
            These terms are governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of
            courts in Bengaluru, Karnataka. Disputes shall first be attempted to be resolved through mediation before
            resorting to litigation.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">14. Changes to Terms</h2>
          <p className="text-slate-700 mb-4">
            We may update these terms at any time. Material changes will be notified via email. Continued use after
            changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">15. Contact</h2>
          <p className="text-slate-700 mb-4">
            For questions about these terms, contact us at <strong>legal@legalease.ai</strong> or write to our
            Grievance Officer at the address provided in our Privacy Policy.
          </p>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 text-center">
            © 2026 LegalEase AI. Not a substitute for legal advice. Consult a qualified advocate.
          </p>
        </div>
      </footer>
    </div>
  );
}
