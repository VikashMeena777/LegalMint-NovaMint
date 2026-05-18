import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Landmark,
  Lock,
  Scale,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    title: "Document generation",
    description: "Generate privacy policies, terms, NDAs, employment agreements, and refund policies tailored for Indian businesses.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    title: "Compliance roadmap",
    description: "Turn business details into a prioritized action plan across DPDP, IT Rules, GST, labour, and consumer obligations.",
  },
  {
    icon: Bell,
    color: "text-secondary",
    bgColor: "bg-secondary/15",
    title: "Regulatory alerts",
    description: "Track open requirements, upcoming filing dates, and changes that need a founder or operations lead to act.",
  },
  {
    icon: Landmark,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    title: "India-first coverage",
    description: "Built around Indian entities, states, payments, data practices, and common compliance workflows.",
  },
  {
    icon: Lock,
    color: "text-sky-600",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    title: "Privacy-aware records",
    description: "Keep business profiles, generated documents, and compliance state organized in one auditable workspace.",
  },
  {
    icon: CreditCard,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    title: "Indian payments",
    description: "Support UPI, cards, net banking, and wallets through Cashfree with plans that scale as usage grows.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Profile the business",
    description: "Answer a guided interview covering entity type, state, data collection, payments, employees, and customers.",
  },
  {
    icon: Scale,
    title: "Map obligations",
    description: "LegalMint creates a compliance checklist with status, category, priority, and review reminders.",
  },
  {
    icon: Sparkles,
    title: "Generate documents",
    description: "Create the policies and agreements needed for the roadmap, then export them for review.",
  },
];

const plans = [
  {
    name: "Free",
    price: "Rs. 0",
    period: "/month",
    features: ["5 documents/month", "Privacy Policy + ToS", "Basic compliance roadmap", "Email support"],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Starter",
    price: "Rs. 499",
    period: "/month",
    features: ["50 documents/month", "All document types", "Full compliance roadmap", "Regulatory alerts", "Priority support"],
    cta: "Get Started",
    href: "/signup",
    popular: true,
  },
  {
    name: "Pro",
    price: "Rs. 1,499",
    period: "/month",
    features: ["200 documents/month", "All document types", "API access", "HTML embeds", "Team collaboration", "Dedicated support"],
    cta: "Get Started",
    href: "/signup",
  },
];

const stats = [
  { value: "10K+", label: "Documents generated" },
  { value: "2.5K+", label: "Businesses served" },
  { value: "99.9%", label: "Uptime target" },
  { value: "4.9/5", label: "User rating" },
];

const previewItems = [
  { label: "DPDP privacy policy", status: "Ready", tone: "success" },
  { label: "Cookie notice", status: "Draft", tone: "warning" },
  { label: "TDS quarterly return", status: "Due soon", tone: "danger" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="sm" />
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Workflow</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/api-docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">API</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
              Sign In
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start Free</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="info" className="mb-5">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Built for Indian compliance teams
              </Badge>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
                LegalMint AI
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A focused compliance workspace for Indian businesses to generate legal documents, track obligations, and act before filing or policy gaps become risk.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
                  Review Features
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-lg border border-border bg-card">
              <div className="grid border-b border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="font-medium text-foreground">Compliance overview</div>
                <div className="mt-1 flex items-center gap-2 sm:mt-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live workspace preview
                </div>
              </div>
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: "Compliance score", value: "76%", icon: BarChart3 },
                      { label: "Open alerts", value: "3", icon: Bell },
                      { label: "Documents", value: "18", icon: FileText },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border bg-background p-2 sm:p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-medium leading-4 text-muted-foreground sm:text-xs">{item.label}</p>
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-semibold text-foreground">DPDP readiness</h2>
                        <p className="mt-1 text-sm text-muted-foreground">9 of 12 requirements marked compliant</p>
                      </div>
                      <span className="text-2xl font-semibold text-primary">75%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div className="h-2 w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
                <div className="hidden p-4 md:block">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Next actions</h2>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {previewItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">Owner: Operations</p>
                        </div>
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium",
                            item.tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                            item.tone === "warning" && "bg-secondary/15 text-foreground",
                            item.tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/35 py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge variant="default" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-semibold text-foreground">Everything needed for a repeatable compliance workflow</h2>
              <p className="mt-3 text-muted-foreground">
                The product is organized around the work users repeat: profile, map, generate, review, and export.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-y border-border bg-muted/35 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge variant="default" className="mb-4">Workflow</Badge>
              <h2 className="text-3xl font-semibold text-foreground">From business profile to reviewed documents</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-border bg-card p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <Badge variant="default" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl font-semibold text-foreground">Simple plans for growing teams</h2>
              <p className="mt-3 text-muted-foreground">Start free, then move to higher document volume and support when the workflow is proven.</p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-lg border bg-card p-6",
                    plan.popular ? "border-primary ring-1 ring-primary" : "border-border"
                  )}
                >
                  {plan.popular && (
                    <Badge variant="info" className="mb-4">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={cn(buttonVariants({ variant: plan.popular ? "default" : "outline" }), "mt-6 w-full")}
                  >
                    {plan.cta}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-foreground py-14 text-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h2 className="text-3xl font-semibold">Ready to organize compliance work?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-background/75">
                Create a workspace, complete onboarding, and generate your first policy without adding another spreadsheet.
              </p>
            </div>
            <Link href="/signup" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "shrink-0")}>
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Logo size="sm" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/disclaimer" className="transition-colors hover:text-foreground">Disclaimer</Link>
            <Link href="/changelog" className="transition-colors hover:text-foreground">Changelog</Link>
            <Link href="/api-docs" className="transition-colors hover:text-foreground">API</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 LegalMint AI. Not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
