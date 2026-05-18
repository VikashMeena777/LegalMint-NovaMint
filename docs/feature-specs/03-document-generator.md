# Feature Specification: Automated Document Generator

**Feature ID:** FEAT-003
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-05-13

---

## 1. Feature Overview and Purpose

The Automated Document Generator transforms the structured business profile data into complete, legally-sound policy documents and agreements. Rather than offering generic templates, LegalMint AI uses a hybrid approach: structured templates with variable injection for standard clauses, combined with AI-assisted drafting for jurisdiction-specific and business-specific customizations.

### Key Objectives
- Generate jurisdiction-compliant legal documents with minimal user input
- Map business profile fields to the correct document variables automatically
- Support AI-powered drafting for custom and jurisdiction-specific clauses
- Allow user review and editing with a rich document editor
- Maintain document version history with diff views and rollback capability
- Enforce quality guardrails (mandatory sections, disclaimers, jurisdiction clause validation)

---

## 2. Document Template System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOCUMENT TEMPLATE SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  TEMPLATE       │
│  REPOSITORY     │      ┌──────────────────────────────────────┐
│                 │      │  TEMPLATE STRUCTURE                  │
│  - ToS          │      │                                      │
│  - Privacy      │      │  template_metadata:                  │
│  - Cookie       │      │    name, version, category,          │
│  - Op Agreement │      │    jurisdictions_compatible[]        │
│  - DPA          │      │                                      │
│  - Refund       │      │  sections[]:                         │
│  - Disclaimer   │      │    - id, title, ordering             │
│  - ...          │      │    - content_template (Markdown)     │
│                 │      │    - variables[]                     │
│                 │      │    - condition (when to include)     │
│                 │      │    - mandatory: boolean              │
│                 │      │    - jurisdiction_overrides[]        │
│                 │      │    - ai_drafting_hints               │
│                 │      │    - fallback_text                   │
│                 │      │                                      │
│                 │      │  variable_definitions[]:             │
│                 │      │    - name, type, source_field        │
│                 │      │    - default_value                   │
│                 │      │    - required: boolean               │
│                 │      │                                      │
│                 │      │  customization_points[]:             │
│                 │      │    - id, description, type           │
│                 │      │    - allowed_edits[]                 │
│                 │      │                                      │
│                 │      │  mandatory_clauses[]:                │
│                 │      │    - clause_id, text                 │
│                 │      │    - regulations_requiring[]         │
│                 │      │    - removal_allowed: boolean         │
│                 │      └──────────────────────────────────────┘
└─────────────────┘
```

### Template Storage
All templates are stored as versioned JSON documents in the database. Each template version is immutable; editing a template creates a new version. Generated documents reference the specific template version used.

---

## 3. Template Variable System

### Variable Definition Schema
```json
{
  "name": "company_name",
  "type": "string",
  "sourceField": "businessProfile.companyBasics.legalName",
  "fallbackField": null,
  "defaultValue": "[Company Name]",
  "required": true,
  "validation": { "minLength": 2, "maxLength": 200 },
  "formatting": "default",
  "description": "The legal name of the company",
  "aiHint": "Use the full legal entity name including entity type (Inc., LLC, etc.)"
}
```

### Supported Variable Types
- **Direct Mapping:** One-to-one mapping from `BusinessProfile` field to template variable
- **Computed:** Derived from one or more profile fields (e.g., `effectiveDate` = `today + 7 days`)
- **Conditional:** Resolved based on business profile conditions (e.g., `eu_representative` only if `targets EU`)
- **AI-Generated:** Placeholder filled by the AI drafting pipeline (e.g., `service_description`)
- **User-Provided:** Variable that must be filled by the user before generation (e.g., specific contact email)

### Mapping Table: Business Profile → Template Variables

| BusinessProfile Field | ToS | Privacy Policy | Cookie Policy | Operating Agreement |
|-----------------------|-----|----------------|---------------|---------------------|
| `companyBasics.legalName` | company_name | company_name | company_name | company_name |
| `companyBasics.website` | website_url | website_url | website_url | — |
| `companyBasics.industry` | industry_description | industry_description | — | — |
| `companyBasics.employeeCount` | — | — | — | company_size |
| `companyBasics.headquarters` | governing_law_jurisdiction | company_location | company_location | registered_jurisdiction |
| `businessModel.type` | service_description | — | — | business_purpose |
| `businessModel.revenueModel` | payment_terms | — | — | — |
| `businessModel.targetAudience` | age_restrictions | — | — | — |
| `dataHandling.collectsPersonalData` | data_collection_disclosure | data_collection_section | — | — |
| `dataHandling.personalDataTypes` | — | data_types_list | cookie_categories | — |
| `dataHandling.thirdPartySharing` | third_party_disclosure | third_party_section | third_party_cookies | — |
| `dataHandling.dataPurposes` | — | processing_purposes | cookie_purposes | — |
| `userInteractions.hasAccounts` | account_terms | — | — | — |
| `userInteractions.authenticationMethods` | — | — | — | — |
| `userInteractions.hasPayments` | payment_terms | — | — | — |
| `userInteractions.usesCookies` | cookie_reference | cookie_reference | entire_document | — |
| `userInteractions.newsletters` | — | marketing_section | marketing_cookies | — |
| `userInteractions.ageRestricted` | age_clause | — | — | — |
| `userInteractions.userGeneratedContent` | ugc_license_grant | — | — | — |
| `techStack.analytics` | — | analytics_section | analytics_cookies | — |
| `techStack.thirdPartyApis` | third_party_disclosure | — | — | — |
| `jurisdictions.operatingCountries` | governing_law | data_transfer_section | — | governing_law |
| `jurisdictions.targets` | jurisdiction_clauses | compliance_sections | jurisdiction_clause | — |

---

## 4. Generation Pipeline

```
  ┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ TEMPLATE │───▶│   VARIABLE    │───▶│      AI      │───▶│  VALIDATION  │───▶│    HUMAN     │
  │ SELECTION│    │   INJECTION   │    │   DRAFTING   │    │              │    │    REVIEW    │
  └──────────┘    └───────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │               │                     │                   │                   │
       ▼               ▼                     ▼                   ▼                   ▼
  Match business  Resolve all          Generate custom      Check mandatory      Present in
  profile to      variables from       clauses using AI     sections,            rich editor
  compatible      profile + user       (jurisdiction-       disclaimers,         for user
  template(s)     input                specific)            variable coverage    approval
