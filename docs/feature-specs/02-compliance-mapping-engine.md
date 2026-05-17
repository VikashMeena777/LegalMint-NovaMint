# Feature Specification: Compliance Mapping Engine

**Feature ID:** FEAT-002
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-05-13

---

## 1. Feature Overview and Purpose

The Compliance Mapping Engine is the algorithmic core of LegalEase AI. It takes the structured `BusinessProfile` produced during onboarding and maps it against a comprehensive database of legal requirements across jurisdictions, producing a personalized "Compliance Roadmap." The engine determines which regulations apply, prioritizes compliance actions, and surfaces the most urgent obligations first.

### Key Objectives
- Automatically determine all applicable regulations based on business profile + jurisdiction data
- Score and prioritize requirements by risk, urgency, and business impact
- Generate an interactive, actionable compliance roadmap
- Re-evaluate obligations automatically when the business profile changes
- Handle multi-jurisdiction scenarios including conflicting requirements

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLIANCE MAPPING ENGINE                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌─────────────────────────┐
│  BusinessProfile │       │  TRIGGER EVENTS          │
│  (from onboarding│       │  - Onboard complete      │
│   or profile     │       │  - Profile updated       │
│   editor)        │       │  - Regulation changed    │
└────────┬─────────┘       │  - Scheduled re-check    │
         │                 └──────────┬───────────────┘
         │                            │
         ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                                   │
│  Receives trigger → validates input → coordinates sub-engines     │
└──────────────────────────────────────────────────────────────────┘
         │
         ├────────────────────┬────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  JURISDICTION    │  │  REQUIREMENT     │  │  PRIORITY        │
│  MATCHER         │  │  EXTRACTOR       │  │  SCORER          │
│                  │  │                  │  │                  │
│  Matches profile │  │  Fetches all     │  │  Scores each     │
│  jurisdictions   │  │  requirements    │  │  requirement     │
│  → applicable    │  │  for matched     │  │  by risk,        │
│    regulations   │  │  regulations     │  │  urgency, impact │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     ROADMAP BUILDER                                │
│  Groups requirements → adds recommendations → applies templates   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Compliance      │
                    │  Roadmap (JSON)  │
                    └──────────────────┘
