import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
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
          <Badge variant="default" className="mb-4">Terms</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: May 17, 2026</p>
        </div>

        <div className="space-y-8">
          <Section number="1" title="Acceptance of Terms">
            By accessing or using LegalMint AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Platform. These terms are governed by the Indian Contract Act, 1872.
          </Section>

          <Section number="2" title="Eligibility">
            You must be at least 18 years old and competent to contract under Indian law to use this Platform.
            By using the Platform, you represent and warrant that you meet these requirements.
          </Section>

          <Section number="3" title="Description of Service">
            LegalMint AI provides AI-powered legal document generation, compliance tracking, and regulatory alerting
            services exclusively for Indian businesses. The Platform uses artificial intelligence to generate draft
            legal documents based on user-provided information and templates.
          </Section>

          <Section number="4" title="No Legal Advice">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-900 dark:text-amber-100">
                  <strong>LegalMint AI is NOT a law firm and does NOT provide legal advice.</strong> All documents generated
                  by the Platform are drafts and should be reviewed by a qualified advocate enrolled with the Bar Council of
                  India before use. The Platform does not create an attorney-client relationship.
                </p>
              </div>
            </div>
          </Section>

          <Section number="5" title="User Accounts">
            You are responsible for maintaining the confidentiality of your account credentials. You agree to accept
            responsibility for all activities under your account. You must notify us immediately of any unauthorized
            use.
          </Section>

          <Section number="6" title="Acceptable Use">
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Use the Platform for any unlawful purpose under Indian law</li>
              <li>Attempt to reverse engineer, decompile, or disassemble the Platform</li>
              <li>Use automated means to access the Platform except through provided APIs</li>
              <li>Share your account credentials with third parties</li>
              <li>Use generated documents without professional legal review</li>
              <li>Resell or redistribute the Platform without written consent</li>
            </ul>
          </Section>

          <Section number="7" title="Intellectual Property">
            The Platform, including its software, templates, algorithms, and content, is owned by LegalMint AI and
            protected under the Indian Copyright Act, 1957. You retain ownership of documents you generate, but
            grant us a license to use anonymized data for service improvement.
          </Section>

          <Section number="8" title="Payment & Subscriptions">
            Subscription fees are billed in advance via Cashfree (UPI, Cards, Net Banking, Wallets). All prices are
            in INR and exclusive of applicable GST. Refunds are governed by our Refund Policy. We reserve the right
            to modify pricing with 30 days notice.
          </Section>

          <Section number="9" title="Limitation of Liability">
            To the maximum extent permitted under Indian law, LegalMint AI shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Platform, including
            but not limited to losses from use of AI-generated documents without legal review.
          </Section>

          <Section number="10" title="Indemnification">
            You agree to indemnify and hold harmless LegalMint AI from any claims, damages, or expenses arising from
            your use of the Platform, violation of these terms, or use of generated documents without professional
            legal review.
          </Section>

          <Section number="11" title="Data Protection">
            We process personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
            Data is stored in India. See our Privacy Policy for details on data collection, processing, and your
            rights as a Data Principal.
          </Section>

          <Section number="12" title="Termination">
            We may suspend or terminate your access at any time for violation of these terms. Upon termination, your
            right to use the Platform ceases immediately. You may request data export before termination.
          </Section>

          <Section number="13" title="Governing Law & Dispute Resolution">
            These terms are governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of
            courts in Bengaluru, Karnataka. Disputes shall first be attempted to be resolved through mediation before
            resorting to litigation.
          </Section>

          <Section number="14" title="Changes to Terms">
            We may update these terms at any time. Material changes will be notified via email. Continued use after
            changes constitutes acceptance of the new terms.
          </Section>

          <Section number="15" title="Contact">
            For questions about these terms, contact us at <strong className="text-foreground">legal@legalmint.ai</strong> or write to our
            Grievance Officer at the address provided in our Privacy Policy.
          </Section>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 LegalMint AI. Not a substitute for legal advice. Consult a qualified advocate.
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
