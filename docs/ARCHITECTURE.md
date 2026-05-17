# LegalEase AI — System Architecture Document

**Version:** 2.0 (India Edition)  
**Last Updated:** May 2026  
**Status:** Production  
**Market:** India Only

LegalEase AI is a SaaS platform that automates Indian legal document generation, compliance checking, and contract analysis for businesses operating in India. It leverages LLM-based pipelines (NVIDIA NIM + Groq) to produce jurisdiction-aware legal documents backed by structured validation and RAG-augmented retrieval.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE CDN                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Next.js 14 App Router (SSR/SSG/ISR)         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐    │   │
│  │  │  Pages   │  │  Layouts │  │  React Server        │    │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘    │   │
│  │       │             │                    │                │   │
│  │       ▼             ▼                    ▼                │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │               tRPC v11 Router Layer                  │  │   │
│  │  │  ┌─────────┐ ┌───────────┐ ┌────────────────────┐   │  │   │
│  │  │  │ auth    │ │ document  │ │ compliance         │   │  │   │
│  │  │  │ Router  │ │ Router    │ │ Router             │   │  │   │
│  │  │  └────┬────┘ └─────┬─────┘ └─────────┬──────────┘   │  │   │
│  │  │       │            │                 │              │  │   │
│  │  │  ┌────┴────────────┴─────────────────┴──────────┐   │  │   │
│  │  │  │  Middleware: Auth Guard, Rate Limiter,       │   │  │   │
│  │  │  │  Input Validation (Zod), Audit Logger        │   │  │   │
│  │  │  └─────────────────────┬────────────────────────┘   │  │   │
│  │  └────────────────────────┼────────────────────────────┘  │   │
│  └────────────────────────────┼──────────────────────────────┘   │
└───────────────────────────────┼──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│  Supabase     │  │  Supabase Auth      │  │  NVIDIA NIM API     │
│  PostgreSQL   │  │  (Email/Google/OTP) │  │  (LLM Inference)    │
│  (Mumbai)     │  │  JWT Sessions       │  │  Groq (Fallback)    │
│  Prisma ORM   │  │  Row-Level Security │  │  Structured Outputs │
│  pgvector     │  └─────────────────────┘  └──────────┬───────────┘
└───────────────┘                                       │
                                               ┌────────┴───────────┐
                                               │  pgvector (RAG)    │
                                               │  (Supabase native) │
                                               └────────────────────┘
        ┌───────────────────────────────────────────────────────┐
        │                 EXTERNAL SERVICES                      │
        │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
        │  │ Cashfree │  │ Sentry   │  │ Resend             │   │
        │  │ Payments │  │ Error    │  │ Transactional      │   │
        │  │ (UPI,    │  │ Tracking │  │ Emails             │   │
        │  │  Cards)  │  │          │  │                    │   │
        │  └──────────┘  └──────────┘  └────────────────────┘   │
        └───────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 14 (App Router) | SSR/SSG, React Server Components |
| **Language** | TypeScript 5.x (strict mode) | End-to-end type safety |
| **Styling** | Tailwind CSS 3.x + shadcn/ui | Utility-first CSS, accessible components |
| **Animation** | Framer Motion 11.x | Page transitions, micro-interactions |
| **API Layer** | Next.js API Routes + tRPC v11 | Type-safe RPC |
| **Validation** | Zod 3.x | Schema validation for all I/O |
| **Database** | Supabase PostgreSQL (Mumbai) | Relational data, pgvector for RAG |
| **ORM** | Prisma 5.x | Type-safe queries, migrations |
| **Auth** | Supabase Auth | Email/Password, Google OAuth, Phone OTP |
| **LLM Primary** | NVIDIA NIM (meta/llama-3.1-70b) | Document generation, compliance analysis |
| **LLM Fallback** | Groq (llama-3.1-70b) | Fallback inference, faster responses |
| **Embeddings** | NVIDIA NIM (nv-embedqa-e5-v5) | 1024-dim embeddings for legal retrieval |
| **Vector DB** | pgvector (Supabase native) | Semantic search, no external dependency |
| **Payments** | Cashfree | UPI, Cards, Net Banking, Wallets, Subscriptions |
| **File Storage** | Supabase Storage | Uploaded documents, generated PDFs |
| **Email** | Resend | Transactional emails, onboarding sequences |
| **Error Tracking** | Sentry | Frontend & backend error monitoring |
| **Hosting** | Vercel (Pro) | Edge functions, ISR, Cron jobs |
| **CI/CD** | GitHub Actions | Lint → Type-check → Test → Deploy |

---

## 3. System Architecture (Mermaid)