```

### Step 1: Template Selection
- System identifies all templates compatible with the user's jurisdictions
- Document type is selected by the user (ToS, Privacy Policy, etc.)
- The latest compatible template version is selected by default
- User can optionally select an older version (advanced setting)

### Step 2: Variable Injection
- All direct-mapped and computed variables are resolved from `BusinessProfile`
- Unresolved required variables are presented to the user as a pre-generation form: "We need a few more details before generating your document."
- Variables are injected into the template's Markdown content using `{{ variable_name }}` syntax
- A preview of the populated template (with AI placeholders shown as highlighted blanks) is generated

### Step 3: AI Drafting
- Sections and clauses marked as `ai_drafting_hints` are sent to the LLM with context:
  - The section's `ai_drafting_hints` (instructions for the AI)
  - Relevant `BusinessProfile` context
  - Jurisdiction-specific requirements from the Compliance Mapping Engine
  - Surrounding sections for context and consistency
- AI generates draft text for each AI-drafted section
- Temperature is set low (0.1-0.3) for legal accuracy
- Multiple AI-drafted clauses are generated in parallel where possible

### Step 4: Validation
- **Mandatory Sections Check:** Verify all `mandatory: true` sections are present and non-empty
- **Disclaimer Injection:** Ensure the legal disclaimer is present at the top of the document
- **Jurisdiction Clause Validation:** Cross-reference clauses against jurisdiction requirements
- **Variable Coverage:** Confirm all variables are resolved (no `{{ }}` artifacts remain)
- **Minimum Content:** Verify document is above minimum word count threshold
- **Consistency Check:** Scan for internal contradictions (e.g., "we do not collect data" vs "data types: email")

### Step 5: Human Review
- The generated document is presented in a rich WYSIWYG/Markdown editor
- AI-generated sections are visually highlighted (subtle blue background) for easy identification
- User edits are tracked as a separate layer from the template base
- "Approve & Publish" finalizes the document

---

## 5. Supported Document Types

### 5.1 Terms of Service (ToS)

**Purpose:** Governs the relationship between the business and its users.

| Section | Mandatory | AI-Drafted | Customization Points |
|---------|-----------|------------|---------------------|
| Introduction & Acceptance | Yes | No | — |
| Definitions | Yes | Partial (key terms) | Add/remove defined terms |
| Eligibility & Account Registration | Conditional | No | Age threshold, account requirements |
| Description of Services | Yes | Yes | Service scope, limitations |
| User Responsibilities & Conduct | Yes | Partial | Content guidelines, prohibited activities |
| User-Generated Content License | Conditional | Yes | License scope, DMCA compliance |
| Payment Terms | Conditional | No | Pricing model, refund policy reference |
| Intellectual Property Rights | Yes | Partial | IP ownership details |
| Third-Party Services & Links | Conditional | No | Third-party disclosures |
| Limitation of Liability | Yes | Yes | Liability cap, jurisdiction-specific language |
| Indemnification | Yes | No | — |
| Disclaimer of Warranties | Yes | No | — |
| Termination | Yes | No | — |
| Governing Law & Dispute Resolution | Yes | Yes | Jurisdiction, arbitration clause |
| Changes to Terms | Yes | No | — |
| Contact Information | Yes | No | — |

**Key AI Drafting Hints:**
- "Describe the core service offering concisely in 2-3 paragraphs based on the business model"
- "Draft jurisdiction-specific limitation of liability consistent with [jurisdiction] law"
- "Include mandatory consumer rights language required by [jurisdiction]"

### 5.2 Privacy Policy

**Purpose:** Discloses data collection, processing, and sharing practices.

| Section | Mandatory | AI-Drafted | Customization Points |
|---------|-----------|------------|---------------------|
| Introduction & Scope | Yes | No | — |
| Data Controller Identity | Yes | No | — |
| Types of Data Collected | Yes | Yes | Add/remove specific data types |
| How Data Is Collected | Yes | Partial | Collection methods |
| Purposes of Processing | Yes | Partial | Legal basis per purpose |
| Legal Basis for Processing (GDPR) | Conditional | Yes | Legal basis per data type |
| Data Sharing & Third Parties | Conditional | Yes | Third-party disclosures |
| International Data Transfers | Conditional | Yes | Transfer mechanisms, adequacy |
| Data Retention | Yes | Partial | Retention periods |
| Data Security Measures | Yes | Partial | Security description |
| User Rights (GDPR/CCPA/etc.) | Conditional | Yes | Rights by jurisdiction |
| Children's Privacy | Conditional | Yes | Age threshold, COPPA |
| Cookies & Tracking | Yes | No | Reference to Cookie Policy |
| Marketing Communications | Conditional | No | Opt-out mechanism |
| Changes to This Policy | Yes | No | — |
| Contact & DPO Information | Yes | No | — |
| Jurisdiction-Specific Notices | Conditional | Yes | State/country-specific disclosures |

**Privacy Policy Variable Highlights:**
- `data_types_list`: Auto-generated list from `dataHandling.personalDataTypes`
- `processing_purposes`: Auto-generated from `dataHandling.dataPurposes`
- `third_party_disclosures`: Auto-generated from `dataHandling.thirdParties`
- `jurisdiction_specific_notices`: AI-drafted per jurisdiction (CCPA categories, GDPR lawful bases, etc.)
- `dpo_contact`: User-provided or computed as "[Company Name] Data Protection Officer"

### 5.3 Cookie Policy

**Purpose:** Discloses cookie usage, categories, and consent mechanisms.

| Section | Mandatory | AI-Drafted | Customization Points |
|---------|-----------|------------|---------------------|
| Introduction & What Are Cookies | Yes | No | — |
| How We Use Cookies | Yes | Partial | Purpose descriptions |
| Types of Cookies We Use | Yes | Yes | Cookie categorization |
| Cookie Duration | Yes | No | — |
| Third-Party Cookies | Conditional | Yes | Third-party cookie list |
| Cookie Consent & Control | Yes | Yes | Consent mechanism description |
| How to Manage Cookies | Yes | No | Browser instructions |
| Changes to This Policy | Yes | No | — |
| Contact | Yes | No | — |
| Cookie Declaration Table | Conditional | Yes | Auto-generated table |

**Cookie Categorization Logic:**
- Based on `techStack.analytics` → `analytics_cookies` section
- Based on `dataHandling.dataPurposes` containing "Marketing" → `marketing_cookies` section
- Based on `userInteractions.newsletters` = true → `functional_cookies` for newsletter signup
- Based on `userInteractions.hasAccounts` = true → `essential_cookies` for session management
- All other → `necessary_cookies` (default category)

### 5.4 Operating Agreement (LLC)

**Purpose:** Internal governance document for LLCs.

| Section | Mandatory | AI-Drafted | Customization Points |
|---------|-----------|------------|---------------------|
| Formation & Name | Yes | No | — |
| Business Purpose | Yes | Yes | Purpose statement |
| Registered Agent & Office | Yes | User-provided | — |
| Members & Ownership | Yes | User-provided | Membership percentages |
| Capital Contributions | Yes | User-provided | Contribution amounts |
| Profit, Loss & Distributions | Yes | Partial | Distribution rules |
| Management Structure | Yes | Yes | Member-managed vs. manager-managed |
| Voting Rights | Yes | Partial | Voting thresholds |
| Meetings | Yes | No | — |
| Transfer of Membership Interests | Yes | Partial | Transfer restrictions |
| Dissolution | Yes | Partial | — |
| Indemnification | Yes | No | — |
| Amendments | Yes | No | — |
| Governing Law | Yes | No | — |

---

## 6. Customization UI

### Document Editor Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  [◀ Back to Docs]        Privacy Policy         [Version History]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│  │   TABLE OF CONTENTS        │  │   DOCUMENT PREVIEW          │  │
│  │                            │  │                            │  │
│  │  ● 1. Introduction         │  │  # Privacy Policy           │  │
│  │  ○ 2. Data Collected       │  │                            │  │
│  │  ○ 3. How We Use Data      │  │  Last updated: May 13, 2026 │  │
│  │  ○ 4. Data Sharing         │  │                            │  │
│  │  ○ 5. International...     │  │  YourCompany, Inc. ("we",   │  │
│  │  ○ 6. Data Retention       │  │  "our", or "us") is         │  │
│  │  ○ 7. Security             │  │  committed to protecting... │  │
│  │  ○ 8. Your Rights          │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │
│  │  ○ 9. Children's Privacy   │  │  ▓▓ AI-generated section ▓   │  │
│  │  ○ 10. Cookies             │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │
│  │  ○ 11. Marketing           │  │                            │  │
│  │  ○ 12. Changes             │  │  [Edit Section]             │  │
│  │                            │  │                            │  │
│  └────────────────────────────┘  └────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  [➕ Add Custom Section]   [📋 Regenerate All]   [✅ Approve] ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Customization Capabilities
| Action | Description | Behavior |
|--------|-------------|----------|
| **Edit Section** | Inline editing of any section | Creates a user-layer override; template updates won't overwrite user edits |
| **Add Custom Section** | Append a new section | User writes title + content; placed at end or specified position |
| **Remove Section** | Remove an optional section | Mandatory sections cannot be removed (button disabled + tooltip) |
| **Regenerate Section** | Re-run AI drafting for a specific section | Clears user overrides for that section; prompts for confirmation |
| **Regenerate All** | Re-run entire AI drafting pipeline | Clears all user overrides; prompts for confirmation |
| **Edit Variables** | Change individual variable values | Opens a slide-out panel: edit source values, regenerate affected sections |
| **Toggle AI Highlighting** | Show/hide blue background on AI sections | Visual preference, doesn't affect document |

---

## 7. Version Management

### Version Model
```
┌─────────────────────────────────────────────────────────────────┐
│  DocumentVersion                                                │
├─────────────────────────────────────────────────────────────────┤
│  id: UUID                                                       │
│  document_id: FK                                                │
│  version_number: Int (auto-increment per document)              │
│  status: Enum (draft / published / archived / deprecated)       │
│  template_version: Int (template version used)                  │
│  content: Markdown (full rendered document)                     │
│  variables_snapshot: JSON (variable values at generation time)  │
│  user_edits: JSONB (diff from template base)                    │
│  created_at: Timestamp                                          │
│  published_at: Timestamp?                                       │
│  published_by: FK (User)                                        │
│  change_summary: String                                         │
│  parent_version_id: FK? (links to previous version for diff)    │
└─────────────────────────────────────────────────────────────────┘
```

### Version History UI
- Chronological list of all versions with date, author, and change summary
- **Diff View:** Side-by-side comparison of any two versions, with additions highlighted in green and removals in red
- **Rollback:** "Restore This Version" button creates a *new* version (copy of the selected old version) — never overwrites

### Change Tracking
- Every "Approve & Publish" creates a new `DocumentVersion`
- The `user_edits` field stores a structured diff (which sections/paragraphs were changed, by whom)
- Document view shows "last updated by [user] on [date]" status

---

## 8. AI Quality Guardrails

### Mandatory Sections Check
- Before allowing publishing, the system verifies all `mandatory: true` sections exist and are non-empty
- Missing or empty mandatory sections block publishing with: "Section '[Name]' is required. Please review."

### Disclaimer Injection
- Every generated document automatically includes a prefixed disclaimer:
  > **DISCLAIMER:** This document was generated by LegalMint AI and is provided for informational purposes only. It does not constitute legal advice. You should review this document with qualified legal counsel before use. LegalMint AI is not a law firm and does not provide legal services.

- The disclaimer is mandatory and cannot be removed (controlled by `removal_allowed: false` in `mandatory_clauses`)

### Jurisdiction Clause Validation
- The system cross-references required jurisdiction-specific clauses from the Compliance Mapping Engine
- If regulation X requires clause Y in a Privacy Policy, the validator checks for clause Y's presence
- Missing jurisdiction clauses trigger a warning: "GDPR Article 13 requires a Data Protection Officer contact. Consider adding this to your Privacy Policy."

### AI Hallucination Prevention
- AI-drafted sections are compared against known legal terminology
- References to non-existent regulations or articles are flagged
- Named entity recognition checks for consistency (company name, jurisdiction, dates)
- Sections containing internal contradictions (e.g., "we collect email" vs "we don't collect personal data") are flagged

---

## 9. Edge Cases

### Regenerating a Document
- When a user requests regeneration (because profile changed, or they want a fresh AI pass), the system:
  1. Creates a new `DocumentVersion` with an incremented version number
  2. Preserves any user-edited sections (marked with `user_edit` lock)
  3. Regenerates AI-drafted sections (non-locked)
  4. Shows a diff between old and new version so user can see what changed

### Custom Clauses
- Users can add custom sections or paragraphs anywhere in the document
- Custom content is stored separately from template-generated content
- When the template updates, custom sections are preserved at their insertion point
- If a template update removes the section the custom clause was inserted after, the custom clause is moved to the nearest valid position with a notification

### Multi-Language Support
- **Generation:** Templates can have locale-specific versions. Variable injection, AI drafting, and validation all operate in the selected language.
- Supported languages: English (default), Spanish, French, German, Portuguese
- AI drafting prompt includes language instruction: "Draft this section in Spanish. Maintain legal accuracy appropriate for [jurisdiction]."
- Validation checks run against language-specific mandatory clause texts
- Non-English disclaimer is provided by a translated `mandatory_clauses` variant

### Business Profile Changes After Document Approval
- If the business profile is updated after a document is published:
  - The Health Monitor flags the document as "potentially out of date"
  - The user sees a banner on the document: "Your business profile has changed. Some sections may need updating. [Review Changes]"
  - Clicking "Review Changes" shows which profile fields changed and which document sections are affected
  - User can selectively regenerate affected sections or regenerate the entire document

### Empty Business Profile on Custom Documents
- If a user generates a document type that requires variables not in their profile:
  - The pre-generation form surfaces all missing required variables
  - User fills them in before generation
  - Those values are NOT automatically added to the BusinessProfile (to avoid polluting the profile with document-specific data)

---

## 10. UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| **Document Type Selection** | User hasn't chosen a document type yet | Grid of document type cards (ToS, Privacy Policy, Cookie Policy, Operating Agreement, etc.) with descriptions and "Generate" buttons |
| **Pre-Generation Form** | Missing required variables before generation can proceed | Form with fields for each missing variable; "Generate" button disabled until all required fields filled |
| **Generating** | Document being produced | Step-wise loading: "Preparing template..." → "Injecting data..." → "Drafting AI sections..." → "Validating..." |
| **Ready for Review** | Document generated, user reviewing | Document editor with AI sections highlighted blue; action bar: Edit, Regenerate, Approve |
| **Editing** | User has unsaved edits in the editor | "Unsaved changes" indicator; auto-save every 30 seconds; "Publish" button active |
| **Version History** | Viewing past versions | Timelined list; click any version to preview; "Compare" button for side-by-side diff |
| **Diff View** | Comparing two versions | Side-by-side layout; green = added, red = removed; summary stats (X additions, Y deletions) |
| **Published** | Document is live/published | "Published on [date] - Version [N]" badge; "Create New Version" button available |
| **Out of Date** | Profile changed since document was published | Yellow warning banner; "Review Changes" CTA |
| **Error: Generation Failed** | Backend error during generation | Error card with specific failure stage; "Retry" button; option to "Download partial draft" |
| **Error: Validation Failed** | Document failed quality checks | List of validation errors with inline links to affected sections; "Fix All" suggested actions |
| **Empty (No Documents)** | User hasn't generated any documents yet | Empty state illustration; "Generate Your First Document" CTA with document type selection |
| **Multi-Language** | User selects non-English locale | Language selector in header; all UI translated; AI generates in selected language |

---

## 11. Acceptance Criteria

| AC# | Criteria | Priority |
|-----|----------|----------|
| AC-001 | User can generate ToS, Privacy Policy, Cookie Policy, and Operating Agreement from their business profile | P0 |
| AC-002 | All direct-mapped variables are correctly injected from the BusinessProfile | P0 |
| AC-003 | AI drafting produces jurisdiction-specific clauses for GDPR, CCPA, and at least 3 other regulations | P0 |
| AC-004 | Generated documents pass mandatory sections check before publishing is allowed | P0 |
| AC-005 | Legal disclaimer is automatically injected and cannot be removed | P0 |
| AC-006 | Document editor allows inline editing of any section with auto-save | P0 |
| AC-007 | Version history shows all published versions with date, author, and change summary | P0 |
| AC-008 | Diff view shows side-by-side comparison between any two versions | P0 |
| AC-009 | Rolling back creates a new version copy without overwriting history | P1 |
| AC-010 | Regenerating a document preserves user-edited sections and regenerates AI-drafted sections | P1 |
| AC-011 | Business profile changes trigger an "out of date" warning on published documents | P1 |
| AC-012 | Custom user-added sections are preserved across template updates | P1 |
| AC-013 | Pre-generation form collects missing required variables before allowing generation | P1 |
| AC-014 | AI-drafted sections are visually distinguishable from template sections | P1 |
| AC-015 | Multi-language generation produces grammatically and legally sound documents in supported languages | P2 |
| AC-016 | Internal contradiction detection flags inconsistent statements within a document | P2 |
| AC-017 | Mandatory clauses that cannot be removed have disabled delete buttons with explanatory tooltips | P2 |
| AC-018 | Document generation completes (including AI drafting) within 60 seconds for standard documents | P0 |
| AC-019 | Generated documents retain their formatting when exported to PDF/DOCX (via Export module) | P0 |
| AC-020 | Each document references the specific template version used for generation | P1 |