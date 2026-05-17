# Feature Specification: Business Intelligence Onboarding (AI Interviewer)

**Feature ID:** FEAT-001
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-05-13

---

## 1. Feature Overview and Purpose

The Business Intelligence Onboarding module serves as the primary entry point for new LegalEase AI users. It replaces a traditional static form with an AI-driven conversational interview that collects structured business intelligence. The AI interviewer dynamically adapts questions based on prior answers, asks contextual follow-ups, and validates inputs in real time.

By the end of the onboarding flow, the system possesses enough structured data about the user's business to generate a personalized compliance roadmap, auto-fill document templates, and configure jurisdiction-aware monitoring.

### Key Objectives
- Reduce onboarding abandonment by using a conversational, step-by-step flow
- Gather comprehensive business data without overwhelming the user
- Capture jurisdiction-relevant details critical for regulatory mapping
- Allow pause/resume, backward navigation, and answer editing
- Produce a validated `BusinessProfile` object consumable by all downstream features

---

## 2. Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ONBOARDING FLOW                          │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────────┐    ┌──────────────────────────┐
  │  WELCOME  │───▶│  Step 1:     │───▶│  Step 2:                 │
  │  SCREEN   │    │  Company     │    │  Business Model          │
  │           │    │  Basics      │    │                          │
  └──────────┘    └──────────────┘    └──────────────────────────┘
                                            │
                                            ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
  │  Step 4:     │◀───│  Step 3:     │◀───│  Step 2b:             │
  │  User        │    │  Data        │    │  (Conditional         │
  │  Interactions│    │  Handling    │    │   follow-ups based    │
  └──────────────┘    └──────────────┘    │   on business model)  │
         │                                 └──────────────────────┘
         ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
  │  Step 5:     │───▶│  Step 6:     │───▶│  ONBOARDING           │
  │  Technology  │    │  Jurisdiction│    │  COMPLETE             │
  │  Stack       │    │  Selection   │    │  (Profile generated)  │
  └──────────────┘    └──────────────┘    └──────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  PERSISTENT UI ELEMENTS (visible throughout):                 │
  │  ┌─────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
  │  │ Progress │  │ Previous / Next     │  │ Pause & Resume   │  │
  │  │ Bar      │  │ Navigation Buttons  │  │ Button           │  │
  │  └─────────┘  └─────────────────────┘  └──────────────────┘  │
  └──────────────────────────────────────────────────────────────┘