```mermaid
graph TD
    U[User Browser] -->|HTTPS| CDN[Cloudflare CDN]
    CDN --> V[Vercel Edge]
    V --> FE[Next.js App Router]
    FE --> TRPC[tRPC Router Layer]
    TRPC --> MW[Auth Middleware]
    MW --> SV[Service Layer]

    SV --> DB[(Supabase PostgreSQL)]
    SV --> AUTH[Supabase Auth]
    SV --> NIM[NVIDIA NIM API]
    SV --> GROQ[Groq API]
    SV --> PGV[pgvector (Supabase)]
    SV --> CF[Cashfree API]
    SV --> SS[Supabase Storage]

    SV --> RAG[RAG Pipeline]
    RAG --> EMB[NVIDIA Embeddings]
    RAG --> PGV
    RAG --> NIM

    SV --> VC[Vercel Cron Jobs]
    VC --> DB
    VC --> CF
```

---

## 4. tRPC API Design

### Router Hierarchy

```
appRouter
├── auth
│   ├── signup            ── mutation: creates user via Supabase
│   ├── login             ── mutation: Supabase auth, returns session
│   ├── logout            ── mutation: invalidates session
│   ├── me                ── query: current user + profile
│   ├── verifyEmail       ── mutation: email verification
│   ├── resetPassword     ── mutation: password reset
│   └── sendOTP           ── mutation: phone OTP login
│
├── onboarding
│   ├── startInterview    ── mutation: begin AI onboarding
│   ├── submitAnswer      ── mutation: submit onboarding answer
│   ├── getProgress       ── query: onboarding progress
│   └── completeOnboarding ── mutation: finalize, generate roadmap
│
├── businessProfile
│   ├── get               ── query: fetch business profile
│   ├── update            ── mutation: update profile
│   └── delete            ── mutation: soft-delete profile
│
├── template
│   ├── list              ── query: template catalog (filter by category)
│   ├── getById           ── query: template with variables
│   └── getVariables      ── query: extract variable names
│
├── document
│   ├── generate          ── mutation: generate from template + inputs
│   ├── getById           ── query: fetch document
│   ├── list              ── query: paginated document list
│   ├── update            ── mutation: edit document
│   ├── delete            ── mutation: soft-delete
│   ├── exportPdf         ── mutation: render to PDF
│   ├── clone             ── mutation: duplicate document
│   └── getHistory        ── query: version history
│
├── compliance
│   ├── scan              ── mutation: run compliance check
│   ├── getReport         ── query: fetch compliance report
│   ├── listReports       ── query: paginated reports
│   └── getRegulations    ── query: supported Indian regulations
│
├── billing
│   ├── getPlans          ── query: subscription plans (INR pricing)
│   ├── getCurrentPlan    ── query: current subscription
│   ├── createPaymentLink ── mutation: Cashfree payment link
│   ├── createSubscription ── mutation: Cashfree subscription
│   └── getInvoices       ── query: past invoices
│
├── webhook
│   ├── cashfree          ── mutation: Cashfree webhook handler
│   └── resend            ── mutation: email delivery webhook
│
├── file
│   ├── getUploadUrl      ── mutation: presigned Supabase Storage URL
│   ├── upload            ── mutation: accept file, validate, store
│   └── delete            ── mutation: mark deleted
│
├── ai
│   ├── chat              ── mutation: streaming legal AI assistant
│   ├── suggestClause     ── mutation: clause suggestion
│   ├── summarize         ── mutation: summarize document
│   └── compareDocuments  ── mutation: diff two documents
│
├── alerts
│   ├── list              ── query: compliance alerts
│   ├── markRead          ── mutation: mark alert as read
│   └── dismiss           ── mutation: dismiss alert
│
└── analytics
    ├── getDashboard      ── query: aggregate stats
    └── getUsageOverTime  ── query: time-series usage data
```

---

## 5. Database Schema

Key tables (Supabase PostgreSQL via Prisma):

- **User** — id, email, name, phone, role, created_at
- **BusinessProfile** — id, user_id, company_name, business_type, gstin, pan, cin, incorporated_state, operating_states, employee_count, annual_revenue, data_practices
- **Jurisdiction** — id, name, code (IN-CENTRAL, IN-KA, IN-MH, etc.), region, key_regulations
- **ComplianceRequirement** — id, jurisdiction_id, name, category (PRIVACY/CONSUMER/EMPLOYMENT/TAX/GST), description, is_mandatory, penalty_description
- **ComplianceMapping** — id, business_profile_id, requirement_id, status, notes
- **DocumentTemplate** — id, name, category, version, template_content, applicable_jurisdictions, required_fields
- **Document** — id, user_id, business_profile_id, template_id, title, content, version, status, generated_by_ai, ai_model, tokens_used
- **DocumentVersion** — id, document_id, version_number, content, created_by
- **ComplianceReport** — id, document_id, user_id, risk_score, frameworks_checked, status
- **Violation** — id, report_id, severity, title, description, suggestion
- **Subscription** — id, user_id, cashfree_customer_id, cashfree_subscription_id, plan, status, period_start, period_end
- **ComplianceAlert** — id, user_id, type, title, description, is_read
- **AuditLog** — id, user_id, action, resource_type, resource_id, metadata, ip_address

