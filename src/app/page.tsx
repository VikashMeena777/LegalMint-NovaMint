"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  ArrowRight,
  Shield,
  FileText,
  Bell,
  CheckCircle,
  Database,
  CreditCard,
  ChevronRight,
  HelpCircle,
  Building,
  ArrowUpRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const features = [
  {
    icon: FileText,
    title: "AI Document Builder",
    description:
      "Generate custom privacy policies, terms of service, employment agreements, and non-disclosure agreements tailored for Indian law.",
    color: "text-amber-600 dark:text-amber-500",
    bgColor: "bg-amber-100/60 dark:bg-amber-950/30",
  },
  {
    icon: Scale,
    title: "Active Compliance Tracker",
    description:
      "Track your compliance status dynamically. Get a personalized compliance roadmap mapped to your entity structure and business model.",
    color: "text-blue-600 dark:text-blue-500",
    bgColor: "bg-blue-100/60 dark:bg-blue-950/30",
  },
  {
    icon: Bell,
    title: "Regulatory Change Alerts",
    description:
      "Stay ahead of regulatory modifications. Get automatic alerts and updates regarding the DPDP Act 2023, IT Rules, and SEBI compliance.",
    color: "text-emerald-600 dark:text-emerald-500",
    bgColor: "bg-emerald-100/60 dark:bg-emerald-950/30",
  },
  {
    icon: Shield,
    title: "DPDP Act Safeguards",
    description:
      "Ensure robust user consent flows and data fiduciary management protocols that align directly with the Digital Personal Data Protection Act.",
    color: "text-purple-600 dark:text-purple-500",
    bgColor: "bg-purple-100/60 dark:bg-purple-950/30",
  },
  {
    icon: Database,
    title: "Secure Data Localization",
    description:
      "100% of your generated agreements and business profiles are stored securely in Indian data centers, strictly satisfying compliance rules.",
    color: "text-rose-600 dark:text-rose-500",
    bgColor: "bg-rose-100/60 dark:bg-rose-950/30",
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description:
      "Simple local billing via UPI, NetBanking, and credit cards powered by Cashfree. Pay in INR with transparent business tax invoicing.",
    color: "text-indigo-600 dark:text-indigo-500",
    bgColor: "bg-indigo-100/60 dark:bg-indigo-950/30",
  },
];

const steps = [
  {
    icon: Building,
    title: "Describe Your Business",
    description: "Provide entity details, industry focus, and data practices in a simple 3-minute guided onboarding process.",
  },
  {
    icon: Scale,
    title: "Map Requirements",
    description: "Our legal AI evaluates current legislation (DPDP, IT Act, GST) to establish your customized compliance obligations.",
  },
  {
    icon: Sparkles,
    title: "Generate & Protect",
    description: "Select and generate legally vetted policies. Embed consent widgets and automatically monitor regulatory changes.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    features: [
      "5 generated documents / month",
      "Standard Privacy Policy & ToS",
      "Basic compliance roadmap",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    features: [
      "50 generated documents / month",
      "All document types & custom policies",
      "Full interactive compliance roadmap",
      "Instant regulatory change alerts",
      "Priority customer support",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: true,
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    features: [
      "200 generated documents / month",
      "All document types + custom templates",
      "Compliance API integration access",
      "HTML client consent embed snippets",
      "Team workspace collaboration",
      "Dedicated account manager",
    ],
    cta: "Go Pro",
    href: "/signup",
    popular: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // easeOutQuart
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/api-docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              API
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--secondary-light),transparent_50%)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-xs font-semibold mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                DPDP Act 2023 Fully Supported
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
              >
                Legal Compliance, Automated for{" "}
                <span className="text-gradient-gold font-semibold italic">Indian Businesses</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
              >
                Generate legally vetted agreements, monitor regulatory shifts automatically, and establish trust with Indian fiduciaries. Built exclusively for Indian jurisdictions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link href="/signup" className="w-full">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-lg shadow-primary/10">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link href="#features" className="w-full">
                    <Button size="lg" variant="outline" className="w-full px-8 py-6 text-base font-medium">
                      Explore Features
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-6 text-xs text-muted-foreground"
              >
                Free plan includes 5 documents / month. No credit card required.
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-24 border-t border-border/40 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-3 py-1 text-xs font-semibold mb-4">
                Platform Capabilities
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Everything required for Indian compliance work
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                LegalMint AI organizes compliance into custom modules, generating policies, tracking statuses, and auditing data practices.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="legal-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-6`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{feature.description}</p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-secondary-text hover:opacity-90 transition-colors cursor-pointer group">
                    Learn more
                    <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-24 border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-3 py-1 text-xs font-semibold mb-4">
                How It Works
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Three steps to a compliant operation
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No law firm visits or manual spreadsheets required. LegalMint AI handles the complexity.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex flex-col items-center text-center px-4"
                >
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 border-t border-dashed border-border/80" />
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-6 font-bold shadow-md shadow-secondary/5">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2.5">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 border-t border-border/40 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 px-3 py-1 text-xs font-semibold mb-4">
                Pricing Plans
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Transparent options for growing firms
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start with document drafts, then expand to active roadmaps and regulatory notifications.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex flex-col justify-between p-8 rounded-2xl border hover-lift transition-all duration-300 ${
                    plan.popular
                      ? "border-secondary/60 bg-card shadow-xl shadow-secondary/5 ring-1 ring-secondary/40 scale-105"
                      : "border-border/60 bg-card/60"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-secondary text-secondary-foreground font-semibold px-3.5 py-1 text-[11px] shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        RECOMMENDED
                      </Badge>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-3 mb-6">
                      <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-xs">{plan.period}</span>
                    </div>
                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={plan.href} className="block mt-4">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full py-5 text-sm font-semibold rounded-lg ${
                        plan.popular ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : ""
                      }`}
                    >
                      {plan.cta}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-24 sm:py-32 brand-panel overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(40_50%_50%),transparent_70%)] opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-6 text-white">
              Establish institutional trust in India
            </h2>
            <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
              Complete the business onboarding questionnaire, map your legal objectives, and download your first compliance-ready document today.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-[hsl(40,50%,50%)] hover:bg-[hsl(40,50%,45%)] text-white px-10 py-6 text-base font-bold shadow-lg shadow-black/15">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-16 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Logo size="md" />
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
              <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
              <Link href="/api-docs" className="hover:text-foreground transition-colors">API</Link>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              &copy; 2026 LegalMint AI. All rights reserved.<br />
              Not a substitute for professional legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