```

### Navigation Rules
- **Forward:** User must complete all required questions in current step before proceeding
- **Backward:** User can navigate to any previous step; all answers are preserved
- **Pause:** State is persisted to backend; user receives a resume link via email
- **Skip:** Optional questions can be skipped; required questions display a prompt

---

## 3. Step-by-Step Questions

### Step 1: Company Basics

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 1.1 | What is your company's legal name? | Text input | Yes | 2-200 chars, no special-only strings |
| 1.2 | What is your company website? | URL input | Yes | Valid URL format (protocol optional) |
| 1.3 | Which industry best describes your business? | Dropdown (searchable) | Yes | Must select from predefined list |
| 1.4 | How many employees does your company have? | Radio group | Yes | Ranges: 1, 2-10, 11-50, 51-200, 201-1000, 1000+ |
| 1.5 | Where is your company headquartered? | Autocomplete + country/city | Yes | Valid city + country combination |

**AI Interviewer Behavior (Step 1):**
- Greets the user conversationally: "Let's start with the basics. I'll guide you through each step."
- After 1.2, optionally fetches website metadata to pre-fill industry suggestion: "I notice your website mentions fintech—should I categorize you as Financial Services?"
- Validates URL reachability in the background and surfaces a soft warning if unreachable: "I couldn't reach that URL. Is it spelled correctly, or is the site not live yet?"

### Step 2: Business Model

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 2.1 | What is your primary business model? | Card selection (icons) | Yes | Single selection from list |
| 2.2 | How does your business generate revenue? | Multi-select | Yes | At least 1 selected |
| 2.3 | Who is your primary target audience? | Multi-select | Yes | At least 1 selected |
| 2.4 | Do you have paying customers or users? | Radio: Yes/No/Pre-launch | Yes | — |
| 2.5 | Briefly describe what your product or service does. | Textarea | No | Max 500 chars |

**Business Model Options:** SaaS, E-commerce, Marketplace, D2C, B2B Services, DTC/Consumer App, Content/Media, Fintech, Healthcare, Education, Gaming, Non-profit, Other

**Revenue Model Options:** Subscription, One-time Purchase, Freemium, Advertising, Transaction/Commission Fees, Donations/Grants, Service Fees, Licensing, Other

**Target Audience Options:** Consumers (B2C), Businesses (B2B), Enterprises, SMBs, Developers, Children (under 13), Children (13-17), Adults (18+), Seniors, General Public, Other

**AI Interviewer Behavior (Step 2):**
- If "Healthcare" is selected as industry in Step 1, asks: "Since you're in healthcare, do you handle any PHI (Protected Health Information)?"
- If "Children" is selected as target audience, flags this for COPPA/GDPR-K compliance requirements later
- For "Pre-launch" businesses: "No worries! Your compliance roadmap will include pre-launch checklist items to get you ready."

### Step 3: Data Handling

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 3.1 | Do you collect personal data from your users? | Radio: Yes/No | Yes | — |
| 3.2 | What types of personal data do you collect? | Multi-select | Conditionally required (if 3.1 = Yes) | At least 1 if shown |
| 3.3 | Do you share user data with any third parties? | Radio: Yes/No | Yes | — |
| 3.4 | What third parties do you share data with? | Multi-select + "Other" text | Conditionally required (if 3.3 = Yes) | — |
| 3.5 | What are the purposes for collecting user data? | Multi-select | Yes | At least 1 |
| 3.6 | Where is user data physically stored or processed? | Multi-select (regions) | Yes | At least 1 |

**Personal Data Types:** Name, Email, Phone, Address, IP Address, Payment Info, Health Data, Biometric Data, Location Data, Browsing History, Social Media Profiles, Government IDs, Photos/Videos, Other

**Third-Party Categories:** Analytics (Google Analytics, Mixpanel, etc.), Advertising (Google Ads, Meta, etc.), Payment Processors (Stripe, PayPal, etc.), Cloud Hosting (AWS, GCP, Azure, etc.), CRM, Email Marketing, Customer Support, Authentication (Google OAuth, etc.), CDNs, Other

**Purpose Options:** Service Delivery, Marketing, Analytics, Personalization, Legal Compliance, Security, Customer Support, Research, Other

**AI Interviewer Behavior (Step 3):**
- If user selects "No" to data collection: "That simplifies things! We'll still guide you through a minimal privacy policy."
- If "Health Data" or "Biometric Data" is selected: "You're handling sensitive data. This triggers additional obligations under GDPR, CCPA, and potentially HIPAA. I'll make sure these are highlighted in your roadmap."
- If user selects third-party sharing destinations outside their stated jurisdiction regions: flags cross-border data transfer requirement

### Step 4: User Interactions

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 4.1 | Do users create accounts on your platform? | Radio: Yes/No | Yes | — |
| 4.2 | What authentication methods do you offer? | Multi-select | Conditionally required (if 4.1 = Yes) | — |
| 4.3 | Do you process payments from users? | Radio: Yes/No | Yes | — |
| 4.4 | Do you use cookies or similar tracking technologies? | Radio: Yes/No/Not Sure | Yes | — |
| 4.5 | Do you send marketing emails or newsletters? | Radio: Yes/No | Yes | — |
| 4.6 | Is any part of your service age-restricted? | Radio: Yes/No | Yes | — |
| 4.7 | Do users generate or upload content to your platform? | Radio: Yes/No | Yes | — |

**Authentication Methods:** Email/Password, Google OAuth, Apple Sign-In, GitHub OAuth, Microsoft OAuth, SSO/SAML, Phone OTP, Magic Link, Passkeys/Biometric, Other

**AI Interviewer Behavior (Step 4):**
- If cookies = "Not Sure": "No problem! Most modern web apps use cookies for sessions or analytics. I'll flag this for your tech team to confirm and include a cookie policy template for you."
- If age-restricted = Yes: "Which age threshold applies?" → follow-up text input
- If user-generated content = Yes: "This means you'll need content moderation policies and DMCA provisions in your Terms of Service."

### Step 5: Technology Stack

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 5.1 | Which analytics tools do you use? | Multi-select + "Other" | Yes | At least 1 (includes "None") |
| 5.2 | Do you integrate with any third-party APIs? | Radio: Yes/No | Yes | — |
| 5.3 | Where is your application hosted? | Dropdown | Yes | — |
| 5.4 | What is your primary development stack? | Multi-select | No | — |
| 5.5 | Do you use any AI/ML features in your product? | Radio: Yes/No | Yes | — |

**Analytics Options:** Google Analytics, Mixpanel, Amplitude, Segment, Hotjar, PostHog, Plausible, Matomo, None, Other

**Hosting Options:** AWS, Google Cloud Platform, Microsoft Azure, Vercel, Netlify, DigitalOcean, Heroku, Self-hosted/On-premise, Other

**Development Stack Options:** React, Next.js, Vue, Angular, Node.js, Python/Django, Ruby on Rails, PHP/Laravel, Java/Spring, Go, Flutter, React Native, Swift/iOS, Kotlin/Android, Other

**AI Interviewer Behavior (Step 5):**
- If using AI/ML features: "AI regulations are evolving rapidly. I'll include AI-specific compliance requirements (EU AI Act, etc.) in your roadmap."
- Cross-references hosting region with data storage region from Step 3: "I notice your hosting region differs from your stated data storage region. This could have cross-border data transfer implications."

### Step 6: Jurisdiction Selection

| # | Question | Type | Required | Validation |
|---|----------|------|----------|------------|
| 6.1 | In which countries does your company operate? | Multi-select (searchable) | Yes | At least 1 |
| 6.2 | Which countries do you target for customers/users? | Multi-select (searchable) | Yes | At least 1 |
| 6.3 | Do you have any physical presence or subsidiaries abroad? | Radio: Yes/No | Yes | — |
| 6.4 | If yes, in which countries? | Multi-select (searchable) | Conditionally required | — |
| 6.5 | Are there specific regulations you're concerned about? | Multi-select + "Other" | No | — |

**Regulation Options:** GDPR, CCPA/CPRA, HIPAA, SOC 2, PCI DSS, COPPA, FERPA, PIPEDA, LGPD, DIFC, NDPR, Other

**AI Interviewer Behavior (Step 6):**
- Auto-suggests relevant regulations based on earlier answers: "Based on your EU customers, GDPR will apply. I see you also handle payments, so PCI DSS is relevant."
- "Don't worry if you're unsure about regulations—that's what I'm here for! I'll automatically map all applicable requirements based on your jurisdiction selections."
- Warns if the business is small but selects a high-regulation combination: "That's quite a few jurisdictions for a small team. I'll prioritize the must-do items in your roadmap so you don't get overwhelmed."

---

## 4. AI Interviewer Behavior Specification

### Conversation Design Principles
1. **Progressive disclosure:** Don't ask all questions at once. Reveal them one at a time within each step.
2. **Contextual awareness:** Reference previous answers to build rapport. "Since you mentioned you're a B2B SaaS..."
3. **Validation with grace:** Never reject an answer outright. Instead, confirm: "Just to verify—you said your company has 10,000+ employees. Is that correct?"
4. **Educational interludes:** Briefly explain why a question matters. "I'm asking about your data storage regions because GDPR requires specific disclosures about international data transfers."
5. **Jargon-free defaults:** Legal/technical terms are explained inline with tooltips.

### Follow-Up Question Rules
- **Trigger conditions:** Defined per question (see Step 1-6 tables above)
- **Max depth:** 2 levels of follow-ups before returning to the main flow
- **Fallback:** If a follow-up isn't applicable for any reason, the interviewer says: "Let's move on to the next topic."

### Answer Validation Strategy
| Validation Level | Action |
|-----------------|--------|
| **Soft Warning** | Display a non-blocking message; user can proceed anyway |
| **Hard Error** | Display error; user must fix before proceeding |
| **Confirmation Prompt** | "Did you mean...?" with suggestion; user can accept or ignore |

### Skip Logic
- Questions marked `Required: No` display a "Skip" button alongside the "Next" button
- Questions marked `Conditionally required` only appear when their parent condition (`if X = Y`) is satisfied
- Entire steps can be partially populated; the onboarding completion percentage reflects skipped items

### Data Persistence
- Each completed step auto-saves to the backend via a PATCH request to `/api/onboarding/{sessionId}`
- Incomplete steps save on pause, tab close, or browser crash (via `beforeunload` event or periodic heartbeat)
- State includes: current step, current question index within step, all answers so far, session token

---

## 5. Edge Cases

### Paused and Resumed Onboarding
- **Trigger:** User clicks "Save & Exit" or session times out after 30 minutes of inactivity
- **Resume flow:** User receives email with unique resume link (valid for 72 hours) or returns to dashboard and clicks "Continue Onboarding"
- **State restoration:** User lands exactly on the question they left off on; all prior answers intact
- **Expired session:** If the resume link expires, user starts over but sees a "We noticed you started onboarding previously. Would you like to restore your previous answers?" prompt

### Skip Logic
- Optional questions skipped intentionally are omitted from the generated profile; downstream features treat those fields as `null`
- The compliance engine flags "incomplete profile" fields and may prompt the user to return to fill gaps

### Edit Previous Answers
- User can click on any completed step in the progress bar to revisit it
- Editing an answer that triggered conditional questions elsewhere:
  - If the new answer removes the condition (e.g., changed "Yes" to "No" on data collection), previously answered conditional questions are cleared and the user is warned: "Changing this answer will clear your responses to related questions. Continue?"
  - If the new answer adds a condition, the user is navigated to those newly-applicable questions before proceeding

### Concurrent Sessions
- Only one active onboarding session per user at a time
- Starting a new session while one exists prompts: "You have an active onboarding session. Resume or start fresh?"

---

## 6. UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| **Welcome** | First-time user enters flow | Animated greeting card, "Get Started" CTA, time estimate ("~10 min") |
| **Active Question** | Displaying current question | Question text, input field, optional hint text, subtle progress bar |
| **Loading** | Waiting for AI interviewer response | Typing indicator animation (three dots), skeleton for question area |
| **Validation Error** | Invalid input provided | Inline red error below input, shake animation on the field, error stays until corrected |
| **Confirmation Prompt** | AI suggests an auto-detected value | Card with suggestion, "Accept" and "Decline" buttons |
| **Step Transition** | Between steps | Brief "Step Complete ✓" animation, then transition to next step header |
| **Paused** | User exited mid-flow | Dashboard card: "You're 60% through onboarding. Continue?" |
| **Session Expired** | Resume link older than 72h | Full-page message: "Session expired. Start fresh?" with restore option |
| **Complete** | All 6 steps finished | Celebration animation, summary of profile, "View Your Compliance Roadmap" CTA |
| **Empty (Edge)** | User skipped all optional questions | Basic profile generated with minimum required fields; banner: "Enrich your profile for a more accurate roadmap" |
| **Server Error** | Backend unreachable | Toast notification, retry button, offline queue of answers |

---

## 7. Acceptance Criteria

| AC# | Criteria | Priority |
|-----|----------|----------|
| AC-001 | User can complete all 6 onboarding steps without leaving the page | P0 |
| AC-002 | AI interviewer dynamically asks follow-up questions based on prior answers | P0 |
| AC-003 | All required questions must be answered before proceeding to the next step | P0 |
| AC-004 | User can navigate backward to any previous step and edit answers | P0 |
| AC-005 | Editing an answer that invalidates downstream conditional questions shows a warning and clears them | P0 |
| AC-006 | Onboarding state is auto-saved on every step completion | P0 |
| AC-007 | User can pause and resume onboarding from the exact point they left | P0 |
| AC-008 | Resume link expires after 72 hours with a clear message | P1 |
| AC-009 | URL validation checks URL reachability and offers a soft warning | P1 |
| AC-010 | Skip button is shown for all optional questions | P1 |
| AC-011 | Progress bar accurately reflects completion percentage | P1 |
| AC-012 | AI interviewer explains why specific questions are asked when they involve sensitive topics | P1 |
| AC-013 | Complete profile is persisted as a structured JSON `BusinessProfile` object | P0 |
| AC-014 | Welcome screen shows time estimate before user begins | P2 |
| AC-015 | Jurisdiction selection auto-suggests relevant regulations | P1 |
| AC-016 | Inline validation errors do not clear valid answers in other fields within the same step | P0 |
| AC-017 | Starting a new session while one is active prompts user for confirmation | P2 |
| AC-018 | All interview responses are logged for future audit and improvement of the AI interviewer | P2 |