```

### Component Responsibilities

| Component | Input | Output | Description |
|-----------|-------|--------|-------------|
| **Orchestrator** | `BusinessProfile`, trigger type | Coordinates pipeline | Validates input, decides full vs. incremental re-evaluation |
| **Jurisdiction Matcher** | Business locations, target markets, data regions | `Regulation[]` | Maps jurisdictions to their regulation sets via the Jurisdiction DB |
| **Requirement Extractor** | `Regulation[]`, business model, data handling | `Requirement[]` | Extracts every individual requirement from each applicable regulation, filtered by business relevance |
| **Priority Scorer** | `Requirement[]`, business size, funding stage | Scored `Requirement[]` | Assigns priority scores to every requirement |
| **Roadmap Builder** | Scored `Requirement[]`, user preferences | `ComplianceRoadmap` | Groups, sorts, formats the final output |

---

## 3. Jurisdiction Database Schema Overview

The Jurisdiction Database is a structured knowledge base containing regulations, their requirements, and their applicability rules.

```
┌──────────────────────┐       ┌───────────────────────────────────┐
│  JURISDICTIONS       │       │  REGULATIONS                      │
├──────────────────────┤       ├───────────────────────────────────┤
│  id: UUID            │◄──────│  id: UUID                         │
│  name: String         │       │  jurisdiction_id: FK             │
│  iso_code: String     │       │  name: String                    │
│  region: Enum         │       │  short_name: String              │
│  data_protection_law  │       │  type: Enum (privacy/security/   │
│                       │       │    financial/consumer/ai/other)  │
│                       │       │  status: Enum (active/draft/     │
│                       │       │    upcoming/deprecated)          │
│                       │       │  effective_date: Date            │
│                       │       │  last_amended: Date              │
│                       │       │  enforcement_body: String        │
│                       │       │  max_penalty_desc: String        │
│                       │       │  official_url: URL               │
│                       │       │                                  │
│                       │       │  CHILD: REQUIREMENTS             │
└──────────────────────┘       └───────────────────────────────────┘
```

```
┌──────────────────────────────────────────────┐
│  REQUIREMENTS                                │
├──────────────────────────────────────────────┤
│  id: UUID                                   │
│  regulation_id: FK                          │
│  article_ref: String (e.g., "Art. 5(1)(a)") │
│  category: Enum                             │
│  title: String                              │
│  description: Text                          │
│  obligation_type: Enum (must/should/may)    │
│  applicability_rules: JSONB                 │
│  required_documents: String[]               │
│  deadline_days_from_trigger: Int?           │
│  parent_requirement_id: FK?                 │
│  priority_base_score: Float (0-100)         │
│  recommended_actions: JSONB                 │
│  tags: String[]                             │
│  version: Int                               │
└──────────────────────────────────────────────┘
```

### Applicability Rules Format (`JSONB`)
```json
{
  "operator": "AND",
  "conditions": [
    { "field": "businessProfile.dataHandling.collectsPersonalData", "op": "equals", "value": true },
    { "field": "businessProfile.jurisdictions.targets", "op": "contains", "value": "EU" },
    { "field": "businessProfile.businessModel.revenueModel", "op": "in", "value": ["Subscription", "Freemium"] }
  ]
}
```

Supported operators: `equals`, `not_equals`, `in`, `not_in`, `contains`, `contains_any`, `greater_than`, `less_than`, `defined`, `undefined`, `AND`, `OR`, `NOT`.

### Categories
- `PRIVACY` — Data protection regulations (GDPR, CCPA, etc.)
- `SECURITY` — Information security mandates (SOC 2, ISO 27001)
- `FINANCIAL` — Financial regulations (PCI DSS, SOX, AML)
- `CONSUMER` — Consumer protection (cooling-off periods, refunds)
- `CONTENT` — Content moderation, copyright (DMCA, DSA)
- `EMPLOYMENT` — Employment law requirements
- `AI` — AI/ML regulations (EU AI Act, NYC Law 144)
- `ACCESSIBILITY` — WCAG, ADA, EAA
- `COOKIES` — Cookie and tracking regulations (ePrivacy, CNIL)
- `TAX` — Sales tax, VAT, digital services tax

---

## 4. Compliance Matching Algorithm

```
FUNCTION generateComplianceRoadmap(businessProfile):
    roadmap = { requirements: [], summary: {}, warnings: [], lastUpdated: now() }

    // Phase 1: Match Jurisdictions
    applicableRegulations = []
    FOR EACH jurisdiction IN businessProfile.jurisdictions:
        regionRegulations = JurisdictionDB.getRegulationsForJurisdiction(jurisdiction)
        APPLY jurisdictionRegulationOverrides(regionRegulations, jurisdiction)
        applicableRegulations.merge(regionRegulations)

    applicableRegulations = deduplicateRegulations(applicableRegulations)

    // Phase 2: Extract Requirements
    FOR EACH regulation IN applicableRegulations:
        requirements = JurisdictionDB.getRequirements(regulation.id)
        FOR EACH requirement IN requirements:
            IF evaluateApplicabilityRules(requirement.applicability_rules, businessProfile):
                weightedRequirement = requirement.copy()
                weightedRequirement.priorityScore = calculatePriorityScore(
                    requirement,
                    businessProfile,
                    regulation
                )
                // Add business-context metadata
                weightedRequirement.matchedJurisdictions = [jurisdiction]
                weightedRequirement.matchedRegulation = regulation.short_name
                weightedRequirement.triggeredBy = determineTrigger(requirement, businessProfile)
                roadmap.requirements.push(weightedRequirement)

    // Phase 3: Merge overlapping requirements (e.g., GDPR + CCPA data access rights)
    roadmap.requirements = mergeOverlappingRequirements(roadmap.requirements)

    // Phase 4: Sort by priority score descending
    roadmap.requirements.sort(by: priorityScore, direction: DESC)

    // Phase 5: Generate warnings for conflicting/incompatible requirements
    roadmap.warnings = detectConflicts(roadmap.requirements)

    // Phase 6: Build summary
    roadmap.summary = {
        totalRequirements: roadmap.requirements.length,
        criticalCount: countWhere(roadmap.requirements, score >= 80),
        highCount: countWhere(roadmap.requirements, score >= 60 AND score < 80),
        mediumCount: countWhere(roadmap.requirements, score >= 40 AND score < 60),
        lowCount: countWhere(roadmap.requirements, score < 40),
        activeRegulations: uniqueRegulationNames(roadmap.requirements),
        jurisdictionsCovered: businessProfile.jurisdictions,
        dataProfileSummary: summarizeDataHandling(businessProfile),
        recommendedFirstActions: roadmap.requirements[0..2]
    }

    RETURN roadmap
