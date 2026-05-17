# LegalEase AI — India's Legal Compliance Platform

> AI-powered legal document generation and compliance tracking for Indian businesses.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** tRPC v11, Next.js API Routes
- **Database:** Supabase PostgreSQL (Mumbai), Prisma ORM, pgvector
- **Auth:** Supabase Auth (Email/Password, Google OAuth, Phone OTP)
- **AI:** NVIDIA NIM (primary), Groq (fallback)
- **Payments:** Cashfree (UPI, Cards, Net Banking, Wallets)
- **Email:** Resend
- **Hosting:** Vercel
- **Error Tracking:** Sentry

## Indian Regulations Covered

- **DPDP Act 2023** — Digital Personal Data Protection
- **IT Act 2000 + IT Rules 2021** — Intermediary guidelines, data security
- **Consumer Protection Act 2019** — E-commerce rules, grievance redressal
- **Companies Act 2013** — Corporate governance
- **GST Act 2017** — GST compliance
- **Indian Contract Act 1872** — Contract validity
- **Labour Codes** — Code on Wages, OSHWC, EPF, ESI, Gratuity
- **State Laws** — Shops & Establishment Acts (all states)

## Document Types

- Privacy Policy (DPDP Act compliant)
- Terms of Service (Indian Contract Act compliant)
- Cookie Policy (IT Rules 2021 compliant)
- Employment Agreement (Indian labour law)
- Non-Disclosure Agreement
- Refund & Cancellation Policy
- Grievance Redressal Policy
- LLP Agreement
- Founders Agreement
- Vendor/Service Agreement

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (Mumbai region recommended)
- NVIDIA NIM API key
- Groq API key
- Cashfree account (sandbox for testing)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase, NVIDIA NIM, Groq, and Cashfree credentials.

### 3. Set up the database

```bash
# Run Prisma migrations
pnpm db:migrate

# Seed with Indian jurisdictions, compliance requirements, and templates
pnpm db:seed
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
LegalEase-AI/
├── apps/web/                    # Next.js application
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── (marketing)/     # Public pages (landing, login, signup)
│       │   ├── dashboard/       # Dashboard layout + pages
│       │   ├── onboarding/      # AI-driven business onboarding
│       │   ├── documents/       # Document generation
│       │   ├── compliance/      # Compliance tracking
│       │   ├── billing/         # Cashfree payment integration
│       │   ├── settings/        # User settings
│       │   └── api/             # API routes, webhooks
│       ├── components/          # React components
│       ├── server/              # Server-side code
│       │   ├── ai/              # AI service (NVIDIA NIM + Groq)
│       │   └── services/        # Business services
│       ├── lib/                 # Shared utilities
│       └── types/               # TypeScript types
├── packages/
│   ├── db/                      # Prisma schema, seed script
│   └── ai/                      # AI prompts, templates
└── docs/                        # Documentation
```

## Pricing

| Plan | Price | Documents/Month |
|------|-------|----------------|
| Free | ₹0 | 5 |
| Starter | ₹499/mo | 50 |
| Pro | ₹1,499/mo | 200 |
| Enterprise | Custom | Unlimited |

## License

Proprietary — All rights reserved.
