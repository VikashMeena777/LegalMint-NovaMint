# LegalMint AI — API Contract Specification

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Draft  
**API Protocol:** tRPC v11 (Next.js App Router)  
**Validation Library:** Zod 3.x  
**Database ORM:** Prisma 5.x  

---

## Table of Contents

1. [Router Overview](#1-router-overview)
2. [Authentication Strategy](#2-authentication-strategy)
3. [Rate Limiting](#3-rate-limiting)
4. [Pagination Convention](#4-pagination-convention)
5. [Error Response Format](#5-error-response-format)
6. [Router: auth](#6-router-auth)
7. [Router: onboarding](#7-router-onboarding)
8. [Router: businessProfile](#8-router-businessprofile)
9. [Router: compliance](#9-router-compliance)
10. [Router: documents](#10-router-documents)
11. [Router: export](#11-router-export)
12. [Router: alerts](#12-router-alerts)
13. [Router: subscription](#13-router-subscription)
14. [Router: admin](#14-router-admin)
15. [Webhook Endpoints](#15-webhook-endpoints)
16. [TypeScript Type Definitions](#16-typescript-type-definitions)

---

## 1. Router Overview

```
appRouter
├── auth            (public)
├── onboarding      (protected)
├── businessProfile (protected)
├── compliance      (protected)
├── documents       (protected)
├── export          (protected)
├── alerts          (protected)
├── subscription    (protected)
└── admin           (protected + ADMIN role)
```

### Middleware Stack (applied per-context)

```
Request
  → Auth Middleware (decodes JWT, attaches session context)
  → Rate Limiter (token-bucket per endpoint per user)
  → Input Validation (Zod schema parse)
  → Procedure Handler
  → Error Boundary (catches & formats errors)
Response
```

### Context Shape

```typescript
interface TRPCContext {
  session: Session | null;       // null for public procedures
  user: User | null;
  prisma: PrismaClient;          // pooled read/write
  redis: Redis;                  // Upstash Redis (caching, rate limiting)
  req: NextApiRequest;
  res: NextApiResponse;
}

interface Session {
  userId: string;
  role: UserRole;                // "USER" | "ADMIN"
  expiresAt: Date;
  tokenVersion: number;          // incremented on password change / logout-all
}
```

---

## 2. Authentication Strategy

### 2.1 Token Types

| Token | Lifespan | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token (JWT) | 15 minutes | In-memory (client), httpOnly cookie | Authenticates API calls |
| Refresh Token | 7 days | httpOnly secure cookie | Obtains new access tokens silently |
| Email Verification Token | 24 hours | DB column `User.emailVerifyToken` | Confirms email ownership |
| Password Reset Token | 1 hour | DB column `User.resetToken` + hashed | One-time password reset |

### 2.2 JWT Payload

```typescript
interface JWTPayload {
  sub: string;            // userId
  role: "USER" | "ADMIN";
  tokenVersion: number;
  iat: number;
  exp: number;
}
```

### 2.3 Token Refresh Flow

```
1. Access token expires → client receives 401
2. Client calls POST /api/trpc/auth.refreshToken (cookie-based, no body)
3. Server validates refresh token cookie
4. Server issues new access token cookie + rotated refresh token
5. Client retries the original request
```

Refresh token rotation: Each refresh operation invalidates the previous refresh token (stored in `RefreshToken` table). If a revoked token is replayed, all active tokens for that user are invalidated (breach detection).

### 2.4 NextAuth Integration

Authentication is delegated to NextAuth.js v5 (Auth.js), configured with:
- **Credentials provider** (email + password, backed by bcrypt hashes)
- **Google OAuth 2.0** (optional social login)
- **GitHub OAuth 2.0** (optional social login)

tRPC context extracts the session from `getServerSession()` in App Router route handlers.

### 2.5 Password Policy

- Minimum 8 characters
- Must contain at least 1 uppercase, 1 lowercase, 1 digit
- bcrypt cost factor: 12
- Account lockout: 5 failed attempts → 15-minute cooldown
- Previous 3 passwords cannot be reused

---

## 3. Rate Limiting

### 3.1 Strategy

Token-bucket algorithm implemented via Upstash Redis. Each endpoint has its own bucket identified by `userId:endpoint`. Buckets refill at configured rates.

### 3.2 Per-Endpoint Limits

| Router | Endpoint | Bucket Capacity | Refill Rate | Burst Allowance |
|--------|----------|----------------|-------------|-----------------|
| auth | login | 5 | 1 per 60s | 5 |
| auth | register | 3 | 1 per 120s | 3 |
| auth | verifyEmail | 10 | 1 per 10s | 10 |
| auth | resetPassword | 3 | 1 per 300s | 3 |
| onboarding | startInterview | 10 | 1 per 30s | 10 |
| onboarding | submitAnswer | 30 | 1 per 5s | 30 |
| onboarding | getProgress | 60 | 1 per 2s | 60 |
| onboarding | completeOnboarding | 5 | 1 per 60s | 5 |
| businessProfile | get | 120 | 1 per 1s | 120 |
| businessProfile | update | 30 | 1 per 10s | 30 |
| businessProfile | delete | 2 | 1 per 300s | 2 |
| compliance | generateRoadmap | 5 | 1 per 120s | 5 |
| compliance | getRoadmap | 30 | 1 per 5s | 30 |
| compliance | getRequirement | 60 | 1 per 2s | 60 |
| compliance | updateStatus | 60 | 1 per 5s | 60 |
| documents | list | 60 | 1 per 2s | 60 |
| documents | get | 60 | 1 per 2s | 60 |
| documents | generate | 10 | 1 per 30s | 10 |
| documents | update | 30 | 1 per 10s | 30 |
| documents | publish | 15 | 1 per 15s | 15 |
| documents | archive | 15 | 1 per 15s | 15 |
| documents | compare | 10 | 1 per 30s | 10 |
| export | exportPdf | 20 | 1 per 15s | 20 |
| export | exportDocx | 20 | 1 per 15s | 20 |
| export | getEmbedSnippet | 30 | 1 per 5s | 30 |
| export | getExportHistory | 30 | 1 per 5s | 30 |
| alerts | list | 30 | 1 per 5s | 30 |
| alerts | markRead | 30 | 1 per 5s | 30 |
| alerts | dismiss | 30 | 1 per 5s | 30 |
| alerts | getHealthScore | 10 | 1 per 30s | 10 |
| subscription | * | 30 | 1 per 5s | 30 |
| admin | * | 60 | 1 per 5s | 60 |

### 3.3 Rate Limit Response

**HTTP Status:** `429 Too Many Requests`

```json
{
  "success": false,
  "code": "RATE_LIMITED",
  "message": "Too many requests. Please wait before retrying.",
  "retryAfter": 45
}
```

---

## 4. Pagination Convention

All list endpoints use **cursor-based pagination** for deterministic results under concurrent writes.

### 4.1 Request Parameters

```typescript
interface PaginationInput {
  limit?: number;   // default: 20, max: 100
  cursor?: string;  // opaque cursor from previous response; omit for first page
}
```

### 4.2 Response Shape

```typescript
interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;  // null when no more pages
  total?: number;             // optional total count (computed separately if requested)
}
```

### 4.3 Cursor Encoding

Cursors are base64-encoded JSON containing:

```typescript
interface CursorPayload {
  id: string;       // last item's primary key
  createdAt: string; // ISO-8601 timestamp of last item
}
```

---

## 5. Error Response Format

### 5.1 Standard Shape

All errors follow this structure (tRPC error formatter override):

```typescript
interface APIError {
  success: false;
  code: string;        // machine-readable error code (see catalog below)
  message: string;     // human-readable description (safe for end users)
  details?: unknown;   // optional structured metadata (e.g., field-level validation errors)
  requestId?: string;  // correlation ID for debugging
}
```

### 5.2 Error Code Catalog

| HTTP Status | tRPC Code | Error Code | Description |
|-------------|-----------|------------|-------------|
| 400 | BAD_REQUEST | VALIDATION_ERROR | Zod schema validation failed |
| 400 | BAD_REQUEST | INVALID_INPUT | Malformed input (not schema-related) |
| 401 | UNAUTHORIZED | UNAUTHENTICATED | Missing or expired access token |
| 401 | UNAUTHORIZED | TOKEN_EXPIRED | Access token expired, client should refresh |
| 401 | UNAUTHORIZED | INVALID_TOKEN | Token signature or structure invalid |
| 403 | FORBIDDEN | INSUFFICIENT_ROLE | User lacks required role (e.g., ADMIN) |
| 403 | FORBIDDEN | SUBSCRIPTION_REQUIRED | Action requires active paid subscription |
| 403 | FORBIDDEN | RESOURCE_NOT_OWNED | User does not own the requested resource |
| 404 | NOT_FOUND | RESOURCE_NOT_FOUND | Requested entity does not exist |
| 409 | CONFLICT | RESOURCE_CONFLICT | Duplicate or conflicting state |
| 409 | CONFLICT | EMAIL_TAKEN | Email already registered |
| 409 | CONFLICT | DOCUMENT_LOCKED | Document is in a non-editable state (e.g., published) |
| 422 | UNPROCESSABLE_CONTENT | BUSINESS_RULE_VIOLATION | Valid input but violates business logic |
| 429 | TOO_MANY_REQUESTS | RATE_LIMITED | Rate limit exceeded |
| 500 | INTERNAL_SERVER_ERROR | INTERNAL_ERROR | Unexpected server failure |
| 500 | INTERNAL_SERVER_ERROR | AI_GENERATION_FAILED | LLM pipeline failed to produce output |
| 503 | SERVICE_UNAVAILABLE | SERVICE_UNAVAILABLE | Upstream dependency unavailable (e.g., Stripe, Pinecone) |

### 5.3 Validation Error Details

When `code === "VALIDATION_ERROR"`, `details` contains:

```typescript
interface ZodErrorDetails {
  fieldErrors: Record<string, string[]>;  // field → array of error messages
  formErrors: string[];                   // non-field errors
}

// Example:
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["Must be at least 8 characters"]
    },
    "formErrors": []
  }
}
```

---

## 6. Router: auth

**Access:** Public (no authentication required)  
**Base path:** `/api/trpc/auth`

### 6.1 login

Authenticates a user by email and password. Returns user profile and session tokens as httpOnly cookies.

#### Input

```typescript
// Zod schema
z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
})
```

#### Output

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    avatarUrl: string | null;
    createdAt: string; // ISO-8601
  };
  session: {
    expiresAt: string; // ISO-8601
  };
}
```

#### Side Effects
- Sets `accessToken` cookie (httpOnly, secure, sameSite=Lax, path=/, 15min expiry)
- Sets `refreshToken` cookie (httpOnly, secure, sameSite=Lax, path=/api/trpc/auth, 7d expiry)
- Records login event in `LoginAudit` table (IP, user agent, timestamp)
- Increments `User.loginCount`

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Malformed email or password format |
| RESOURCE_NOT_FOUND | 404 | No user with this email exists |
| UNAUTHENTICATED | 401 | Password mismatch |
| RATE_LIMITED | 429 | Exceeded 5 attempts per 60s window |
| BUSINESS_RULE_VIOLATION | 422 | Account locked (5+ consecutive failed attempts) |
| BUSINESS_RULE_VIOLATION | 422 | Email not verified (grace period: 48h since registration) |
| INTERNAL_ERROR | 500 | Database or session creation failure |

#### Business Logic
1. Normalize email (lowercase, trim whitespace).
2. Look up user by email in `User` table.
3. If user not found, return `RESOURCE_NOT_FOUND` (do NOT reveal whether email is registered).
4. Check account lockout: if `failedLoginAttempts >= 5` AND `lockedUntil > now`, return `BUSINESS_RULE_VIOLATION`.
5. Compare password with bcrypt hash (`User.passwordHash`).
6. If mismatch: increment `failedLoginAttempts`, if count reaches 5 set `lockedUntil = now + 15 minutes`.
7. If match: reset `failedLoginAttempts` to 0, `lockedUntil` to null.
8. If `emailVerified === false` and account created > 48h ago, return `BUSINESS_RULE_VIOLATION` with re-send verification link option.
9. Create `Session` record with hashed refresh token.
10. Issue JWT access token (signed with HS256, secret from `AUTH_SECRET` env var).
11. Set cookies and return response.

---

### 6.2 register

Creates a new user account. Sends email verification link.

#### Input

```typescript
z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    ),
  name: z.string().min(1).max(100).trim(),
})
```

#### Output

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: "USER";
    emailVerified: false;
    avatarUrl: null;
    createdAt: string;
  };
}
```

#### Side Effects
- Creates `User` record in database
- Creates default `BusinessProfile` with status `PRE_ONBOARDING`
- Creates default `Subscription` record (FREE tier)
- Generates email verification token (crypto.randomUUID)
- Enqueues `sendEmailVerification` job (Resend / SendGrid)
- Records registration event in `AuditLog` table

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid email, password, or name format |
| EMAIL_TAKEN | 409 | Email already registered |
| RATE_LIMITED | 429 | Exceeded 3 registrations per 120s per IP |
| INTERNAL_ERROR | 500 | Database write or email enqueue failure |

#### Business Logic
1. Normalize email (lowercase, trim).
2. Check for existing `User` with this email. If found, return `EMAIL_TAKEN` (regardless of verification status).
3. Validate password against strength policy.
4. Hash password with bcrypt (cost = 12).
5. Create `User` row with `role = "USER"`, `emailVerified = false`, `emailVerifyToken = crypto.randomUUID()`.
6. Create `BusinessProfile` with defaults (empty profile, `onboardingStatus = "PRE_ONBOARDING"`).
7. Create `Subscription` with `plan = "FREE"`, `status = "ACTIVE"`, usage counts initialized to 0.
8. Send verification email (asynchronous; failure is logged but does not fail registration).
9. Do NOT issue session tokens — user must verify email before logging in (grace period exception in `login`).

---

### 6.3 verifyEmail

Confirms a user's email address using the token sent during registration.

#### Input

```typescript
z.object({
  token: z.string().uuid(),
})
```

#### Output

```typescript
{
  success: true;
}
```

#### Side Effects
- Sets `User.emailVerified = true`
- Clears `User.emailVerifyToken = null`
- Records verification event in `AuditLog`

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Token is not a valid UUID |
| RESOURCE_NOT_FOUND | 404 | No user found with this verification token |
| BUSINESS_RULE_VIOLATION | 422 | Token expired (created > 24h ago) |
| BUSINESS_RULE_VIOLATION | 422 | Email already verified |
| RATE_LIMITED | 429 | Exceeded 10 attempts per 10s window |

#### Business Logic
1. Look up `User` by `emailVerifyToken`.
2. If not found, return `RESOURCE_NOT_FOUND`.
3. If `emailVerified === true`, return `BUSINESS_RULE_VIOLATION` (already verified).
4. If `User.createdAt` > 24h ago, clear the token and return `BUSINESS_RULE_VIOLATION` with message "Verification link expired. Please request a new one."
5. Set `emailVerified = true`, `emailVerifyToken = null`.
6. Log verification in `AuditLog`.

---

### 6.4 resetPassword

Initiates the password reset flow. Sends an email with a one-time reset link.

#### Input

```typescript
z.object({
  email: z.string().email().max(255),
})
```

#### Output

```typescript
{
  success: true;
}
```

> Always returns `{ success: true }` — even if the email does not exist — to prevent user enumeration.

#### Side Effects
- If user exists: generates `resetToken` (SHA-256 hash of `crypto.randomBytes(32)`)
- Sets `resetTokenExpiresAt = now + 1 hour`
- Enqueues `sendPasswordReset` email job with plaintext token

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid email format |
| RATE_LIMITED | 429 | Exceeded 3 requests per 300s per IP |

#### Business Logic
1. Normalize email.
2. Look up user by email.
3. **Always return `{ success: true }`** regardless of whether user exists (anti-enumeration).
4. If user exists: generate opaque reset token (32 bytes → hex), hash it with SHA-256, store hash + expiry in DB.
5. Enqueue email with the plaintext token as a query parameter in the reset URL.

---

### 6.5 refreshToken *(implied by auth flow)*

Silently rotates access + refresh tokens using the current refresh token cookie.

#### Input

- No body. Reads `refreshToken` from httpOnly cookie.

#### Output

```typescript
{
  session: {
    expiresAt: string;
  };
}
```

#### Side Effects
- Invalidates the consumed refresh token
- Issues new access token + new rotated refresh token as cookies

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | No refresh token cookie present |
| INVALID_TOKEN | 401 | Refresh token not found in DB or expired |
| INVALID_TOKEN | 401 | Token replay detected → all user sessions revoked |

---

## 7. Router: onboarding

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/onboarding`

The onboarding system uses an interactive interview pattern. Questions are dynamically selected by a decision tree based on jurisdiction, business type, industry, and previous answers. The LLM is NOT involved in the interview — it's a deterministic rule engine backed by a `QuestionTree` configuration.

### 7.1 startInterview

Initiates or resets the onboarding interview for the authenticated user's business profile.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  businessProfileId: string;
  nextQuestion: {
    key: string;              // machine-readable identifier (e.g., "business_structure")
    type: "SINGLE_SELECT" | "MULTI_SELECT" | "TEXT" | "DATE" | "BOOLEAN" | "NUMBER";
    prompt: string;           // human-readable question text
    description?: string;     // contextual explanation
    options?: {               // for SELECT types
      value: string;
      label: string;
      description?: string;
    }[];
    validation?: {
      required: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;       // regex for TEXT input
      min?: number;           // for NUMBER input
      max?: number;
    };
  };
}
```

#### Side Effects
- Creates or resets `OnboardingSession` record (`status = "IN_PROGRESS"`)
- Resets all answers if re-starting

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | User has no `BusinessProfile` |
| BUSINESS_RULE_VIOLATION | 422 | Onboarding already completed |
| SUBSCRIPTION_REQUIRED | 403 | User's trial has expired without subscription |
| RATE_LIMITED | 429 | Exceeded 10 starts per 30s window |

#### Business Logic
1. Load authenticated user's `BusinessProfile`.
2. If `onboardingStatus === "COMPLETED"`, return `BUSINESS_RULE_VIOLATION`.
3. Check that subscription allows onboarding (FREE trial: 14 days from registration).
4. Create `OnboardingSession` record with `status = "IN_PROGRESS"`, `currentStep = 0`.
5. Load the first question from the `OnboardingQuestionTree` config (starts at root node).
6. Return the question with `businessProfileId`.

---

### 7.2 submitAnswer

Submits an answer to the current interview question and returns the next question (or null if interview is complete).

#### Input

```typescript
z.object({
  businessProfileId: z.string().uuid(),
  questionKey: z.string(),
  answer: z.union([
    z.string(),       // for TEXT, SINGLE_SELECT
    z.array(z.string()), // for MULTI_SELECT
    z.boolean(),      // for BOOLEAN
    z.number(),       // for NUMBER
  ]),
})
```

#### Output

```typescript
// If more questions remain:
{
  nextQuestion: {
    key: string;
    type: "SINGLE_SELECT" | "MULTI_SELECT" | "TEXT" | "DATE" | "BOOLEAN" | "NUMBER";
    prompt: string;
    description?: string;
    options?: { value: string; label: string; description?: string }[];
    validation?: { /* same as startInterview */ };
  };
}

// If interview is complete:
{
  nextQuestion: null;
}
```

#### Side Effects
- Upserts `OnboardingAnswer` row: `(sessionId, questionKey, answerValue)`
- Advances `OnboardingSession.currentStep` by 1

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Answer does not match question type/validation |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `businessProfileId` not found or not owned by user |
| RESOURCE_NOT_FOUND | 404 | No active `OnboardingSession` for this profile |
| BUSINESS_RULE_VIOLATION | 422 | Question does not match current interview step |
| RATE_LIMITED | 429 | Exceeded 30 answers per 5s window |

#### Business Logic
1. Validate ownership: `BusinessProfile.userId === session.userId`.
2. Load active `OnboardingSession`.
3. Validate that `questionKey` matches the current step's expected question.
4. Validate answer against question's type and validation rules.
5. Store `OnboardingAnswer` (upsert by `sessionId + questionKey`).
6. Compute the next question node using the decision tree based on the answer.
7. If no more questions in the current branch, jump to `completeOnboarding` decision node.
8. Update `currentStep += 1`.
9. Return next question or `null`.

---

### 7.3 getProgress

Returns the current progress of the onboarding interview.

#### Input

```typescript
z.object({
  businessProfileId: z.string().uuid(),
})
```

#### Output

```typescript
{
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  answeredQuestions: {
    key: string;
    prompt: string;
    answer: string | string[] | boolean | number;
    answeredAt: string;
  }[];
  remainingQuestions: string[]; // estimated question keys remaining in best-guess path
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `businessProfileId` not found or not owned by user |
| RESOURCE_NOT_FOUND | 404 | No active `OnboardingSession` |
| RATE_LIMITED | 429 | Exceeded 60 requests per 2s window |

---

### 7.4 completeOnboarding

Finalizes the onboarding interview, generates the initial `BusinessProfile` from answers, and triggers the initial compliance roadmap generation.

#### Input

```typescript
z.object({
  businessProfileId: z.string().uuid(),
})
```

#### Output

```typescript
{
  profile: {
    id: string;
    businessName: string;
    businessStructure: "SOLE_PROPRIETORSHIP" | "LLC" | "S_CORP" | "C_CORP" | "PARTNERSHIP" | "NONPROFIT";
    industry: string;
    jurisdictions: string[];      // ISO 3166-2 codes (e.g., ["US-CA", "US-NY"])
    employeeCount: number | null;
    annualRevenue: number | null; // USD
    foundedYear: number | null;
    website: string | null;
    description: string | null;
    onboardingCompletedAt: string;
    generatedProfile: Record<string, unknown>; // full structured data from answers
  };
}
```

#### Side Effects
- Compiles all `OnboardingAnswer` rows into structured `BusinessProfile` fields (via mapping config)
- Sets `BusinessProfile.onboardingStatus = "COMPLETED"`
- Sets `BusinessProfile.onboardingCompletedAt = now`
- Deletes `OnboardingSession` and associated `OnboardingAnswer` rows (cleanup)
- Enqueues async job: `generateComplianceRoadmap(profileId)` (see compliance router)

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `businessProfileId` not found or not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Onboarding already completed |
| BUSINESS_RULE_VIOLATION | 422 | Not all required questions have been answered |
| RATE_LIMITED | 429 | Exceeded 5 completions per 60s window |
| INTERNAL_ERROR | 500 | Profile compilation or roadmap enqueue failed |

#### Business Logic
1. Validate ownership and that status is `IN_PROGRESS`.
2. Check that all required questions (defined in tree config) have answers.
3. Map answers to `BusinessProfile` fields using `OnboardingProfileMapper` config.
4. Save `BusinessProfile` with `onboardingStatus = "COMPLETED"`, `onboardingCompletedAt = new Date()`.
5. Clean up session + answers data.
6. Enqueue `generateComplianceRoadmap` background job.
7. Return compiled profile.

---

## 8. Router: businessProfile

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/businessProfile`

### 8.1 get

Returns the authenticated user's business profile.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  profile: BusinessProfile;
}

// BusinessProfile type (see §16 for full definition):
{
  id: string;
  businessName: string;
  businessStructure: BusinessStructure;
  industry: string;
  jurisdictions: string[];
  employeeCount: number | null;
  annualRevenue: number | null;
  foundedYear: number | null;
  website: string | null;
  description: string | null;
  onboardingStatus: "PRE_ONBOARDING" | "IN_PROGRESS" | "COMPLETED";
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | User has no `BusinessProfile` |

---

### 8.2 update

Partially updates the authenticated user's business profile. Triggers compliance re-evaluation if jurisdiction or other materially relevant fields change.

#### Input

```typescript
// Partial<BusinessProfileUpdateInput> — all fields optional
z.object({
  businessName: z.string().min(1).max(200).optional(),
  businessStructure: z.enum([
    "SOLE_PROPRIETORSHIP", "LLC", "S_CORP", "C_CORP", "PARTNERSHIP", "NONPROFIT"
  ]).optional(),
  industry: z.string().max(100).optional(),
  jurisdictions: z.array(z.string().regex(/^[A-Z]{2}(-[A-Z0-9]+)?$/)).min(1).optional(),
  employeeCount: z.number().int().min(0).max(1_000_000).optional(),
  annualRevenue: z.number().min(0).max(1e15).optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  website: z.string().url().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
})
```

#### Output

```typescript
{
  profile: BusinessProfile;
}
```

#### Side Effects
- If `jurisdictions`, `businessStructure`, or `industry` fields are changed: enqueues `revalidateComplianceRoadmap(profileId)` background job.
- Records update event in `AuditLog`.

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Field validation failed |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No `BusinessProfile` for this user |
| BUSINESS_RULE_VIOLATION | 422 | Onboarding not yet completed |
| INTERNAL_ERROR | 500 | Database write failure |

#### Business Logic
1. Load current profile, validate ownership and `onboardingStatus === "COMPLETED"`.
2. Merge input fields into current profile (partial update via Prisma).
3. Determine if "material change" occurred (jurisdictions, businessStructure, or industry modified).
4. If material change: enqueue background job to regenerate compliance roadmap (`CompliancePipeline.revalidate(profileId)`).
5. Log update in `AuditLog`.
6. Return updated profile.

---

### 8.3 delete

Deletes the authenticated user's business profile and all associated data (documents, compliance records, alerts). Soft-delete with 30-day recovery window.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  success: true;
}
```

#### Side Effects
- Sets `BusinessProfile.deletedAt = now` (soft delete)
- Cascades soft-delete to: `ComplianceRoadmap`, `ComplianceRequirementMapping`, `Document`, `Alert` (all `deletedAt` set)
- Schedules permanent deletion job at `now + 30 days`
- Cancels active Stripe subscription (if any)

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No `BusinessProfile` for this user |
| BUSINESS_RULE_VIOLATION | 422 | Account has pending documents (not archived) |
| RATE_LIMITED | 429 | Exceeded 2 deletes per 300s window |
| INTERNAL_ERROR | 500 | Database cascade or Stripe cancellation failure |

---

## 9. Router: compliance

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/compliance`

The compliance engine uses a RAG pipeline (Pinecone vector DB + GPT-4o) to retrieve applicable regulations, then maps them to business profile attributes to produce a compliance roadmap.

### 9.1 generateRoadmap

Generates (or regenerates) a compliance roadmap for a given business profile. This is a long-running operation triggered async; the procedure returns the existing or in-progress roadmap immediately, and the client polls `getRoadmap` for the final result.

#### Input

```typescript
z.object({
  profileId: z.string().uuid(),
})
```

#### Output

```typescript
{
  roadmap: {
    id: string;
    profileId: string;
    status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
    generatedAt: string | null;
    expiresAt: string | null;
    summary: {
      totalRequirements: number;
      completed: number;
      highPriority: number;
      mediumPriority: number;
      lowPriority: number;
    };
    requirements: ComplianceRequirement[];
  };
}

// See §16 for full ComplianceRequirement type.
```

#### Side Effects
- Creates or updates `ComplianceRoadmap` record with `status = "GENERATING"` (if not already GENERATING)
- Enqueues async pipeline: `CompliancePipeline.generate(profileId)` → parallel RAG retrieval + GPT-4o structured output
- Previous roadmap is archived (not deleted) when new one is generated

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `profileId` not found or not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Onboarding not completed |
| BUSINESS_RULE_VIOLATION | 422 | Roadmap already generating (returns current with status "GENERATING") |
| SUBSCRIPTION_REQUIRED | 403 | User on FREE plan exceeded 1 roadmap generation |
| RATE_LIMITED | 429 | Exceeded 5 generations per 120s window |
| AI_GENERATION_FAILED | 500 | LLM pipeline returned no usable output after retries |
| SERVICE_UNAVAILABLE | 503 | Pinecone or OpenAI API unavailable |

#### Business Logic
1. Validate `profileId` ownership and onboarding completion.
2. Check generation quota based on subscription tier:
   - FREE: 1 roadmap total
   - PRO: 10 per month
   - BUSINESS: 50 per month
   - ENTERPRISE: unlimited
3. Look up existing roadmap. If `status === "COMPLETED"` and generated < 7 days ago, return cached (no regeneration).
4. If `status === "GENERATING"`, return current state (polling mode).
5. Create new `ComplianceRoadmap` (or reset existing) with `status = "GENERATING"`.
6. Enqueue `CompliancePipeline.generate(profileId)` which:
   - Query Pinecone vector DB with profile attributes (`jurisdictions`, `industry`, `businessStructure`)
   - Retrieve top-50 relevant regulation chunks
   - Prompt GPT-4o with structured output schema to produce `ComplianceRequirement[]`
   - Validate output against JSON schema
   - Commit requirements + mapping records
   - Set roadmap `status = "COMPLETED"`, `generatedAt = now`, `expiresAt = now + 30 days`
7. Return roadmap record (likely with `GENERATING` status on first call, client should poll).

---

### 9.2 getRoadmap

Returns the current compliance roadmap for a business profile.

#### Input

```typescript
z.object({
  profileId: z.string().uuid(),
})
```

#### Output

```typescript
{
  roadmap: {
    id: string;
    profileId: string;
    status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
    generatedAt: string | null;
    expiresAt: string | null;
    summary: { totalRequirements: number; completed: number; highPriority: number; mediumPriority: number; lowPriority: number };
    requirements: ComplianceRequirement[];
  };
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `profileId` not found, not owned by user, or no roadmap exists |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

---

### 9.3 getRequirement

Returns detailed information about a single compliance requirement, including the RAG-sourced regulatory citation.

#### Input

```typescript
z.object({
  requirementId: z.string().uuid(),
})
```

#### Output

```typescript
{
  requirement: {
    id: string;
    roadmapId: string;
    title: string;
    category: string;           // e.g., "PRIVACY", "EMPLOYMENT", "TAX", "ENVIRONMENTAL"
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    jurisdiction: string;       // ISO 3166-2
    regulationSource: string;   // e.g., "CCPA §1798.100", "GDPR Art. 5"
    citationUrl: string | null;
    suggestedActions: string[];
    estimatedEffort: "LOW" | "MEDIUM" | "HIGH";
    currentStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NOT_APPLICABLE";
    statusNotes: string | null;
    updatedAt: string;
  };
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `requirementId` not found |
| RESOURCE_NOT_OWNED | 403 | Requirement belongs to a profile not owned by the user |
| RATE_LIMITED | 429 | Exceeded 60 requests per 2s window |

---

### 9.4 updateStatus

Updates the status of a compliance requirement mapping (the link between a requirement and its implementation status for a specific profile).

#### Input

```typescript
z.object({
  mappingId: z.string().uuid(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NOT_APPLICABLE"]),
  notes: z.string().max(2000).nullable().optional(),
})
```

#### Output

```typescript
{
  mapping: {
    id: string;
    requirementId: string;
    profileId: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NOT_APPLICABLE";
    notes: string | null;
    updatedAt: string;
  };
}
```

#### Side Effects
- Updates `ComplianceRequirementMapping.status` and `notes`
- If status changed to `COMPLETED`: recalculates roadmap summary counts
- Records status change in `AuditLog`

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid status value |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `mappingId` not found |
| RESOURCE_NOT_OWNED | 403 | Mapping belongs to a profile not owned by user |
| RATE_LIMITED | 429 | Exceeded 60 updates per 5s window |

---

## 10. Router: documents

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/documents`

The document generation engine uses template-based prompt composition with GPT-4o. Templates are jurisdiction-aware and include attorney-reviewed clause libraries. Generated documents include structured metadata for rendering, versioning, and export.

### 10.1 list

Returns a paginated list of documents for the authenticated user's business profile.

#### Input

```typescript
z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  type: z.enum([
    "TERMS_OF_SERVICE", "PRIVACY_POLICY", "EMPLOYMENT_AGREEMENT",
    "NDA", "LLC_OPERATING_AGREEMENT", "CONTRACTOR_AGREEMENT",
    "PARTNERSHIP_AGREEMENT", "COOKIE_POLICY", "GDPR_NOTICE",
    "DISCLAIMER", "CUSTOM"
  ]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})
```

#### Output

```typescript
{
  documents: {
    id: string;
    title: string;
    type: string;                     // DocumentType enum value
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    currentVersion: number;
    lastModifiedAt: string;
    publishedAt: string | null;
    thumbnail?: string;               // first 150 chars of content (preview)
  }[];
  nextCursor: string | null;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid status, type, or pagination params |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No `BusinessProfile` for user |
| RATE_LIMITED | 429 | Exceeded 60 requests per 2s window |

#### Business Logic
1. Load authenticated user's `BusinessProfile`.
2. Query `Document` table where `profileId = user.profileId`, applying `status` and `type` filters if provided.
3. Apply cursor-based pagination (cursor resolves to `{ id, createdAt }`).
4. Return document list with `nextCursor` for the next page.

---

### 10.2 get

Returns the full content and metadata for a specific document, including the current active version's content.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  document: {
    id: string;
    profileId: string;
    title: string;
    type: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    currentVersion: number;
    content: DocumentContent;             // structured content blocks
    customizations: Record<string, unknown>; // stored customization overrides
    metadata: {
      jurisdiction: string[];
      generatedBy: "AI" | "TEMPLATE" | "ATTORNEY_REVIEWED";
      lastReviewedAt: string | null;
      generatedAt: string;
      wordCount: number;
      readingTime: number;                // minutes
    };
    versions: {                           // version history (metadata only, not content)
      version: number;
      createdAt: string;
      changeSummary: string | null;
    }[];
    createdAt: string;
    updatedAt: string;
  };
}

// DocumentContent is a block-based structure:
type DocumentContent = DocumentBlock[];

type DocumentBlock = {
  type: "heading" | "paragraph" | "list" | "clause" | "signature";
  id: string;
  data: Record<string, unknown>;
};
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid documentId |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document belongs to a different user |
| RATE_LIMITED | 429 | Exceeded 60 requests per 2s window |

---

### 10.3 generate

Generates a new legal document from a template type for the specified business profile. Uses GPT-4o with jurisdiction-aware, attorney-reviewed templates as the base prompt.

#### Input

```typescript
z.object({
  profileId: z.string().uuid(),
  templateType: z.enum([
    "TERMS_OF_SERVICE", "PRIVACY_POLICY", "EMPLOYMENT_AGREEMENT",
    "NDA", "LLC_OPERATING_AGREEMENT", "CONTRACTOR_AGREEMENT",
    "PARTNERSHIP_AGREEMENT", "COOKIE_POLICY", "GDPR_NOTICE",
    "DISCLAIMER", "CUSTOM"
  ]),
  customizations: z.record(z.string(), z.unknown()).optional(),
})
```

#### Output

```typescript
{
  document: {
    id: string;
    title: string;
    type: string;
    status: "DRAFT";
    currentVersion: 1;
    content: DocumentContent;
    metadata: {
      jurisdiction: string[];
      generatedBy: "AI";
      lastReviewedAt: null;
      generatedAt: string;
      wordCount: number;
      readingTime: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

#### Side Effects
- Creates `Document` record + `DocumentVersion` (v1)
- Deducts from subscription usage quota
- Records generation event in `DocumentAuditLog`
- Enqueues background job: `generateEmbeddedExport(documentId)` (pre-generates PDF for faster first export)

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid `profileId` or `templateType` |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `profileId` not found or not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Onboarding not completed |
| SUBSCRIPTION_REQUIRED | 403 | Document generation quota exceeded for current plan |
| RESOURCE_CONFLICT | 409 | A document of this type already exists for this profile (for single-instance types like Privacy Policy) |
| AI_GENERATION_FAILED | 500 | LLM pipeline failed after 3 retry attempts |
| RATE_LIMITED | 429 | Exceeded 10 generations per 30s window |
| SERVICE_UNAVAILABLE | 503 | OpenAI API unavailable |

#### Business Logic
1. Validate ownership, onboarding completion, subscription quota.
2. Check if `templateType` is single-instance (e.g., `PRIVACY_POLICY`, `TERMS_OF_SERVICE`) — if one already exists and is active, return `RESOURCE_CONFLICT`.
3. Load `BusinessProfile` + jurisdiction data.
4. Retrieve the appropriate template from the `DocumentTemplate` table (attorney-reviewed base).
5. Load applicable `ComplianceRequirement` records to inject jurisdiction-specific clauses.
6. Compose the GPT-4o prompt:
   - System: "You are a legal document drafting assistant. Generate a legally precise, jurisdiction-aware document. Follow the template structure exactly."
   - Context: Profile data, compliance requirements, template structure
   - Instructions: Customization overrides, tone, output format
7. Call GPT-4o with `response_format: { type: "json_object" }` conforming to `DocumentContent` schema.
8. Parse and validate the structured output.
9. Create `Document` → `DocumentVersion(v1)` rows.
10. Decrement usage counter in `Subscription`.
11. Record audit log.

---

### 10.4 update

Updates a document's content or customizations. Creates a new version if content is modified.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
  content: z.array(
    z.object({
      type: z.enum(["heading", "paragraph", "list", "clause", "signature"]),
      id: z.string(),
      data: z.record(z.string(), z.unknown()),
    })
  ).optional(),
  customizations: z.record(z.string(), z.unknown()).optional(),
})
```

#### Output

```typescript
{
  document: {
    id: string;
    title: string;
    type: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    currentVersion: number;
    content: DocumentContent;
    customizations: Record<string, unknown>;
    metadata: { /* ... */ };
    createdAt: string;
    updatedAt: string;
  };
}
```

#### Side Effects
- If `content` provided: creates new `DocumentVersion` row, increments `currentVersion`
- If `customizations` provided: merges with existing `customizations` JSONB column
- Invalidates cached exports if document is published

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid content block structure or customization format |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| DOCUMENT_LOCKED | 409 | Document is `ARCHIVED` (cannot modify archived documents) |
| RATE_LIMITED | 429 | Exceeded 30 updates per 10s window |

#### Business Logic
1. Load document, validate ownership, status not `ARCHIVED`.
2. If `content` is provided:
   - Create `DocumentVersion` with `version = currentVersion + 1`
   - Set `changeSummary` auto-generated from diff
   - Update `currentVersion`
   - If status is `PUBLISHED`, change to `DRAFT` (published documents become drafts on content edit)
3. If `customizations` provided: deep-merge with existing `customizations` JSONB.
4. Update `updatedAt`.
5. Return updated document.

---

### 10.5 publish

Sets a document's status to `PUBLISHED`. Freezes the current version and makes the document available for embedding/export.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  document: {
    id: string;
    title: string;
    type: string;
    status: "PUBLISHED";
    currentVersion: number;
    publishedAt: string;
    publishUrl: string;          // public embeddable URL (slug)
  };
}
```

#### Side Effects
- Sets `status = "PUBLISHED"`, `publishedAt = now`
- Generates SEO-friendly `slug` (e.g., `/legal/privacy-policy-abc123`)
- Invalidates CDN cache for the document's public path
- Creates or updates `PublishedDocument` record with CDN metadata
- Records publish event in `AuditLog`

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| DOCUMENT_LOCKED | 409 | Document already `ARCHIVED` |
| BUSINESS_RULE_VIOLATION | 422 | Document content is empty |
| RATE_LIMITED | 429 | Exceeded 15 publishes per 15s window |

---

### 10.6 archive

Archives a document, removing it from active views and unpublishing if currently published.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  success: true;
}
```

#### Side Effects
- Sets `status = "ARCHIVED"`
- If published: removes `PublishedDocument` record, purges CDN cache
- Document remains queryable but not editable

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| RATE_LIMITED | 429 | Exceeded 15 archives per 15s window |

---

### 10.7 compare

Computes a structural diff between two versions of a document.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
  previousVersionId: z.string().uuid(),  // UUID of the older DocumentVersion
})
```

#### Output

```typescript
{
  diff: {
    documentId: string;
    versionA: number;  // older version
    versionB: number;  // newer (current) version
    changes: {
      type: "ADDED" | "REMOVED" | "MODIFIED";
      blockId: string;
      blockType: "heading" | "paragraph" | "list" | "clause" | "signature";
      before?: DocumentBlock | null;  // null for ADDED
      after?: DocumentBlock | null;   // null for REMOVED
      semanticChange?: "MINOR" | "MODERATE" | "MAJOR"; // AI-classified severity
    }[];
    summary: string;  // AI-generated plain-English summary of changes
  };
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid UUIDs |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| RESOURCE_NOT_FOUND | 404 | `previousVersionId` not found or not associated with this document |
| BUSINESS_RULE_VIOLATION | 422 | `previousVersionId` is not older than current version |
| RATE_LIMITED | 429 | Exceeded 10 comparisons per 30s window |

#### Business Logic
1. Load document, validate ownership.
2. Load both `DocumentVersion` records, validate version ordering.
3. Compute block-level diff using a structural comparison algorithm (block identity tracked by `id` field).
4. For MODIFIED blocks, call GPT-4o-mini to classify semantic severity (`MINOR`, `MODERATE`, `MAJOR`) based on the text delta.
5. Compose summary using GPT-4o-mini with before/after content.
6. Return diff structure.

---

## 11. Router: export

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/export`

### 11.1 exportPdf

Generates or retrieves a PDF export of a document. Pre-generated PDFs are served from cache; otherwise the document is rendered server-side via Puppeteer/Playwright.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  downloadUrl: string;  // pre-signed S3/Cloudflare R2 URL, expires in 1 hour
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid documentId |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Document cannot be exported in current status (must be DRAFT or PUBLISHED) |
| SERVICE_UNAVAILABLE | 503 | PDF rendering service unavailable |
| RATE_LIMITED | 429 | Exceeded 20 exports per 15s window |

#### Business Logic
1. Load document, validate ownership, status is `DRAFT` or `PUBLISHED`.
2. Check if a fresh PDF export exists (`DocumentExport` table, `format = "PDF"`, `generatedAt` > document's `updatedAt`).
3. If not: enqueue async PDF generation via `PdfRenderer.render(documentId)`:
   - Render document content via React-pdf or Playwright headless Chromium
   - Upload to Cloudflare R2
   - Create `DocumentExport` record
4. Generate pre-signed URL (1-hour expiry) for the R2 object.
5. Return `downloadUrl`.

---

### 11.2 exportDocx

Generates or retrieves a DOCX export of a document.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  downloadUrl: string;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid documentId |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Document cannot be exported in current status |
| SERVICE_UNAVAILABLE | 503 | DOCX generation service unavailable |
| RATE_LIMITED | 429 | Exceeded 20 exports per 15s window |

#### Business Logic
1. Same flow as `exportPdf`, using `docx` library for Node.js to produce `.docx` output.
2. Upload to R2, create `DocumentExport` record, return pre-signed URL.

---

### 11.3 getEmbedSnippet

Returns the HTML/JS embed snippet for a published document, enabling customers to embed live-updating legal pages on their own websites.

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  html: string;   // minimal HTML container element
  script: string; // <script> tag to embed (loads the live document via iframe or web component)
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid documentId |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | Document is not `PUBLISHED` |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

#### Business Logic
1. Load document, validate ownership, status must be `PUBLISHED`.
2. Look up `PublishedDocument` record for CDN path.
3. Generate embed HTML (a `<div>` with unique ID) + `<script>` tag that loads the document renderer from CDN.
4. The embed script uses an iframe pointing to `https://cdn.legalmint.ai/embed/{slug}` with the document content pre-rendered.

---

### 11.4 getExportHistory

Returns the export history for a document (all export jobs and their statuses).

#### Input

```typescript
z.object({
  documentId: z.string().uuid(),
})
```

#### Output

```typescript
{
  exports: {
    id: string;
    format: "PDF" | "DOCX";
    status: "PENDING" | "COMPLETED" | "FAILED";
    generatedAt: string;
    expiresAt: string;
    downloadUrl: string | null;     // null if expired or failed
    versionExported: number;
  }[];
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid documentId |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `documentId` not found |
| RESOURCE_NOT_OWNED | 403 | Document not owned by user |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

---

## 12. Router: alerts

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/alerts`

Alerts are generated by a scheduled job that monitors regulatory changes, document staleness, and compliance deadline proximity. Alert triggers include: regulation updates, document expirations, compliance gap emergence, and subscription limits approaching.

### 12.1 list

Returns alerts for the authenticated user's business profile.

#### Input

```typescript
z.object({
  unreadOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
})
```

#### Output

```typescript
{
  alerts: {
    id: string;
    type: "REGULATION_UPDATE" | "DOCUMENT_EXPIRY" | "COMPLIANCE_GAP" | "USAGE_LIMIT" | "SYSTEM";
    severity: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
    read: boolean;
    dismissed: boolean;
    actionUrl: string | null;     // deep link to relevant page in app
    createdAt: string;
  }[];
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No `BusinessProfile` for user |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

#### Business Logic
1. Load user's `BusinessProfile`.
2. Query `Alert` table where `profileId = user.profileId` and `dismissed = false`.
3. Apply `unreadOnly` filter if `true`.
4. Order by `createdAt DESC`, limit.
5. Return alert list.

---

### 12.2 markRead

Marks a specific alert as read.

#### Input

```typescript
z.object({
  alertId: z.string().uuid(),
})
```

#### Output

```typescript
{
  success: true;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `alertId` not found |
| RESOURCE_NOT_OWNED | 403 | Alert belongs to a different user's profile |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

---

### 12.3 dismiss

Dismisses an alert (soft removal from the active alert list).

#### Input

```typescript
z.object({
  alertId: z.string().uuid(),
})
```

#### Output

```typescript
{
  success: true;
}
```

#### Side Effects
- Sets `dismissed = true`, `dismissedAt = now` on the `Alert` record

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `alertId` not found |
| RESOURCE_NOT_OWNED | 403 | Alert belongs to a different user's profile |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

---

### 12.4 getHealthScore

Computes a compliance health score for a business profile, based on completed requirements, upcoming deadlines, and document freshness.

#### Input

```typescript
z.object({
  profileId: z.string().uuid(),
})
```

#### Output

```typescript
{
  score: number;                         // 0-100
  breakdown: {
    documentCoverage: number;            // 0-100 (how many required docs are present)
    requirementCompletion: number;       // 0-100 (% of compliance requirements completed)
    documentFreshness: number;           // 0-100 (how recently documents were reviewed)
    regulatoryAwareness: number;         // 0-100 (coverage of applicable regulations)
  };
  recommendations: {
    priority: "HIGH" | "MEDIUM" | "LOW";
    title: string;
    description: string;
    actionType: "GENERATE_DOCUMENT" | "REVIEW_DOCUMENT" | "COMPLETE_REQUIREMENT" | "UPDATE_PROFILE";
    actionTargetId: string | null;       // ID of the resource to act on
  }[];
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | `profileId` not found or not owned by user |
| BUSINESS_RULE_VIOLATION | 422 | No compliance roadmap exists for this profile |
| RATE_LIMITED | 429 | Exceeded 10 requests per 30s window |

#### Business Logic
1. Load profile + compliance roadmap + documents.
2. Compute `documentCoverage`: ratio of recommended document types vs generated.
3. Compute `requirementCompletion`: ratio of completed vs total requirements.
4. Compute `documentFreshness`: weighted decay based on days since last review (100% if < 30 days, 0% if > 365 days).
5. Compute `regulatoryAwareness`: coverage of active regulations with non-expired roadmap.
6. Weighted overall score: `0.35 * documentCoverage + 0.30 * requirementCompletion + 0.20 * documentFreshness + 0.15 * regulatoryAwareness`.
7. Generate recommendations via a deterministic rules engine (not LLM) based on score gaps.

---

## 13. Router: subscription

**Access:** Protected (valid access token required)  
**Base path:** `/api/trpc/subscription`

Pricing tiers:
- **FREE**: 3 documents, 1 compliance check, basic export, no embed
- **PRO** ($29/mo): 20 documents, 10 compliance checks, PDF/DOCX export, embed
- **BUSINESS** ($99/mo): 100 documents, 50 compliance checks, PDF/DOCX export, embed, priority support
- **ENTERPRISE** (custom): unlimited, custom SLA, white-label

### 13.1 getCurrent

Returns the current subscription details and plan for the authenticated user.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  subscription: {
    id: string;
    plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
    status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    trialEndsAt: string | null;
    createdAt: string;
  };
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No subscription record for user |

#### Business Logic
1. Load `Subscription` record for `user.id`.
2. If no Stripe subscription (FREE plan), return local subscription data.
3. If Stripe subscription exists, sync latest status from Stripe API (`stripe.subscriptions.retrieve()`), update local record if changed.
4. Return subscription data.

---

### 13.2 createCheckout

Creates a Stripe Checkout session for upgrading to a paid plan.

#### Input

```typescript
z.object({
  plan: z.enum(["PRO", "BUSINESS"]),
})
```

> ENTERPRISE is not available via self-service checkout; it requires contacting sales.

#### Output

```typescript
{
  checkoutUrl: string;  // Stripe Checkout URL — client should redirect
}
```

#### Side Effects
- Creates Stripe Checkout Session with `mode: "subscription"`
- Stores pending checkout session ID in `Subscription.checkoutSessionId`

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid plan |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| BUSINESS_RULE_VIOLATION | 422 | User already has an active paid subscription at the same or higher tier |
| SERVICE_UNAVAILABLE | 503 | Stripe API unavailable |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

#### Business Logic
1. Load current subscription. If already on requested plan or higher, return error.
2. If user has no Stripe customer record, create one via `stripe.customers.create({ email, name })`.
3. Create Stripe Checkout Session:
   - `mode: "subscription"`
   - `line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }]`
   - `success_url: APP_URL + "/settings/billing?session_id={CHECKOUT_SESSION_ID}"`
   - `cancel_url: APP_URL + "/pricing"`
   - `metadata: { userId, plan }`
4. Save `checkoutSessionId` to `Subscription` record.
5. Return `checkoutUrl`.

---

### 13.3 createBillingPortal

Creates a Stripe Customer Portal session for managing payment methods and viewing invoices.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  portalUrl: string;  // Stripe Billing Portal URL — client should redirect
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| BUSINESS_RULE_VIOLATION | 422 | User has no Stripe customer record (FREE plan, no payment history) |
| SERVICE_UNAVAILABLE | 503 | Stripe API unavailable |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

#### Business Logic
1. Load `Subscription.stripeCustomerId`. If null, return error (no Stripe record).
2. Create Stripe Billing Portal session via `stripe.billingPortal.sessions.create()`.
3. Return `portalUrl`.

---

### 13.4 getUsage

Returns the current billing period's usage against plan limits.

#### Input

```typescript
// No input (uses authenticated user context)
```

#### Output

```typescript
{
  documentsGenerated: number;
  documentsLimit: number;      // null for ENTERPRISE (unlimited)
  complianceChecks: number;
  checksLimit: number;         // null for ENTERPRISE (unlimited)
  periodStart: string;
  periodEnd: string;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| RESOURCE_NOT_FOUND | 404 | No subscription record for user |
| RATE_LIMITED | 429 | Exceeded 30 requests per 5s window |

#### Business Logic
1. Load `Subscription` record.
2. If billing period has rolled over, reset usage counters to 0 and update `periodStart`/`periodEnd`.
3. Map plan to limits: `FREE = { docs: 3, checks: 1 }`, `PRO = { docs: 20, checks: 10 }`, `BUSINESS = { docs: 100, checks: 50 }`, `ENTERPRISE = { docs: null, checks: null }`.
4. Return usage + limits.

---

## 14. Router: admin

**Access:** Protected + ADMIN role required  
**Base path:** `/api/trpc/admin`

Every admin procedure includes a role-check middleware: `TRPCError(FORBIDDEN)` if `ctx.session.role !== "ADMIN"`.

### 14.1 listUsers

Returns a paginated, searchable list of all registered users.

#### Input

```typescript
z.object({
  search: z.string().max(200).optional(),   // searches email and name
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})
```

#### Output

```typescript
{
  users: {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    subscriptionPlan: string;
    subscriptionStatus: string;
    documentCount: number;
    createdAt: string;
    lastLoginAt: string | null;
  }[];
  nextCursor: string | null;
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid pagination params |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| INSUFFICIENT_ROLE | 403 | User is not ADMIN |
| RATE_LIMITED | 429 | Exceeded 60 requests per 5s window |

#### Business Logic
1. Verify `session.role === "ADMIN"`.
2. Build Prisma query: `User` joined with `Subscription` and aggregated document count.
3. Apply search filter: `WHERE email ILIKE '%search%' OR name ILIKE '%search%'`.
4. Apply cursor pagination.
5. Return user list.

---

### 14.2 getUser

Returns detailed information about a specific user, including their business profile and documents.

#### Input

```typescript
z.object({
  userId: z.string().uuid(),
})
```

#### Output

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    avatarUrl: string | null;
    loginCount: number;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  profile: BusinessProfile | null;
  documents: {
    id: string;
    title: string;
    type: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    currentVersion: number;
    createdAt: string;
  }[];
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| INSUFFICIENT_ROLE | 403 | User is not ADMIN |
| RESOURCE_NOT_FOUND | 404 | `userId` does not exist |
| RATE_LIMITED | 429 | Exceeded 60 requests per 5s window |

---

### 14.3 getAnalytics

Returns aggregated platform analytics.

#### Input

```typescript
// No input
```

#### Output

```typescript
{
  stats: {
    totalUsers: number;
    totalProfiles: number;
    totalDocuments: number;
    publishedDocuments: number;
    totalComplianceRequirements: number;
    completedRequirements: number;
    mrr: number;                           // Monthly Recurring Revenue in USD cents
    activeSubscriptions: number;
    trialUsers: number;
    conversionRate: number;                // 0-1 (trial → paid)
    documentsGeneratedToday: number;
    documentsGeneratedThisMonth: number;
    avgDocumentsPerUser: number;
    topDocumentTypes: { type: string; count: number }[];
    userGrowth: { date: string; count: number }[]; // last 30 days
  };
}
```

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| INSUFFICIENT_ROLE | 403 | User is not ADMIN |
| RATE_LIMITED | 429 | Exceeded 60 requests per 5s window |

#### Business Logic
1. Verify admin role.
2. Aggregate from: `User`, `BusinessProfile`, `Document`, `ComplianceRequirement`, `ComplianceRequirementMapping`, `Subscription` tables.
3. MRR computed from active Stripe subscriptions with prorated current-period amounts.
4. `userGrowth` is a 30-day time series of cumulative user registrations.
5. Cache result in Redis with 5-minute TTL to avoid repeated heavy queries.

---

### 14.4 updateComplianceDB

Updates the compliance regulation database for a specific jurisdiction. This is an admin-only operation for maintaining the regulation knowledge base.

#### Input

```typescript
z.object({
  jurisdictionId: z.string().regex(/^[A-Z]{2}(-[A-Z0-9]+)?$/),  // ISO 3166-2
  requirements: z.array(
    z.object({
      id: z.string().uuid().optional(),          // omit for new, include for update
      title: z.string().min(1).max(500),
      category: z.string().max(100),
      description: z.string().max(5000),
      regulationSource: z.string().max(500),
      citationUrl: z.string().url().nullable(),
      suggestedActions: z.array(z.string().max(1000)),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      applicableBusinessStructures: z.array(
        z.enum(["SOLE_PROPRIETORSHIP", "LLC", "S_CORP", "C_CORP", "PARTNERSHIP", "NONPROFIT"])
      ),
      applicableIndustries: z.array(z.string()).optional(),  // empty = all
      minEmployees: z.number().int().min(0).optional(),
      maxEmployees: z.number().int().min(0).optional(),
    })
  ),
})
```

#### Output

```typescript
{
  updated: {
    created: number;
    updated: number;
    deleted: number;
    jurisdictionId: string;
    totalRequirements: number;
  };
}
```

#### Side Effects
- Upserts `ComplianceRequirement` records in the regulation database
- Soft-deletes any requirements not included in the update
- Triggers re-embedding of updated requirements into Pinecone vector DB (async)
- Records admin action in `AuditLog` with full payload diff

#### Error Cases

| Error Code | Status | Condition |
|------------|--------|-----------|
| VALIDATION_ERROR | 400 | Invalid jurisdiction format or requirement schema |
| UNAUTHENTICATED | 401 | Missing or invalid access token |
| INSUFFICIENT_ROLE | 403 | User is not ADMIN |
| INTERNAL_ERROR | 500 | Database write or vector embedding failure |
| RATE_LIMITED | 429 | Exceeded 60 requests per 5s window |

#### Business Logic
1. Verify admin role.
2. Upsert each requirement in the `Regulation` table (distinct from user-specific `ComplianceRequirement`).
3. Identify requirements that were previously in this jurisdiction but not in the new set → soft-delete.
4. Enqueue background job: re-embed all updated regulations into Pinecone vector index.
5. Log admin action with full before/after snapshot in `AuditLog`.
6. Return update summary counts.

---

## 15. Webhook Endpoints

Webhook endpoints are **not** part of the tRPC router — they are standard Next.js API routes (`/api/webhooks/*`). They use raw request body verification via Stripe signature.

### 15.1 Stripe Webhook (`POST /api/webhooks/stripe`)

**Access:** Public (verified by Stripe webhook signature)  
**Content-Type:** `application/json`  
**Signature Header:** `stripe-signature`

#### Events Handled

| Stripe Event | Action |
|-------------|--------|
| `checkout.session.completed` | Activate subscription. Update `Subscription.plan`, `status = "ACTIVE"`, `stripeSubscriptionId`. Reset usage counters. |
| `customer.subscription.updated` | Sync subscription status and plan. Handle plan changes (upgrade/downgrade). |
| `customer.subscription.deleted` | Set `status = "CANCELED"`, downgrade to FREE plan at period end. |
| `invoice.payment_succeeded` | Log payment event. Clear `PAST_DUE` status if applicable. |
| `invoice.payment_failed` | Set `status = "PAST_DUE"`. Send alert to user. After 3 retries, cancel subscription. |
| `invoice.upcoming` | (Ignored — informational only) |
| `customer.created` | Link `stripeCustomerId` to user record if not already set. |
| `entitlements.active_entitlement_summary.updated` | (Future: for Stripe Entitlements-based usage enforcement) |

#### Verification

1. Read raw request body as `Buffer` (critical: Next.js body parser must be disabled for this route).
2. Verify signature: `stripe.webhooks.constructEvent(body, signature, webhookSecret)`.
3. If verification fails: respond `400 Invalid signature`.
4. If verification succeeds: respond `200 { received: true }` immediately (Stripe expects fast ACK).
5. Process event asynchronously via background job queue.

#### Error Handling

- Events are idempotent: processed event IDs are stored in `StripeEventLog` table; duplicate events are acknowledged but skipped.
- If processing fails, the event is re-queued with exponential backoff (max 3 retries, then logged for manual review).

---

## 16. TypeScript Type Definitions

### 16.1 Core Domain Types

```typescript
// ── Auth ──────────────────────────────────────────────

type UserRole = "USER" | "ADMIN";

interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerifyToken: string | null;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
  avatarUrl: string | null;
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── Business Profile ─────────────────────────────────

type BusinessStructure =
  | "SOLE_PROPRIETORSHIP"
  | "LLC"
  | "S_CORP"
  | "C_CORP"
  | "PARTNERSHIP"
  | "NONPROFIT";

type OnboardingStatus = "PRE_ONBOARDING" | "IN_PROGRESS" | "COMPLETED";

interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessStructure: BusinessStructure;
  industry: string;
  jurisdictions: string[];
  employeeCount: number | null;
  annualRevenue: number | null;         // USD
  foundedYear: number | null;
  website: string | null;
  description: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingCompletedAt: Date | null;
  generatedProfile: Record<string, unknown>;  // full structured data from onboarding answers
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── Compliance ────────────────────────────────────────

type ComplianceStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

interface ComplianceRoadmap {
  id: string;
  profileId: string;
  status: ComplianceStatus;
  generatedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ComplianceRequirement {
  id: string;
  roadmapId: string;
  title: string;
  category: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  jurisdiction: string;
  regulationSource: string;
  citationUrl: string | null;
  suggestedActions: string[];
  estimatedEffort: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  updatedAt: Date;
}

type RequirementStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "NOT_APPLICABLE";

interface ComplianceRequirementMapping {
  id: string;
  requirementId: string;
  profileId: string;
  status: RequirementStatus;
  notes: string | null;
  updatedAt: Date;
}

// ── Documents ─────────────────────────────────────────

type DocumentType =
  | "TERMS_OF_SERVICE"
  | "PRIVACY_POLICY"
  | "EMPLOYMENT_AGREEMENT"
  | "NDA"
  | "LLC_OPERATING_AGREEMENT"
  | "CONTRACTOR_AGREEMENT"
  | "PARTNERSHIP_AGREEMENT"
  | "COOKIE_POLICY"
  | "GDPR_NOTICE"
  | "DISCLAIMER"
  | "CUSTOM";

type DocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type ContentBlockType = "heading" | "paragraph" | "list" | "clause" | "signature";

interface DocumentBlock {
  type: ContentBlockType;
  id: string;
  data: Record<string, unknown>;
}

type DocumentContent = DocumentBlock[];

interface Document {
  id: string;
  profileId: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  currentVersion: number;
  content: DocumentContent;
  customizations: Record<string, unknown>;
  publishedAt: Date | null;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: DocumentContent;
  changeSummary: string | null;
  createdAt: Date;
}

// ── Export ────────────────────────────────────────────

type ExportFormat = "PDF" | "DOCX";
type ExportStatus = "PENDING" | "COMPLETED" | "FAILED";

interface DocumentExport {
  id: string;
  documentId: string;
  format: ExportFormat;
  status: ExportStatus;
  storageKey: string | null;
  generatedAt: Date;
  expiresAt: Date;
  versionExported: number;
}

// ── Alerts ────────────────────────────────────────────

type AlertType = "REGULATION_UPDATE" | "DOCUMENT_EXPIRY" | "COMPLIANCE_GAP" | "USAGE_LIMIT" | "SYSTEM";
type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

interface Alert {
  id: string;
  profileId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  read: boolean;
  dismissed: boolean;
  dismissedAt: Date | null;
  actionUrl: string | null;
  createdAt: Date;
}

// ── Subscription ──────────────────────────────────────

type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  checkoutSessionId: string | null;
  trialEndsAt: Date | null;
  documentsGenerated: number;
  complianceChecks: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Onboarding ────────────────────────────────────────

interface OnboardingSession {
  id: string;
  profileId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OnboardingAnswer {
  id: string;
  sessionId: string;
  questionKey: string;
  answerValue: string | string[] | boolean | number;
  answeredAt: Date;
}

// ── Audit / Logging ───────────────────────────────────

type AuditAction =
  | "REGISTER"
  | "LOGIN"
  | "EMAIL_VERIFY"
  | "PASSWORD_RESET"
  | "PROFILE_CREATE"
  | "PROFILE_UPDATE"
  | "PROFILE_DELETE"
  | "COMPLIANCE_GENERATE"
  | "COMPLIANCE_STATUS_UPDATE"
  | "DOCUMENT_CREATE"
  | "DOCUMENT_UPDATE"
  | "DOCUMENT_PUBLISH"
  | "DOCUMENT_ARCHIVE"
  | "DOCUMENT_EXPORT"
  | "SUBSCRIPTION_CHANGE"
  | "ADMIN_ACTION";

interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string | null;
  createdAt: Date;
}

// ── Stripe Webhook Log ────────────────────────────────

interface StripeEventLog {
  id: string;
  stripeEventId: string;
  eventType: string;
  processed: boolean;
  error: string | null;
  createdAt: Date;
}

// ── Session ───────────────────────────────────────────

interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
```

### 16.2 Plan Limits Map

```typescript
const PLAN_LIMITS: Record<Plan, { documents: number | null; complianceChecks: number | null }> = {
  FREE:       { documents: 3,    complianceChecks: 1    },
  PRO:        { documents: 20,   complianceChecks: 10   },
  BUSINESS:   { documents: 100,  complianceChecks: 50   },
  ENTERPRISE: { documents: null, complianceChecks: null },  // null = unlimited
};
```

### 16.3 HTTP Response Status Quick Reference

| Category | Status | Meaning |
|----------|--------|---------|
| Success | 200 | OK — response body contains data |
| Success | 201 | Created — resource created |
| Success | 204 | No Content — operation succeeded, no body |
| Client Error | 400 | Bad Request — validation failure |
| Client Error | 401 | Unauthorized — missing/expired token |
| Client Error | 403 | Forbidden — insufficient permissions |
| Client Error | 404 | Not Found — resource does not exist |
| Client Error | 409 | Conflict — duplicate or state conflict |
| Client Error | 422 | Unprocessable Content — business rule violation |
| Client Error | 429 | Too Many Requests — rate limited |
| Server Error | 500 | Internal Server Error — unexpected failure |
| Server Error | 503 | Service Unavailable — upstream dependency down |

---

## Appendix A: tRPC Client Invocation

```typescript
// Client-side usage (Next.js App Router)
import { trpc } from "@/lib/trpc/client";

// Query (read operation, cached by tRPC)
const { data, isLoading, error } = trpc.documents.list.useQuery({
  status: "PUBLISHED",
  limit: 10,
});

// Mutation (write operation)
const publishMutation = trpc.documents.publish.useMutation({
  onSuccess: (data) => {
    console.log("Published:", data.document.publishUrl);
  },
});

await publishMutation.mutateAsync({ documentId: "uuid-here" });

// Infinite query (cursor pagination)
const { data, fetchNextPage, hasNextPage } = trpc.documents.list.useInfiniteQuery(
  { limit: 20 },
  { getNextPageParam: (lastPage) => lastPage.nextCursor }
);
```

## Appendix B: Server-Side Router Definition

```typescript
// Example (simplified): server-side router composition
// packages/api/src/router/index.ts

import { router } from "../trpc";
import { authRouter } from "./auth";
import { onboardingRouter } from "./onboarding";
import { businessProfileRouter } from "./businessProfile";
import { complianceRouter } from "./compliance";
import { documentsRouter } from "./documents";
import { exportRouter } from "./export";
import { alertsRouter } from "./alerts";
import { subscriptionRouter } from "./subscription";
import { adminRouter } from "./admin";

export const appRouter = router({
  auth: authRouter,           // public
  onboarding: onboardingRouter,
  businessProfile: businessProfileRouter,
  compliance: complianceRouter,
  documents: documentsRouter,
  export: exportRouter,
  alerts: alertsRouter,
  subscription: subscriptionRouter,
  admin: adminRouter,         // protected + ADMIN
});

export type AppRouter = typeof appRouter;
```

---

> **Maintained by:** Engineering Team  
> **Review Cadence:** Every sprint / on schema change  
> **Source of Truth:** This document + Zod schemas in `packages/api/src/schemas/`  
> **Last Updated:** May 2026