```

### Key Sub-Functions

```python
def calculatePriorityScore(requirement, businessProfile, regulation):
    base = requirement.priority_base_score  # 0-100, set by legal experts

    # Jurisdiction risk multipliers
    jurisdiction_multiplier = 1.0
    if regulation.enforcement_body_is_active:
        jurisdiction_multiplier *= 1.2
    if regulation.max_penalty_is_significant:  # > $1M or 2% revenue
        jurisdiction_multiplier *= 1.15

    # Business size sensitivity
    size_multiplier = 1.0
    if businessProfile.employeeCount > 200:
        size_multiplier = 1.1  # Larger companies face more scrutiny

    # Data sensitivity
    sensitivity_multiplier = 1.0
    if businessProfile.collectsSensitiveData:
        sensitivity_multiplier = 1.3

    # Deadline proximity
    deadline_urgency = 1.0
    if requirement.hasDeadline():
        days_until_deadline = requirement.deadlineDate - today()
        if days_until_deadline <= 30:
            deadline_urgency = 1.5
        elif days_until_deadline <= 90:
            deadline_urgency = 1.2

    # Requirement type weighting
    type_weight = {"must": 1.0, "should": 0.7, "may": 0.4}

    score = base * jurisdiction_multiplier * size_multiplier * \
            sensitivity_multiplier * deadline_urgency * \
            type_weight[requirement.obligation_type]
    return min(score, 100)  # Cap at 100


def evaluateApplicabilityRules(rules, businessProfile):
    if rules is None:
        return True  # No rules means universally applicable

    operator = rules["operator"]
    conditions = rules["conditions"]

    results = []
    for condition in conditions:
        if condition.get("operator") in ["AND", "OR", "NOT"]:
            results.append(evaluateApplicabilityRules(condition, businessProfile))
        else:
            value = getNestedField(businessProfile, condition["field"])
            op = condition["op"]
            expected = condition["value"]
            results.append(applyOperator(value, op, expected))

    return combineResults(results, operator)
