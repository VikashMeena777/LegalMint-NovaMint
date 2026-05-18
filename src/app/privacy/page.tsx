import Link from "next/link";
import { ArrowLeft, Scale, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Legal<span className="text-primary">Ease</span> AI
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Badge variant="default" className="mb-4">Privacy</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: May 17, 2026</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>DPDP Act 2023 Compliance:</strong> This Privacy Policy is drafted in accordance with the
              Digital Personal Data Protection Act, 2023 (India). LegalMint AI acts as a Data Fiduciary.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <Section number="1" title="Data We Collect">
            <p className="text-muted-foreground mb-4">We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Account Data:</strong> Name, email address, phone number</li>
              <li><strong className="text-foreground">Business Data:</strong> Company name, business type, entity structure, GSTIN, PAN, CIN</li>
              <li><strong className="text-foreground">Usage Data:</strong> Pages visited, documents generated, features used</li>
              <li><strong className="text-foreground">Payment Data:</strong> Processed by Cashfree (we do not store card details)</li>
              <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, cookies</li>
            </ul>
          </Section>

          <Section number="2" title="Purpose of Processing">
            <p className="text-muted-foreground mb-4">We process your data for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Providing and improving the Platform</li>
              <li>Generating legal documents based on your business profile</li>
              <li>Tracking compliance requirements applicable to your business</li>
              <li>Sending regulatory alerts and compliance reminders</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Communicating with you about service updates</li>
              <li>Complying with legal obligations under Indian law</li>
            </ul>
          </Section>

          <Section number="3" title="Legal Basis">
            We process personal data based on your <strong className="text-foreground">consent</strong> (Section 6, DPDP Act 2023) and for
            <strong className="text-foreground"> legitimate purposes</strong> including contract performance and legal compliance.
          </Section>

          <Section number="4" title="Data Storage & Localization">
            All personal data is stored in <strong className="text-foreground">India</strong> using Supabase&apos;s Mumbai region. We do not
            transfer personal data outside India without your explicit consent, in compliance with DPDP Act data
            localization requirements.
          </Section>

          <Section number="5" title="Data Sharing">
            <p className="text-muted-foreground mb-4">We share data only with:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Cashfree:</strong> For payment processing (PCI-DSS compliant)</li>
              <li><strong className="text-foreground">Resend:</strong> For email delivery</li>
              <li><strong className="text-foreground">NVIDIA/Groq:</strong> For AI document generation (anonymized, no personal identifiers)</li>
              <li><strong className="text-foreground">Vercel:</strong> For hosting and infrastructure</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do NOT sell your personal data to third parties. All service providers are bound by data processing
              agreements.
            </p>
          </Section>

          <Section number="6" title="Data Retention">
            We retain your data for as long as your account is active. Upon account deletion, personal data is
            permanently removed within 30 days, except where retention is required by Indian law (e.g., tax records
            under the Income Tax Act, 1961).
          </Section>

          <Section number="7" title="Your Rights (Data Principal Rights)">
            <p className="text-muted-foreground mb-4">Under the DPDP Act 2023, you have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-foreground">Correction:</strong> Update inaccurate or incomplete data</li>
              <li><strong className="text-foreground">Erasure:</strong> Request deletion of your personal data</li>
              <li><strong className="text-foreground">Grievance Redressal:</strong> Raise complaints about data processing</li>
              <li><strong className="text-foreground">Nominate:</strong> Nominate a person to exercise rights in case of death/incapacity</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Exercise these rights via Settings &gt; Data &amp; Privacy, or contact our Data Protection Officer.
            </p>
          </Section>

          <Section number="8" title="Cookies">
            We use essential cookies for authentication and session management. We may use analytics cookies to
            understand Platform usage. You can manage cookie preferences in your browser settings.
          </Section>

          <Section number="9" title="Security Measures">
            We implement industry-standard security measures including encryption in transit (TLS 1.3), Row Level
            Security (RLS) in our database, rate limiting, and security headers. Sensitive fields (PAN, GSTIN) are
            encrypted at rest.
          </Section>

          <Section number="10" title="Children&apos;s Data">
            The Platform is not intended for individuals under 18. We do not knowingly collect data from children.
            If you believe a child has provided personal data, contact us immediately.
          </Section>

          <Section number="11" title="Grievance Redressal">
            <p className="text-muted-foreground mb-4">
              For privacy concerns, contact our Grievance Officer:
            </p>
            <div className="bg-muted/50 border border-border rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <strong>Grievance Officer, LegalMint AI</strong><br />
                  Email: <strong>privacy@legalease.ai</strong><br />
                  Response time: Within 72 hours
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              If unresolved, you may approach the Data Protection Board of India.
            </p>
          </Section>

          <Section number="12" title="Changes to This Policy">
            We may update this Privacy Policy. Material changes will be notified via email and in-app notification.
            Continued use constitutes acceptance of the updated policy.
          </Section>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 LegalMint AI. Data stored in India. Compliant with DPDP Act 2023.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {number}
        </span>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed pl-11">{children}</div>
    </div>
  );
}
