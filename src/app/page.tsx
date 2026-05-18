import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-slate-900">LegalEase AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Built for Indian Businesses
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Launch compliant in
            <span className="text-blue-600"> 10 minutes</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Generate DPDP-compliant Privacy Policies, Terms of Service, Employment Agreements, and more. 
            Stay updated with Indian regulations automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="#features"
              className="text-slate-700 px-8 py-3 rounded-lg text-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              See Features
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Free plan includes 5 documents/month. No credit card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need for Indian legal compliance</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From DPDP Act compliance to GST requirements, we cover all major Indian regulations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📝"
              title="AI Document Generation"
              description="Generate Privacy Policies, Terms of Service, Employment Agreements, NDAs, and more — all compliant with Indian law."
            />
            <FeatureCard
              icon="📊"
              title="Compliance Roadmap"
              description="Get a personalized, prioritized list of compliance actions based on your business type, jurisdiction, and data practices."
            />
            <FeatureCard
              icon="🔔"
              title="Regulatory Alerts"
              description="Stay updated when Indian laws change. Get alerts for DPDP Act updates, IT Rules changes, and new regulations."
            />
            <FeatureCard
              icon="🇮🇳"
              title="India-First"
              description="Built exclusively for Indian jurisdiction — DPDP Act, IT Act, Consumer Protection Act, Companies Act, GST, and more."
            />
            <FeatureCard
              icon="🔒"
              title="Data Stored in India"
              description="All your data is stored in India, compliant with DPDP Act data localization requirements."
            />
            <FeatureCard
              icon="💳"
              title="Indian Payments"
              description="Pay via UPI, Cards, Net Banking, or Wallets through Cashfree. Plans starting at ₹499/month."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="₹0"
              period="/month"
              features={["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"]}
              cta="Start Free"
              href="/signup"
            />
            <PricingCard
              name="Starter"
              price="₹499"
              period="/month"
              features={["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"]}
              cta="Get Started"
              href="/signup"
              popular
            />
            <PricingCard
              name="Pro"
              price="₹1,499"
              period="/month"
              features={["200 documents/month", "All document types", "API access", "HTML embed snippets", "Team collaboration", "Dedicated support"]}
              cta="Get Started"
              href="/signup"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get compliant?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Indian businesses using LegalEase AI to stay compliant and protected.
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors inline-block"
          >
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="font-semibold text-slate-900">LegalEase AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/disclaimer" className="hover:text-slate-900">Disclaimer</Link>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 LegalEase AI. Not a substitute for legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-xl border ${popular ? "border-blue-600 shadow-lg relative" : "border-slate-200"}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${
          popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
