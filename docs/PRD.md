# LegalEase AI — Product Requirements Document (PRD)

> **Version:** 2.0 (India Edition)  
> **Status:** Draft  
> **Last Updated:** 2026-05-17  
> **Market Focus:** India Only

---

## 1. Executive Summary

### 1.1 Vision

LegalEase AI transforms legal compliance from a reactive, expensive bottleneck into a proactive, intelligent, and affordable self-service experience for Indian businesses. Every business in India — from solo founders in Bangalore to MSMEs in Tier-2 cities — can operate with full legal confidence, protected by continuously updated, India-specific compliance infrastructure.

### 1.2 Mission

Democratize access to business-critical legal documentation and compliance intelligence for the Indian market by combining LLMs (NVIDIA NIM + Groq) with a curated, attorney-reviewed Indian legal knowledge graph.

### 1.3 Core Value Proposition

| For... | LegalEase AI delivers... | Instead of... |
|---|---|---|
| **Solo Founders** | Complete compliant Indian legal stack in under 10 minutes | Spending ₹50,000–₹2,00,000 on advocates and waiting 3–4 weeks |
| **MSME Owners** | Continuous compliance monitoring with alerts when Indian laws change | Manually tracking MCA, GSTN, and state portal updates |
| **Startup CTOs** | API-first embeddable documents that auto-update per DPDP Act | Hardcoding legal pages that go stale within months |

### 1.4 Platform Tenets

1. **India-First:** Built exclusively for Indian jurisdiction — Central laws, State laws, DPDP Act, GST, Companies Act, IT Act, Labour Codes
2. **Accuracy Over Speed:** Every document defensible under Indian law
3. **Transparent Limitations:** Not a law firm; recommend qualified Indian advocate for complex situations
4. **Continuous Compliance:** Living documents that update when Indian regulations change
5. **DPDP-Compliant:** Data encrypted, stored in India, never trained on customer data

---

## 2. Problem Statement

### 2.1 Market Context

India has **63+ million MSMEs** contributing ~30% to GDP. Legal tech penetration among Indian SMEs remains below **5%**. The DPDP Act 2023 has created urgent compliance needs for every business handling Indian citizens' data.

### 2.2 Quantitative Pain Points

| Pain Point | Data Point |
|---|---|
| Cost of basic incorporation docs | ₹15,000–₹50,000 (advocate-drafted) |
| Cost of ToS + Privacy Policy | ₹30,000–₹1,50,000 |
| Average time to first compliant document | 3–6 weeks |
| Indian startups without Privacy Policy | ~40% of pre-seed startups |
| Regulatory changes per year | 200+ across Central + State laws |

### 2.3 Why Now?

1. **DPDP Act 2023** — Urgent compliance needs for every business
2. **LLM Maturity** — NVIDIA NIM + Groq enable fast, accurate legal document generation
3. **Digital India Push** — UPI, ONDC, Account Aggregator have digitized operations; legal compliance is next
4. **Market Demand** — Explosion of solo founders, indie hackers, D2C brands

---

## 3. Target Users & Personas

### 3.1 Persona 1: Solo Founder (Arjun)
- 27, B2B SaaS from Bangalore, Private Limited
- Legal budget: < ₹10,000
- Needs: DPDP-compliant Privacy Policy, ToS, Cookie Policy in < 15 min

### 3.2 Persona 2: MSME Owner (Priya)
- 40, 3-location retail chain in Maharashtra, expanding to Gujarat/Rajasthan
- Legal budget: ₹50,000–₹80,000/year
- Needs: Multi-state compliance dashboard, GST, Shop & Establishment alerts

### 3.3 Persona 3: Startup CTO (Vikram)
- 33, Series A fintech in Mumbai, 40 employees
- Legal budget: ₹5,00,000–₹8,00,000/year
- Needs: API-first embeddable docs, auto-updating per DPDP Act

---

## 4. Core Features

### 4.1 Business Intelligence Onboarding (P0)
AI-driven conversational interviewer for Indian business context:
- Entity type (Proprietorship, Partnership, LLP, Pvt Ltd, OPC)
- State of registration and operation
- GST registration status
- Employee count (Labour Code applicability)
- Data collection practices (DPDP Act obligations)
- Industry sector (RBI, IRDAI, SEBI triggers)

### 4.2 Compliance Mapping Engine (P0)
Indian legal knowledge graph:
```
Jurisdiction × Business Entity × Business Model × Data Practices → Regulations → Documents → Templates
```

