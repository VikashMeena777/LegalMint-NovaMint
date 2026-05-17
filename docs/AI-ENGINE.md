# LegalEase AI — AI Engine Architecture

**Version:** 1.0.0  
**Last Updated:** 2026-05-13  
**Owner:** AI/ML Team

---

## 1. AI Pipeline Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        LEGALEASE AI PIPELINE                         │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │  USER    │    │ INPUT    │    │ CONTEXT  │    │  PROMPT  │       │
│  │  INPUT   │───▶│ SANITIZE │───▶│ ENRICH   │───▶│ ASSEMBLY │       │
│  │ (chat/   │    │ & CLASS  │    │ via RAG  │    │          │       │
│  │  form)   │    │  -IFY    │    │          │    │          │       │
│  └──────────┘    └──────────┘    └────┬─────┘    └────┬─────┘       │
│                                       │               │             │
│                               ┌───────▼───────┐       │             │
│                               │ VECTOR SEARCH │       │             │
│                               │ (Pinecone/   │       │             │
│                               │  pgvector)   │       │             │
│                               └───────┬───────┘       │             │
│                                       │               │             │
│  ┌──────────┐    ┌──────────┐    ┌───▼───────┐    ┌──▼────────┐    │
│  │ RESPONSE │    │  POST-   │    │   LLM     │    │  SYSTEM   │    │
│  │ STREAM   │◀───│ GEN      │◀───│ INFERENCE │◀───│  PROMPT   │    │
│  │  BACK    │    │ VALIDATE │    │ (GPT-4o)  │    │  INJECT   │    │
│  └──────────┘    └──────────┘    └───────────┘    └───────────┘    │
│                                       │                             │
│                              ┌────────▼────────┐                    │
│                              │   CACHE CHECK   │                    │
│                              │ (Redis/In-Mem)  │                    │
│                              └─────────────────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

### Pipeline Stages (detailed)

| Stage | Component | Responsibility |
|-------|-----------|----------------|
| 1 | **Input Sanitizer** | Strip PII, normalize text, detect language, classify intent (onboarding / compliance / generation / review) |
| 2 | **Context Enricher** | Query RAG pipeline for relevant legal clauses, jurisdiction rules, similar business profiles |
| 3 | **Prompt Assembler** | Merge system prompt + RAG context + user input + conversation history → final prompt payload |
| 4 | **Cache Check** | Hash final prompt; return cached response if similarity threshold > 0.98 |
| 5 | **LLM Inference** | Send to GPT-4o with structured output constraints |
| 6 | **Post-Gen Validation** | Schema check, clause presence, disclaimer verification, confidence scoring |
| 7 | **Response Stream** | Stream tokens to client with incremental validation |

---

## 2. LLM Configuration

### Primary Model

| Parameter | Value |
|-----------|-------|
| **Model** | `gpt-4o` (OpenAI) |
| **Fallback** | `gpt-4o-mini` (for high-volume, low-complexity tasks) |
| **Provider** | OpenAI API via `openai` Node SDK |
| **API Version** | `2024-08-06` (supports structured outputs) |

### Temperature Settings

| Use Case | Temperature | Reasoning |
|----------|-------------|-----------|
| Onboarding Interview | `0.3` | Needs conversational variability but factual grounding |
| Compliance Mapping | `0.0` | Zero variance required; deterministic legal mapping |
| Document Generation (TOS/Privacy) | `0.1` | Near-deterministic; slight flexibility for clause phrasing |
| Document Generation (Cookie Policy) | `0.2` | Slightly more phrasing variation acceptable |
| Compliance Health Check | `0.0` | Strict comparison against regulation texts |
| Document Reviewer | `0.1` | Consistent review criteria, minimal variance |
| General Chat / FAQ | `0.5` | Natural conversation, grounded in legal context |

### Max Tokens per Use Case

| Use Case | Max Tokens | Notes |
|----------|------------|-------|
| Onboarding Interview | `4,096` | Multi-turn conversation with context |
| Compliance Mapping (roadmap) | `8,192` | Complex regulatory matrix output |
| Document Generation (TOS) | `16,384` | Full-length legal document |
| Document Generation (Privacy) | `16,384` | Full-length legal document |
| Document Generation (Cookie Policy) | `8,192` | Shorter document |
| Document Generation (Operating Agreement) | `16,384` | Full-length legal document |
| Compliance Health Check | `8,192` | Detailed audit report |
| Document Reviewer | `8,192` | Annotated document review |
| General Chat | `2,048` | Conversational responses |