```

---

## 5. Priority Scoring for Requirements

### Priority Tiers

| Tier | Score Range | Label | Color | Description |
|------|-------------|-------|-------|-------------|
| Critical | 80-100 | Must Address Immediately | Red | Legal exposure, active deadlines, high penalties |
| High | 60-79 | Address This Quarter | Orange | Important obligations, moderate deadlines |
| Medium | 40-59 | Address This Year | Yellow | Recommended best practices |
| Low | 0-39 | Consider / Monitor | Green | Nice-to-have, may become required later |

### Scoring Factors (Weighted)

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Base expert score | 100% | Manually assigned by legal domain experts |
| Active enforcement | +20% | Regulator actively prosecuting violations |
| Maximum penalty | +15% | Fines > $1M or > 2% annual revenue |
| Sensitive data | +30% | Health, biometric, children's data |
| Deadline proximity (<30 days) | +50% | Immediate action required |
| Deadline proximity (<90 days) | +20% | Action required soon |
| Large business | +10% | Higher scrutiny for enterprises |
| Pre-launch business | -10% | Some requirements deferred |

---

## 6. Compliance Roadmap Output Format

```json
{
  "id": "rdmp_abc123",
  "businessProfileId": "bp_xyz789",
  "generatedAt": "2026-05-13T10:00:00Z",
  "version": 1,
  "status": "active",

  "summary": {
    "totalRequirements": 47,
    "byPriority": { "critical": 3, "high": 12, "medium": 22, "low": 10 },
    "activeRegulations": ["GDPR", "CCPA/CPRA", "PCI DSS", "DSA"],
    "jurisdictionsCovered": ["US", "EU/EEA", "UK"],
    "dataProfileSummary": "Collects personal data including email, name, IP. Uses analytics and advertising cookies. Stores EU user data in AWS us-east-1.",
    "recommendedFirstActions": [
      { "reqId": "req_001", "title": "Appoint EU Representative (GDPR Art. 27)" },
      { "reqId": "req_012", "title": "Implement Cookie Consent Banner" }
    ]
  },

  "requirements": [
    {
      "id": "req_042",
      "regulation": "GDPR",
      "articleRef": "Art. 13",
      "category": "PRIVACY",
      "title": "Provide Data Subject Information at Collection",
      "description": "When personal data is collected, the controller must provide specific information about processing purposes, legal basis, data retention, and data subject rights.",
      "obligationType": "must",
      "priorityScore": 87,
      "priorityTier": "critical",
      "requiredDocuments": ["Privacy Policy"],
      "deadline": null,
      "recommendedActions": [
        "Draft or update Privacy Policy to include GDPR Art. 13 disclosures",
        "Ensure privacy notice is presented at point of data collection",
        "Include information about international data transfers"
      ],
      "userProgress": {
        "completed": false,
        "notes": null,
        "reminderSet": false,
        "completedAt": null
      },
      "matchedJurisdictions": ["EU/EEA"],
      "relatedRequirements": ["req_043", "req_044"]
    }
  ],

  "conflicts": [
    {
      "type": "incompatible",
      "severity": "high",
      "description": "GDPR requires explicit consent for cookies; CCPA allows opt-out model. Recommend implementing strictest standard (GDPR consent) across jurisdictions.",
      "affectedRequirements": ["req_018", "req_051"],
      "recommendedResolution": "Implement GDPR-compliant consent mechanism globally (superset approach)"
    }
  ],

  "estimatedEffort": {
    "critical": { "hours": 20, "weeks": 3 },
    "high": { "hours": 60, "weeks": 6 },
    "medium": { "hours": 80, "weeks": 8 },
    "low": { "hours": 40, "weeks": 4 }
  }
}
```

---

## 7. Interactive Features

### Mark as Complete
- Each requirement has a checkbox: `[ ] Mark as complete`
- Completing a requirement updates `userProgress.completed = true` and `completedAt` timestamp
- Visual: row gets strikethrough styling and moved to a "Completed" section
- Undo: user can uncheck to revert

### Add Notes
- Each requirement row has a "Notes" icon button
- Click opens an inline text area (max 1000 chars)
- Notes are persisted per requirement per user: `userProgress.notes`
- Display: note indicator icon shown on rows that have notes

### Set Reminders
- Each requirement row has a "Remind Me" button
- Click opens a date picker (default: 1 week from today)
- User selects date → reminder scheduled
- Reminders appear in the Compliance Health Monitor dash

### Bulk Actions
- Filter by priority tier, regulation, or category
- "Mark All as Completed" for filtered view (with confirmation dialog)
- Export filtered view as CSV/PDF

---

## 8. Automated Re-Checking

### Triggers
1. **Profile Updated:** User edits any field in their `BusinessProfile` via the Profile Editor
2. **Regulation Changed:** Jurisdiction DB receives an update (new regulation, amendment, repeal)
3. **Scheduled Re-Check:** Nightly cron runs a diff for profiles that haven't been checked in 30+ days

### Behavior
- The orchestrator performs an **incremental diff**:
  - Newly applicable requirements → added to roadmap with `isNew: true` flag
  - No-longer-applicable requirements → moved to an "Archived" section, not deleted
  - Changed requirements (e.g., article amendment) → marked with `hasUpdate: true`, showing a diff badge
- User receives a notification: "Your compliance roadmap has been updated. 3 new requirements and 1 change detected."
- The Health Monitor widget reflects the updated state

### Profile Field Dependency Graph
The system maintains a mapping of which profile fields affect which regulation requirements. When a field changes, only the affected regulations are re-evaluated (not the entire roadmap), improving performance.

```
profileField -> affectedRegulationIds
businessProfile.dataHandling.collectsPersonalData -> [GDPR, CCPA, PIPEDA, LGPD]
businessProfile.jurisdictions.targets -> [ALL_REGULATIONS]  // broad impact
businessProfile.techStack.usesAI -> [EU_AI_ACT, NYC_LAW_144]
```

---

## 9. Edge Cases

### Multi-Jurisdiction Conflicts
- **Detection:** During `detectConflicts()`, the engine compares requirements across regulations for the same topic (e.g., cookie consent)
- **Conflict categories:**
  - **Incompatible:** GDPR says consent must be opt-in, CCPA says opt-out is okay
  - **Overlapping:** Same disclosure requirement in GDPR Art. 13 and CCPA § 1798.100
  - **Superset:** One regulation fully covers another (GDPR consent > ePrivacy consent)
- **Resolution strategy:** Always recommend the strictest standard ("superset approach") to minimize compliance work

### Business Operates in Multiple Jurisdictions
- Requirements are deduplicated when identical across regulations
- When conflicting, both are shown with a conflict warning
- The UI groups requirements by regulation AND by topic for easier navigation

### New Regulation Introduced
- Nightly job checks Jurisdiction DB for regulation changes
- Affected business profiles are flagged for incremental re-evaluation
- Users see a "Regulation Update" alert in the Health Monitor

### Profile Has Insufficient Data
- If critical fields are `null` (skipped during onboarding), the engine:
  - Flags those fields in `roadmap.warnings`
  - Makes conservative assumptions (assume worst case for compliance)
  - Prompts user: "Complete your profile for a more accurate roadmap"

---

## 10. UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| **Generating** | Roadmap being computed for the first time | Full-page loading state with progress indicator: "Analyzing your business profile...", "Matching regulations...", "Scoring requirements..." |
| **Ready** | Roadmap fully generated | Dashboard layout: summary header cards, filterable requirement list, sidebar with regulation breakdown |
| **Empty** | No requirements apply (rare: e.g., offline business with no data collection in unregulated jurisdiction) | Friendly empty state: "Your business profile doesn't trigger any tracked regulations. We'll monitor for changes." |
| **Re-evaluating** | Profile changed, incremental update in progress | Non-blocking banner: "Updating your roadmap..." with a spinner; existing roadmap remains visible but stale |
| **Updated** | Incremental re-check complete | Banner: "3 changes detected since your last visit. [Review Changes]" |
| **Error** | Backend failure during generation | Error card with retry button; last successful roadmap remains visible if available |
| **Partial Data** | Some profile fields missing | Warning banner: "Your profile is 70% complete. Some requirements may be based on worst-case assumptions." with "Complete Profile" CTA |
| **Filtered** | User applied a filter | Filter chips shown above list; "Showing 12 of 47 requirements" counter |
| **All Completed** | Every requirement marked done | Celebration/confetti state: "You're fully compliant! We'll keep monitoring for changes." |

---

## 11. Acceptance Criteria

| AC# | Criteria | Priority |
|-----|----------|----------|
| AC-001 | Engine correctly maps a complete BusinessProfile to all applicable regulations within 5 seconds | P0 |
| AC-002 | Applicability rules engine supports AND, OR, NOT operators with nested conditions | P0 |
| AC-003 | Priority scores are computed using all defined factors (base, jurisdiction multipliers, sensitivity, deadlines) | P0 |
| AC-004 | Overlapping requirements across regulations are deduplicated and merged | P0 |
| AC-005 | Conflicting requirements are detected and surfaced with a recommended resolution | P0 |
| AC-006 | User can mark requirements as complete, add notes, and set reminders | P0 |
| AC-007 | Editing the business profile triggers an incremental re-evaluation of affected requirements only | P0 |
| AC-008 | Nightly job detects regulation changes and flags affected profiles | P1 |
| AC-009 | Newly applicable requirements are flagged as `isNew` in the roadmap | P1 |
| AC-010 | No-longer-applicable requirements are archived, not deleted | P1 |
| AC-011 | Requirements with amendments show a diff badge and highlight changed content | P1 |
| AC-012 | Filtering by priority, regulation, and category works correctly | P1 |
| AC-013 | Bulk "Mark Complete" works with confirmation dialog | P2 |
| AC-014 | Roadmap export (filtered view) works in CSV and PDF formats | P2 |
| AC-015 | Roadmap generation handles missing profile fields gracefully with conservative defaults | P0 |
| AC-016 | Profile field dependency graph ensures only affected regulations are re-evaluated | P1 |
| AC-017 | Users are notified when their roadmap changes due to regulation updates | P1 |
| AC-018 | Estimated effort hours are computed and displayed per priority tier | P2 |