import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  BarChart3,
  Bell,
  Landmark,
  Lock,
  CreditCard,
  Sparkles,
  Shield,
  Zap,
  Scale,
  Clock,
  Users,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    title: "AI Document Generation",
    description: "Generate Privacy Policies, Terms of Service, Employment Agreements, NDAs, and more — all compliant with Indian law.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    title: "Compliance Roadmap",
    description: "Get a personalized, prioritized list of compliance actions based on your business type, jurisdiction, and data practices.",
  },
  {
    icon: Bell,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    title: "Regulatory Alerts",
    description: "Stay updated when Indian laws change. Get alerts for DPDP Act updates, IT Rules changes, and new regulations.",
  },
  {
    icon: Landmark,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    title: "India-First",
    description: "Built exclusively for Indian jurisdiction — DPDP Act, IT Act, Consumer Protection Act, Companies Act, GST, and more.",
  },
  {
    icon: Lock,
    color: "text-sky-600",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    title: "Data Stored in India",
    description: "All your data is stored in India, compliant with DPDP Act data localization requirements.",
  },
  {
    icon: CreditCard,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    title: "Indian Payments",
    description: "Pay via UPI, Cards, Net Banking, or Wallets through Cashfree. Plans starting at ₹499/month.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required to get started.",
  },
  {
    icon: FileText,
    title: "Tell Us About Your Business",
    description: "Answer a few simple questions about your business type and compliance needs.",
  },
  {
    icon: Sparkles,
    title: "Get Compliant Documents",
    description: "AI generates your legal documents instantly, tailored to Indian regulations.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    features: ["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    features: ["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"],
    cta: "Get Started",
    href: "/signup",
    popular: true,
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    features: ["200 documents/month", "All document types", "API access", "HTML embed snippets", "Team collaboration", "Dedicated support"],
    cta: "Get Started",
    href: "/signup",
  },
];

const stats = [
  { value: "10K+", label: "Documents Generated" },
  { value: "2.5K+", label: "Businesses Served" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/api-docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Start Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-b from-secondary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="info" className="mb-8 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Built for Indian Businesses
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6">
            Launch compliant in
            <span className="text-gradient"> 10 minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate DPDP-compliant Privacy Policies, Terms of Service, Employment Agreements, and more.
            Stay updated with Indian regulations automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                See Features
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Free plan includes 5 documents/month. No credit card required.
          </p>

          {/* Trust markers */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-16 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              DPDP Act Compliant
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-secondary" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scale className="w-4 h-4 text-amber-500" />
              Indian Jurisdiction
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need for Indian legal compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From DPDP Act compliance to GST requirements, we cover all major Indian regulations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Three steps to compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes, not days. Our AI handles the heavy lifting.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 to-primary/0" />
                )}
                <div className="relative z-10 w-24 h-24 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card border rounded-xl p-8 ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="info" className="px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 gradient-primary opacity-95" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get compliant?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Indian businesses using LegalMint AI to stay compliant and protected.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base px-10 py-6 shadow-xl"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">LegalMint AI</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
              <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
              <Link href="/api-docs" className="hover:text-foreground transition-colors">API</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 LegalMint AI. Not a substitute for legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