---

## 6. AI Pipeline Architecture

### 6.1 Pipeline

```
Input → Context Builder → RAG Retrieval (pgvector) → Prompt Assembly
→ LLM Inference (NVIDIA NIM → fallback Groq) → Output Validation → Response
```

### 6.2 LLM Configuration

| Parameter | NVIDIA NIM | Groq (Fallback) |
|-----------|-----------|-----------------|
| **Model** | meta/llama-3.1-70b-instruct | llama-3.1-70b-versatile |
| **Temperature** | 0.1 (documents), 0.3 (chat) | Same |
| **Max Tokens** | 16,384 (docs), 4,096 (chat) | 8,192 |
| **Embeddings** | nv-embedqa-e5-v5 (1024d) | — |

### 6.3 Prompt Engineering

System prompts follow 4-layer architecture:
1. **Base Persona** — LegalEase AI identity, disclaimers, boundaries
2. **Legal Domain Context** — Indian legal principles, definitions
3. **Jurisdiction Overlay** — Central/State-specific statutes
4. **Use-Case Instructions** — Task-specific (draft ToS, map compliance, etc.)

### 6.4 Output Validation

- JSON schema validation via Zod
- Disclaimer presence check
- Jurisdiction reference verification
- Clause completeness check
- Confidence scoring (≥ 0.90 auto-approve, 0.70–0.89 warning, < 0.70 flag for review)

---

## 7. Security Architecture

### 7.1 Authentication
- Supabase Auth with JWT sessions
- Email/Password, Google OAuth, Phone OTP
- Row-Level Security (RLS) on all tables
- Session stored in httpOnly cookies

### 7.2 Data Encryption
- **In Transit:** TLS 1.3
- **At Rest:** Supabase managed AES-256
- **PII Fields:** Application-level encryption for sensitive fields

### 7.3 API Security
- Zod input validation on all tRPC procedures
- Rate limiting: 200 req/min global, 5 req/min auth, 10 req/min AI
- CSP headers, HSTS, X-Content-Type-Options
- Cashfree webhooks validated via signature verification

---

## 8. Scalability

### 8.1 Caching

| Cache Layer | TTL | Scope |
|---|---|---|
| Template catalog | 1 hour | Global |
| User session | 24 hours | Per-user |
| AI response cache | 15 minutes | Per-user |
| Compliance regulation | 24 hours | Global |

### 8.2 Rate Limiting

| Tier | API req/min | AI req/min | Docs/day |
|---|---|---|---|
| Free | 30 | 3 | 5 |
| Starter (₹499) | 100 | 10 | 50 |
| Pro (₹1,499) | 300 | 30 | 200 |
| Enterprise | Custom | Custom | Unlimited |

### 8.3 Background Jobs (Vercel Cron)

| Job | Schedule | Description |
|---|---|---|
| sync-cashfree-subscriptions | Hourly | Refresh subscription status |
| embed-regulations | Weekly | Re-embed updated Indian regulations into pgvector |
| cleanup-temp-files | Daily | Delete old temp files from Supabase Storage |
| send-usage-reports | Monthly | Email users with monthly usage summary |

---

## 9. Monitoring & Observability

- **Sentry:** Error tracking, P1/P2 alerts
- **Structured Logging:** Pino → Logtail
- **Vercel Analytics:** Web vitals, performance
- **Health Check:** `GET /api/health` — DB, Auth, LLM reachability

---

## 10. CI/CD Pipeline

```
main → Production (Vercel)
feat/* → Preview (Vercel) → PR → main
```

Quality gate: ESLint → TypeScript → Prettier → Tests → Build → Deploy

---

## 11. File Structure

```
LegalEase-AI/
├── apps/web/
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── (marketing)/        # Public pages
│       │   ├── (dashboard)/        # Authenticated pages
│       │   └── api/                # API routes, webhooks
│       ├── components/             # React components
│       ├── server/                 # Server-side code
│       │   ├── trpc/               # tRPC routers
│       │   ├── ai/                 # AI pipeline
│       │   └── services/           # Business services
│       └── lib/                    # Shared utilities
├── packages/
│   ├── db/                         # Prisma schema, client
│   ├── ai/                         # Prompts, templates
│   └── config/                     # Shared config
├── docs/
├── docker-compose.yml              # Local dev (PostgreSQL, Redis, Mailpit)
└── .env.example
```