**Indian Regulations (MVP):**
- DPDP Act 2023, IT Act 2000 + IT Rules 2021
- Consumer Protection Act 2019, Companies Act 2013
- GST Act 2017, Indian Contract Act 1872
- Shops & Establishment Acts (state-specific)
- Labour Codes, RBI/SEBI/IRDAI regulations

### 4.3 Automated Document Generator (P0)

| Document | Variants |
|---|---|
| Privacy Policy | DPDP Act + IT Rules 2021 |
| Terms of Service | SaaS, E-commerce, Marketplace, Service |
| Cookie Policy | DPDP + IT Rules compliant |
| Employment Agreement | Full-time, Contract, Intern |
| NDA | Mutual, One-way |
| Vendor/Service Agreement | B2B contracts |
| Refund & Cancellation Policy | Consumer Protection 2019 |
| Grievance Redressal Policy | IT Rules 2021 |
| LLP Agreement | LLP Act 2008 |
| Founders Agreement | Equity, vesting, IP assignment |

### 4.4 Compliance Health Monitor (P1)
Live dashboard with Central + State compliance status, regulatory change alerts from MCA, GSTN, DPDP Board.

### 4.5 Export & Integration (P1)
PDF, DOCX, HTML export. API access. HTML embed snippets.

---

## 5. User Flows

### 5.1 Happy Path: Signup to First Document
```
Signup (Supabase) → AI Onboarding Interview (~4 min) → Compliance Roadmap
→ Select Document → Pre-fill Checklist → Generate (~20 sec)
→ Review in Interactive Viewer → Export (PDF/HTML)
Total: ~12 minutes
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (LCP) | < 2.5s (P95) |
| Document generation | < 30s (P95) |
| API response (reads) | < 200ms (P95) |
| Uptime SLA | 99.9% monthly |
| Data residency | India (Supabase Mumbai / AWS ap-south-1) |

### Security
- Supabase Auth (Email/Password, Google OAuth, Phone OTP)
- Row-Level Security (RLS) in PostgreSQL
- AES-256 encryption at rest, TLS 1.3 in transit
- All inputs validated via Zod schemas

### DPDP Act 2023 Compliance
- Explicit consent at signup
- Data Principal rights: access, correction, erasure
- Grievance officer with 72-hour response SLA
- Data stored in India region
- Breach notification within 72 hours

---

## 7. MVP Scope

### 7.1 In Scope (v1.0)
- AI onboarding interviewer
- Compliance mapping engine (Central + key State regulations)
- Document generator (10 document types)
- Compliance health monitor + dashboard
- PDF/HTML export, embed snippets, REST API
- Supabase Auth (Email + Google + Phone OTP)
- Cashfree billing: Free, Starter ₹499/mo, Pro ₹1,499/mo, Enterprise custom

### 7.2 Out of Scope (v1.0)
- All 28 State Shops & Establishment Acts (v1.1)
- GST compliance automation (v1.2)
- E-signature integration (v2.0)
- Hindi/regional language docs (v1.3)
- Contract review/redlining (v2.0)

---

## 8. Future Roadmap

- **v1.1:** All state regulations, team collaboration, document diff
- **v1.2:** GST compliance, TDS/TCS documents, professional tax
- **v1.3:** Hindi, Tamil, Bengali, Marathi document generation
- **v2.0:** Contract review, e-signature (Leegality/SignDesk), SOC2 reports, advocate marketplace

---

## 9. Success Metrics

| Metric | Target (12 months) |
|---|---|
| Monthly signups | 3,000 |
| Activation rate | ≥ 50% |
| Month 3 retention | ≥ 40% |
| MRR | ₹5–10 Lakh |
| Document accuracy | ≥ 98% |
| NPS | ≥ 40 |

---

## 10. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| DPDP Board enforcement | Critical | Disclaimers, attorney review option, DPDP-compliant ops |
| Document liability | High | QA pipeline, attorney-reviewed templates, E&O insurance |
| State law variations | High | Phased rollout, jurisdiction override, coverage transparency |
| LLM hallucination | High | Citation verification, RAG-grounded generation, confidence scoring |

---

## 11. Appendix

### Indian Legal References
1. Digital Personal Data Protection Act, 2023
2. Information Technology Act, 2000 + IT Rules 2021
3. Consumer Protection Act, 2019 + E-Commerce Rules 2020
4. Companies Act, 2013
5. Indian Contract Act, 1872
6. GST Act, 2017
7. LLP Act, 2008
8. Code on Wages, 2019
9. OSHWC Code, 2020
10. RBI Payment and Settlement Systems Act, 2007

### Revision History
| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-05-13 | Initial PRD (US/Global) |
| 2.0 | 2026-05-17 | India-only, Supabase + Cashfree + NVIDIA NIM/Groq |