### Token Budget Allocation

```
Total tokens per request = System Prompt + RAG Context + Conversation History + User Input + Expected Output

Budget rule: System Prompt ≤ 2,000 tokens
              RAG Context   ≤ 4,000 tokens
              Conversation  ≤ 4,000 tokens
              Output        ≤ remaining context window
```

---

## 3. Prompt Engineering Strategy

### 3.1 System Prompt Architecture — Base + Layered Approach

```
┌─────────────────────────────────────────────┐
│          LAYER 4: USE-CASE INSTRUCTIONS     │  ← Specific to document type / task
├─────────────────────────────────────────────┤
│          LAYER 3: JURISDICTION OVERLAY      │  ← Injected based on user's jurisdiction
├─────────────────────────────────────────────┤
│          LAYER 2: LEGAL DOMAIN CONTEXT      │  ← Common legal principles, definitions
├─────────────────────────────────────────────┤
│          LAYER 1: BASE SYSTEM PERSONA       │  ← Core identity, tone, disclaimers
└─────────────────────────────────────────────┘
```

**Layer 1 — Base Persona:** Consistent across all prompts. Defines the AI's identity as a legal document assistant (NOT a lawyer), establishes tone, mandatory disclaimers, and behavioral boundaries.

**Layer 2 — Legal Domain Context:** Injected based on the detected legal domain (contracts, privacy, compliance, corporate). Contains common definitions, standard clause structures, and cross-jurisdictional principles.

**Layer 3 — Jurisdiction Overlay:** Dynamically injected based on the user's selected jurisdiction(s). Contains jurisdiction-specific statutes, regulatory bodies, required clauses, and terminology differences.

**Layer 4 — Use-Case Instructions:** Task-specific instructions for the particular operation (draft TOS, map compliance, review document, conduct interview).

### 3.2 Few-Shot Prompting with Legal Examples

Each use-case prompt includes **3–5 example input/output pairs** following this format:

```
EXAMPLE INPUT:
{
  "businessType": "SaaS,
  "jurisdiction": "California, USA",
  "collectsPII": true,
  "usesCookies": true
}

EXAMPLE OUTPUT:
{
  "document": "Privacy Policy for California-based SaaS...",
  "applicableRegulations": ["CCPA", "CalOPPA", "GDPR (if EU users)"],
  "requiredClauses": [...]
}
```

Examples are curated from verified legal templates reviewed by the legal advisory board. They cover:
- Common business types (SaaS, E-commerce, Marketplace, Agency, Mobile App)
- High-traffic jurisdictions (US-DE, US-CA, UK, EU-GDPR, AU, CA, IN)
- Edge cases (multi-jurisdiction, regulated industries like Fintech/Health)

### 3.3 Chain-of-Thought for Complex Compliance Mapping

For compliance roadmap generation, the model is instructed to use an explicit chain-of-thought process:

```
You MUST follow this reasoning chain internally:

STEP 1: IDENTIFY APPLICABLE REGULATIONS
- List all regulations triggered by business type + jurisdiction + data practices

STEP 2: MAP REGULATION → REQUIREMENT
- For each regulation, extract all actionable requirements
- Tag requirements by category (DATA_COLLECTION, USER_RIGHTS, DISCLOSURE, SECURITY, RETENTION)

STEP 3: CROSS-REFERENCE OVERLAPS
- Identify overlapping requirements across regulations
- Determine the "highest standard" where regulations conflict

STEP 4: ASSESS CURRENT COMPLIANCE
- Compare user's current practices against requirements
- Flag gaps with severity (CRITICAL / HIGH / MEDIUM / LOW)

STEP 5: GENERATE ROADMAP
- Order actions by priority + dependency
- Assign estimated effort levels (hours/days/weeks)
```

### 3.4 Structured Output Format — JSON Schema Enforcement

All LLM outputs must conform to strict JSON schemas using OpenAI's Structured Outputs (`response_format: { type: "json_schema", ... }`).

Key schemas:

| Schema | Use Case | Enforced Fields |
|--------|----------|----------------|
| `COMPLIANCE_ROADMAP` | Compliance mapping output | `applicableRegulations`, `requirements[]`, `gaps[]`, `actionItems[]`, `disclaimer` |
| `DOCUMENT_OUTPUT` | Generated legal documents | `title`, `lastUpdated`, `jurisdiction`, `sections[]`, `disclaimer` |
| `REVIEW_OUTPUT` | Document review results | `documentType`, `issues[]`, `riskScore`, `suggestions[]`, `disclaimer` |
| `INTERVIEW_QUESTION` | Onboarding dynamic questions | `questionId`, `questionText`, `fieldKey`, `options[]`, `jurisdictionRelevance` |
| `HEALTH_CHECK` | Compliance health assessment | `overallScore`, `categoryScores{}`, `findings[]`, `remediationSteps[]`, `disclaimer` |

---

## 4. RAG (Retrieval Augmented Generation) Architecture

### 4.1 Vector Database Setup

```
┌───────────────────────────────────────────────────┐
│                RAG INFRASTRUCTURE                  │
│                                                    │
│  ┌─────────────┐     ┌─────────────────────────┐  │
│  │  INGESTION  │     │      QUERY PIPELINE     │  │
│  │  PIPELINE   │     │                          │  │
│  │             │     │  1. User Query           │  │
│  │  1. Parse   │     │  2. Generate Embedding   │  │
│  │  2. Chunk   │     │  3. Vector Search        │  │
│  │  3. Embed   │     │  4. Rerank Results       │  │
│  │  4. Store   │     │  5. Inject into Prompt   │  │
│  └──────┬──────┘     └────────────┬────────────┘  │
│         │                        │                │
│         ▼                        ▼                │
│  ┌──────────────────────────────────────────────┐ │
│  │          VECTOR DATABASE (Pinecone)          │ │
│  │  • Index: legalease-prod                     │ │
│  │  • Dimension: 3072 (text-embedding-3-large)  │ │
│  │  • Metric: cosine                            │ │
│  │  • Namespaces: regulations, templates,       │ │
│  │                 clauses, case_studies         │ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### 4.2 Embedding Model

| Parameter | Value |
|-----------|-------|
| **Model** | `text-embedding-3-large` |
| **Provider** | OpenAI Embeddings API |
| **Dimensions** | 3,072 |
| **Max Input Tokens** | 8,191 per embedding call |
| **Batch Size** | 2,048 texts per batch for cost efficiency |

### 4.3 Chunking Strategy for Legal Documents

```
┌────────────────────────────────────────────────────┐
│              CHUNKING STRATEGY                      │
│                                                     │
│  DOCUMENT → Semantic Split → Chunk → Enrich → Store │
│                                                     │
│  Split Rules:                                       │
│  ├─ Primary: Section boundaries (## Section Title)  │
│  ├─ Secondary: Paragraph breaks                     │
│  ├─ Chunk Size: 500 tokens (target)                 │
│  ├─ Chunk Overlap: 100 tokens                        │
│  └─ Never split: mid-sentence, mid-list             │
│                                                     │
│  Chunk Metadata (stored alongside vector):          │
│  ├─ source_document_title                           │
│  ├─ source_section                                  │
│  ├─ jurisdiction (ISO 3166-2)                       │
│  ├─ regulation_name (GDPR, CCPA, etc.)              │
│  ├─ clause_type (disclaimer, limitation, rights)    │
│  ├─ chunk_index / total_chunks                      │
│  └─ last_reviewed_date                              │
└────────────────────────────────────────────────────┘
```

**Embedding Strategies by Content Type:**

| Content Type | Pre-processing | Chunk Size | Additional Context |
|-------------|----------------|------------|-------------------|
| Statute text | Strip legal citations, normalize whitespace | 300 tokens | Parent act + section number |
| Privacy regulations | Preserve article/recital numbering | 400 tokens | Regulation name + article number |
| Legal templates | Extract clause-level granularity | 500 tokens | Document type + jurisdiction |
| Case studies / FAQs | Preserve Q&A pairs intact | 600 tokens | Topic tags |

### 4.4 Retrieval Pipeline with Relevance Scoring

```
Query → Generate Embedding → Vector Search (top_k=20) → Reranker → Filter (score > 0.75) → top_k=5 → Inject into Prompt
```

| Stage | Implementation | Details |
|-------|---------------|---------|
| **Initial Retrieval** | Pinecone `query()` | top_k=20, include_metadata=true, filter by jurisdiction namespace |
| **Reranking** | Cohere Rerank v3 or cross-encoder | Rerank 20 → top 10 by relevance |
| **Score Filtering** | Threshold-based | Keep chunks with similarity > 0.75 |
| **Deduplication** | Metadata-based | Remove duplicate source sections |
| **Context Assembly** | Merge + sort by relevance | Format as `[SOURCE: {title}, SECTION: {section}]\n{text}\n\n` |

**Multi-Stage Retrieval for Complex Queries:**

```
For COMPLIANCE_MAPPING queries:
  1. Retrieve applicable regulations (namespace: regulations)
  2. Retrieve relevant clause templates (namespace: clauses)
  3. Retrieve similar business case studies (namespace: case_studies)
  4. Merge & deduplicate all contexts
```

---

## 5. Output Validation

### 5.1 Post-Generation Validation Checklist

Every LLM output passes through the following validation pipeline before delivery to the user:

```
┌───────────────────────────────────────────────────┐
│             OUTPUT VALIDATION PIPELINE            │
│                                                    │
│  1. FORMAT VALIDATION                             │
│     ├─ JSON parseable?                             │
│     ├─ Schema compliance? (JSON Schema validation) │
│     └─ All required fields present?                │
│                                                    │
│  2. LEGAL VALIDATION                              │
│     ├─ Disclaimer present?                         │
│     ├─ Jurisdiction references match input?        │
│     ├─ Required clauses present?                   │
│     └─ Legal citations in correct format?          │
│                                                    │
│  3. QUALITY VALIDATION                            │
│     ├─ Confidence score ≥ threshold?               │
│     ├─ No hallucinated regulation references?      │
│     ├─ Content length within expected range?       │
│     └─ Readability score check                     │
│                                                    │
│  4. SAFETY VALIDATION                             │
│     ├─ No unauthorized legal advice language?      │
│     ├─ No absolute guarantees/promises?            │
│     └─ Content moderation score acceptable?        │
│                                                    │
│  ALL PASS → Return to user                         │
│  ANY FAIL  → Retry (max 2) or flag for review      │
└───────────────────────────────────────────────────┘
```

### 5.2 Automated Checks

| Check | Method | Threshold / Rule |
|-------|--------|-----------------|
| **JSON Validity** | `JSON.parse()` + AJV schema validation | Must pass; retry on failure |
| **Disclaimer Presence** | Regex + semantic check | Must contain `LEGAL_DISCLAIMER` marker or equivalent text |
| **Jurisdiction Match** | Extract jurisdiction refs → compare with input | ≥ 1 jurisdiction referenced must match user input |
| **Clause Completeness** | Keyword + NER-based clause detection | TOS must have: liability, termination, governing law, IP. Privacy must have: data collection, user rights, third-party sharing |
| **Regulation Accuracy** | Regulation name DB lookup | No hallucinated regulation names (cross-ref against known list) |
| **Output Length** | Token count | Must be within ±40% of expected range |
| **Flesch-Kincaid Score** | `text-readability` or similar | Grade level 10–14 for legal docs (acceptable range) |
| **Content Moderation** | OpenAI Moderation API | All categories < 0.1 threshold |

### 5.3 Confidence Scoring

Each output receives a confidence score (0.0–1.0):

```
confidence = (
  schema_validity    * 0.20 +
  clause_completeness * 0.30 +
  jurisdiction_match  * 0.25 +
  regulation_accuracy * 0.15 +
  quality_score       * 0.10
)
```

| Confidence Range | Action |
|-----------------|--------|
| `≥ 0.90` | Auto-approve; deliver to user |
| `0.70 – 0.89` | Deliver with "low confidence" warning badge |
| `0.50 – 0.69` | Flag for human review queue |
| `< 0.50` | Reject; regenerate with fallback model or escalate |

---

## 6. Token Management

### 6.1 Context Window Strategy

| Model | Context Window | Reserved Output | Available Input Budget |
|-------|---------------|-----------------|----------------------|
| `gpt-4o` | 128,000 tokens | 16,384 (max output) | ~110,000 tokens |
| `gpt-4o-mini` | 128,000 tokens | 16,384 (max output) | ~110,000 tokens |

### 6.2 Chunking Long Documents (for Review)

When reviewing user-uploaded documents that exceed the context window:

```
FULL DOCUMENT → Split into SECTIONS → Process independently → Merge results
                     │
                     ▼
           SECTION 1 (0–100K tokens)  → REVIEW → Result 1
           SECTION 2 (100K–200K)     → REVIEW → Result 2
           SECTION N (N*100K–end)    → REVIEW → Result N
                     │
                     ▼
              MERGE ENGINE:
              • Deduplicate findings
              • Cross-reference issues across sections
              • Generate unified risk score
```

**Section Split Rules:**
- Split on major heading boundaries (H1 → article/section)
- Maximum section size: 100,000 tokens
- 1,000 token overlap between sections for context continuity

### 6.3 Streaming Response Architecture

```
LLM → SSE Token Stream → Incremental Buffer → Partial Validation → Client UI

Stream events:
  • token:        { text: "clause", index: 0 }
  • metadata:     { confidence: 0.95, stage: "GENERATING" }
  • section:      { title: "Limitation of Liability", status: "COMPLETE" }
  • validation:   { check: "disclaimer", status: "PASS" }
  • done:         { fullDocument, confidence, metadata }
  • error:        { code, message, retryable }
```

---

## 7. Caching Strategy

### 7.1 Cache Architecture

```
┌───────────────────────────────────────────────────┐
│                  CACHE LAYERS                     │
│                                                    │
│  L1: In-Memory (LRU Cache)                        │
│      • Size: 1,000 entries                        │
│      • TTL: 15 minutes                            │
│      • Key: hash(system_prompt + user_input)      │
│      • For: Identical repeated queries            │
│                                                    │
│  L2: Redis (Distributed)                          │
│      • Size: 100,000 entries                      │
│      • TTL: 24 hours                              │
│      • Key: hash(business_profile + operation)    │
│      • For: Similar business profiles             │
│                                                    │
│  L3: Template Cache (PostgreSQL)                  │
│      • TTL: Permanent (versioned)                 │
│      • Key: (document_type, jurisdiction, version)│
│      • For: Curated, reviewed legal templates     │
└───────────────────────────────────────────────────┘
```

### 7.2 Cache Strategies by Use Case

| Use Case | Strategy | Cache Key Components |
|----------|----------|---------------------|
| **Onboarding** | Similar-profile caching | `hash(businessType + jurisdiction + dataPractices)` |
| **Compliance Mapping** | Semantic similarity caching | Embedding similarity > 0.95 → reuse |
| **Document Generation** | Template + differential generation | Base template cached; only variant clauses generated |
| **Document Review** | Never cached (always fresh) | N/A — user documents are unique and sensitive |
| **General Chat** | Short TTL semantic cache | `hash(conversation_history[-3:] + query)` |

### 7.3 Template Caching

```
Versioned template store:

legal_templates/
├── terms_of_service/
│   ├── v2.3/
│   │   ├── US-DE.json        ← Canned (cached permanently)
│   │   ├── US-CA.json
│   │   ├── UK.json
│   │   └── EU-GDPR.json
│   ├── v2.4/                  ← New version (in review)
│   └── latest → v2.3/        ← Symlink
├── privacy_policy/
├── cookie_policy/
├── operating_agreement/
└── disclaimer_bank.json       ← Shared disclaimer variants
```

**Cache Invalidation Rules:**
- Regulation change in jurisdiction → Invalidate all templates for that jurisdiction
- New template version approved → Update `latest` pointer, invalidate L1/L2 cache
- Manual invalidation via admin dashboard

---

## 8. Safety & Guardrails

### 8.1 Content Filtering and Disclaimers

**Mandatory Disclaimer Injection (EVERY response):**

```
DISCLAIMER: LegalEase AI is an automated document generation tool, not a law
firm. The documents generated are based on general legal templates and may not
address all specific legal requirements for your jurisdiction or business case.
You should consult with a qualified attorney licensed in your jurisdiction
before using any generated documents. No attorney-client relationship is
created through the use of this service.
```

**Prohibited Content Categories (enforced via moderation):**
- Statements that the AI is a lawyer or provides "legal advice"
- Absolute guarantees about legal outcomes or compliance
- Encouragement to ignore jurisdiction-specific legal counsel
- Speculation about legal outcomes of specific cases
- Drafting of documents requiring court filing without explicit warnings

### 8.2 Hallucination Prevention Techniques

| Technique | Implementation |
|-----------|---------------|
| **Regulation Whitelist** | Only reference regulations from a curated, versioned database; reject any generated text that references unknown regulations |
| **Citation Verification** | Use regex to extract legal citations → verify against known citation format patterns → flag anomalies |
| **Grounding via RAG** | All regulatory claims must be traceable to a retrieved RAG chunk; include source attribution in output |
| **Double-Generation** | For critical documents, generate with two independent prompts → compare outputs → flag inconsistencies |
| **Confidence Thresholds** | Reject outputs where model confidence (logprobs) falls below configured thresholds |
| **Contradiction Detection** | Use NLI (Natural Language Inference) model to detect contradictions between generated text and source RAG context |
| **Temperature Discipline** | Use temperature → 0 for any task involving specific legal facts or regulation references |

### 8.3 Rate Limiting

```
┌─────────────────────────────────────────────────┐
│              RATE LIMITING TIERS                 │
│                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │  TIER    │ REQUESTS │  WINDOW  │  ACTION  │  │
│  │          │ PER MIN  │          │          │  │
│  ├──────────┼──────────┼──────────┼──────────┤  │
│  │ Free     │    3     │  1 min   │ Reject   │  │
│  │ Pro      │   15     │  1 min   │ Queue    │  │
│  │ Business │   60     │  1 min   │ Queue    │  │
│  │ Enterprise│  Custom  │ Custom   │ Config.  │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
│                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │  TIER    │  DOCS    │  DAILY   │  ACTION  │  │
│  │          │ PER DAY  │ RESET   │          │  │
│  ├──────────┼──────────┼──────────┼──────────┤  │
│  │ Free     │    5     │ Midnight │ Reject   │  │
│  │ Pro      │   30     │ Midnight │ Warn     │  │
│  │ Business │  150     │ Midnight │ Warn     │  │
│  │ Enterprise│  Custom  │ Config.  │ Config.  │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

**Rate limit response:**
```json
{
  "error": "RATE_LIMITED",
  "retryAfter": 12,
  "limit": 3,
  "window": "60s",
  "currentUsage": 3,
  "message": "You have exceeded the free tier limit of 3 requests per minute. Please upgrade to Pro for higher limits."
}
```

### 8.4 Input Sanitization

Before any prompt reaches the LLM:
- **PII Stripping:** Regex-based detection and masking of SSN, credit card numbers, phone numbers, email addresses (unless required for document generation)
- **Injection Prevention:** Strip markdown code fences, system prompt override attempts (`system:`, `<|im_start|>`, role-switching patterns)
- **Length Limits:** Truncate user input to 50,000 characters (≈12,500 tokens)
- **Language Detection:** Route non-English queries to translation layer or reject with guidance

### 8.5 Audit Logging

Every LLM call is logged (immutable storage, 90-day retention):

| Field | Purpose |
|-------|---------|
| `request_id` | Unique identifier for tracing |
| `user_id` / `session_id` | Attribution |
| `prompt_hash` | Deduplication + cache key |
| `model` + `params` | Reproducibility |
| `input_tokens` + `output_tokens` | Cost tracking |
| `latency_ms` | Performance monitoring |
| `validation_result` | Quality tracking |
| `confidence_score` | Quality tracking |
| `rag_sources[]` | Audit trail for generated content |

---

## Appendix A: Model Fallback Strategy

```
Primary (gpt-4o) fails?
  ├─ Timeout > 30s → Retry with exponential backoff (1s, 2s, 4s)
  ├─ Rate limited   → Queue + wait, or failover to gpt-4o-mini
  ├─ Content filter → Flag for review, do not auto-failover
  └─ 3 consecutive failures → Circuit breaker open for 5 min → escalate to on-call
```

## Appendix B: Cost Optimization

| Strategy | Savings |
|----------|---------|
| Semantic caching for similar profiles | 15–25% reduction in LLM calls |
| Template-based generation (only generate variant clauses) | 30–40% reduction in output tokens |
| gpt-4o-mini for classification/routing (pre-inference) | 40–50% reduction in primary model usage |
| Batch embedding generation | 50% reduction in embedding API costs |
| Prompt compression (summarize conversation history) | 20–30% reduction in input tokens |

## Appendix C: Monitoring & Observability

Key metrics tracked in production:
- **Latency:** p50, p95, p99 per use case
- **Token usage:** Per user, per session, per use case
- **Cache hit rate:** L1, L2, L3
- **Validation pass rate:** First-pass vs. retry
- **Confidence distribution:** Histogram of scores per use case
- **RAG relevance:** Average reranker score of retrieved chunks
- **Error rate:** By error type (validation, rate limit, model error, timeout)
- **Cost per document:** Blended cost (models + embeddings + infrastructure)