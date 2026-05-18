import Link from "next/link";
import { ArrowRight, CheckCircle, FileText, BarChart3, Bell, Landmark, Lock, CreditCard, Sparkles, Shield, Zap, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-xl text-foreground">
                Legal<span className="text-primary">Mint</span> AI
              </span>
            </Link>
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
          <Badge variant="info" className="mb-8 px-4 py-1.5 text-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Built for Indian Businesses
          </Badge>

          <h1 className="display-md sm:display-lg text-foreground mb-6 animate-slide-up">
            Launch compliant in
            <span className="text-gradient"> 10 minutes</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            Generate DPDP-compliant Privacy Policies, Terms of Service, Employment Agreements, and more.
            Stay updated with Indian regulations automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
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

          <p className="text-sm text-muted-foreground mt-6 animate-fade-in stagger-3">
            Free plan includes 5 documents/month. No credit card required.
          </p>

          {/* Trust markers */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-16 flex-wrap animate-fade-in stagger-4">
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

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Features</Badge>
            <h2 className="display-sm text-foreground mb-4">Everything you need for Indian legal compliance</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From DPDP Act compliance to GST requirements, we cover all major Indian regulations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover-lift border-border/50 hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">Pricing</Badge>
            <h2 className="display-sm text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-xl scale-105 md:scale-110" : "border-border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="info" className="px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="p-6 pb-0">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={plan.href} className="w-full">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 gradient-primary opacity-95" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="display-sm text-white mb-4">Ready to get compliant?</h2>
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
                <span className="text-white font-bold text-xs">L</span>
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
              &copy; 2026 LegalMint AI. Not a substitute for legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
