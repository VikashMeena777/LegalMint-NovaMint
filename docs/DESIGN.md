# LegalMint AI — Design System & UI/UX Specification

**Version** 1.0 | **Status** Draft | **Last Updated** 2026-05-13

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Visual Identity](#2-visual-identity)
3. [Component Library Specification](#3-component-library-specification)
4. [Page Layouts](#4-page-layouts)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design Strategy](#6-responsive-design-strategy)
7. [Accessibility Checklist](#7-accessibility-checklist)
8. [Design Tokens Reference](#8-design-tokens-reference)

---

## 1. Design Principles

Every pixel, interaction, and piece of copy in LegalMint AI must serve users who operate in high-stakes legal and compliance environments. The design is not decorative — it is functional, evidence-based, and procedurally sound.

### 1.1 Trust as Architecture

LegalMint AI manages contracts, compliance obligations, and regulatory filings. A single misstep in the interface — ambiguous status labels, unclear document provenance, or inconsistent form validation — can erode user confidence irreparably.

**Mandates**
- **Provenance by default.** Every AI-generated clause, suggestion, or compliance inference must display its source, confidence level, and last-reviewed timestamp.
- **No dark patterns.** User data is never pre-selected into upsells, and destructive actions always require explicit confirmation with a cool-down.
- **Audit trail visible.** Any mutation to a document or compliance record surfaces a timestamped entry in the activity log, accessible without leaving the primary view.
- **Predictable navigation.** The sidebar structure never reorganises itself. Breadcrumbs reflect the actual URL hierarchy, not an idealised one.

### 1.2 Clarity over Cleverness

Legal language is inherently dense. The interface must be the opposite.

**Mandates**
- **Plain-language microcopy.** Buttons, empty states, and error messages use plain English. Never echo a technical exception message raw.
- **One action per view.** Modals, drawers, and wizards each present a single, scoped task. No unrelated CTAs competing for attention.
- **Progressive disclosure.** Advanced configuration (jurisdiction overrides, custom clause libraries, API keys) lives behind an "Advanced" accordion or a secondary tab, not inline.
- **Visual hierarchy by importance.** Legal status, deadlines, and required actions render first. Metadata (file size, upload date, format) renders second.

### 1.3 Accessibility as Compliance

LegalMint AI serves law firms, in-house counsel at regulated entities, and government agencies — all of whom may be subject to accessibility mandates.

**Mandates**
- WCAG 2.1 Level AA for every user-facing surface, including onboarding wizards and PDF previews.
- Keyboard-only operation for all interactions (form wizards, document annotation, compliance checklists).
- Screen-reader announcements for dynamic content changes (AI suggestions appearing, compliance scores updating).
- Minimum colour contrast of 4.5:1 for body text and 3:1 for large text (18px+ bold or 24px+ regular).
- All time-sensitive interactions (countdowns, session expiry warnings) provide a mechanism to extend or pause.

### 1.4 Performance as UX

Lawyers bill by the hour. A slow interface is a billable-hours tax.

**Mandates**
- First Contentful Paint (FCP) under 1.2 s on 4G.
- Time to Interactive (TTI) under 2.5 s on mid-range hardware.
- Skeleton screens (not spinners) for data-fetching states lasting longer than 300 ms.
- Optimistic UI updates for non-critical mutations (starring a document, toggling a filter).

---

## 2. Visual Identity

### 2.1 Colour Palette

| Token | Hex | Purpose |
|---|---|---|
| `--color-primary-950` | `#0A0F2C` | Primary background (darkest navy) |
| `--color-primary-900` | `#0F1A45` | Card backgrounds, sidebar |
| `--color-primary-800` | `#16235E` | Hover states on dark surfaces |
| `--color-primary-700` | `#1E3077` | Active states, focus rings |
| `--color-primary-600` | `#2840A0` | Primary button background |
| `--color-primary-500` | `#3B52D4` | Primary button hover |
| `--color-primary-400` | `#5B6FE6` | Links, interactive text |
| `--color-primary-300` | `#8896F0` | Secondary accents, icons |
| `--color-primary-200` | `#B8C2F8` | Disabled backgrounds, faint borders |
| `--color-primary-100` | `#E0E4FB` | Light surface backgrounds |
| `--color-primary-50` | `#F2F4FD` | Page background (light mode) |

**Accent — Gold / Amber (Trust & Authority)**

| Token | Hex | Purpose |
|---|---|---|
| `--color-accent-900` | `#78350F` | Deep emphasis text |
| `--color-accent-700` | `#B45309` | Status indicators (pending, caution) |
| `--color-accent-500` | `#D97706` | Primary accent, badges, premium features |
| `--color-accent-400` | `#F59E0B` | Hover states, active toggles |
| `--color-accent-300` | `#FBBF24` | Callout backgrounds, highlights |
| `--color-accent-200` | `#FDE68A` | Subtle highlight backgrounds |
| `--color-accent-100` | `#FEF3C7` | Light accent surface |
| `--color-accent-50` | `#FFFBEB` | Minimal accent tint |

**Neutrals**

| Token | Hex | Purpose |
|---|---|---|
| `--color-neutral-900` | `#0F172A` | Headings, primary text |
| `--color-neutral-700` | `#334155` | Body text |
| `--color-neutral-500` | `#64748B` | Secondary text, placeholders |
| `--color-neutral-400` | `#94A3B8` | Disabled text, subtle borders |
| `--color-neutral-300` | `#CBD5E1` | Input borders |
| `--color-neutral-200` | `#E2E8F0` | Dividers, card borders |
| `--color-neutral-100` | `#F1F5F9` | Row alternate backgrounds |
| `--color-neutral-50` | `#F8FAFC` | Page background (light) |

**Semantic Colours**

| Token | Hex | Purpose |
|---|---|---|
| `--color-success-600` | `#059669` | Success text, active compliance |
| `--color-success-400` | `#34D399` | Success icons |
| `--color-success-100` | `#D1FAE5` | Success backgrounds |
| `--color-error-600` | `#DC2626` | Error text, destructive CTAs |
| `--color-error-400` | `#F87171` | Error icons |
| `--color-error-100` | `#FEE2E2` | Error backgrounds |
| `--color-warning-600` | `#D97706` | Warning text |
| `--color-warning-400` | `#FBBF24` | Warning icons |
| `--color-warning-100` | `#FEF3C7` | Warning backgrounds |
| `--color-info-600` | `#2563EB` | Info text, links |
| `--color-info-100` | `#DBEAFE` | Info backgrounds |

**Compliance Status Colour Map**

| Status | Colour | Purpose |
|---|---|---|
| Compliant | `success-600` | Fully meets regulatory requirement |
| Partially Compliant | `accent-500` | Meets with caveats or exceptions |
| Non-Compliant | `error-600` | Active gap or violation |
| Not Applicable | `neutral-400` | Requirement does not apply |
| Under Review | `info-600` | Awaiting legal review |
| Expiring Soon | `warning-400` | Certification/deadline within 30 days |

### 2.2 Typography

LegalMint AI uses a two-typeface system: **serif for authority** (headings, document previews) and **sans-serif for clarity** (UI, data, labels).

**Primary Heading Font: Merriweather**

```css
--font-heading: 'Merriweather', Georgia, 'Times New Roman', serif;
```

- Designed for long-form reading on screens; maintains legitimacy at small sizes.
- Used for: page headings (`h1`, `h2`), document titles in previews, compliance report headers, marketing hero text.
- Weights used: 400 (regular), 700 (bold), 900 (black — hero only).

**Primary Body Font: Inter**

```css
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

- Optimised for UI readability at 12–16 px. Tabular figures for numeric data.
- Used for: body copy, labels, form elements, navigation, data tables, badges.
- Weights used: 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

**Monospace Font: JetBrains Mono**

```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

- Used for: contract clause references, regulatory citation codes, inline document snippets.

**Type Scale**

| Token | Size / Line | Use |
|---|---|---|
| `--text-xs` | 12 px / 16 px | Captions, badge text, fine print |
| `--text-sm` | 14 px / 20 px | Form labels, sidebar items, secondary text |
| `--text-base` | 16 px / 24 px | Body copy, paragraph text |
| `--text-lg` | 18 px / 28 px | Card headings, modal titles |
| `--text-xl` | 20 px / 28 px | Page section headings |
| `--text-2xl` | 24 px / 32 px | Page titles (h2) |
| `--text-3xl` | 30 px / 36 px | Page hero titles (h1) |
| `--text-4xl` | 36 px / 40 px | Landing hero |
| `--text-5xl` | 48 px / 1.1 | Marketing-only |

### 2.3 Icon System

All icons sourced from **Lucide** (`lucide-react`), chosen for its consistent stroke width and legal/professional icon set.

**Key Icons by Context**

| Context | Icon |
|---|---|
| Documents | `FileText`, `FileCheck`, `FileWarning`, `FilePlus`, `FolderOpen` |
| Compliance | `ShieldCheck`, `ShieldAlert`, `ShieldOff`, `Scale`, `Gavel` |
| Actions | `Plus`, `Pencil`, `Trash2`, `Download`, `Upload`, `Send`, `MoreHorizontal` |
| Navigation | `LayoutDashboard`, `FileText`, `Shield`, `Settings`, `CreditCard`, `Users`, `Search` |
| Status | `CheckCircle2`, `AlertTriangle`, `XCircle`, `Clock`, `HelpCircle`, `Info` |
| AI Features | `Sparkles`, `Bot`, `Wand2`, `Lightbulb`, `ScanSearch` |
| UI Controls | `ChevronDown`, `ChevronRight`, `X`, `Menu`, `Filter`, `SlidersHorizontal` |
| Export | `FileDown`, `FileUp`, `Printer`, `Share2`, `Copy` |

**Usage Rules**
- Icons default to 20 px × 20 px in UI, 16 px in dense tables.
- Interactive icons gain a 4 px padding hit-target wrapper (total 28 px touch area).
- Icon colour inherits from the surrounding text colour via `currentColor` unless a semantic status needs emphasis.

### 2.4 Spacing & Grid System

Base unit: **4 px**. All spacing values are multiples of 4.

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4 px | Inline gaps, icon-to-text |
| `--space-2` | 8 px | Tight padding, compact lists |
| `--space-3` | 12 px | Form element gaps |
| `--space-4` | 16 px | Standard padding, card padding |
| `--space-5` | 20 px | Section gaps |
| `--space-6` | 24 px | Card gaps, layout gaps |
| `--space-8` | 32 px | Section vertical spacing |
| `--space-10` | 40 px | Page-level padding |
| `--space-12` | 48 px | Major section dividers |
| `--space-16` | 64 px | Hero section padding |

**Layout Grid**
- **Columns:** 12-column fluid grid. Gutter: 24 px. Margin: 32 px on desktop, 16 px on mobile.
- **Max content width:** `--container-max: 1280 px` for standard layouts, `--container-narrow: 800 px` for focused forms and wizards.
- **Sidebar width:** `--sidebar-width: 280 px` (collapsed: `64 px` with icon-only view).
- **Document preview pane:** Minimum `540 px` for legible text rendering.

### 2.5 Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-none` | 0 | Tables, code blocks |
| `--radius-sm` | 4 px | Inputs, badges, small buttons |
| `--radius-md` | 8 px | Cards, modals, larger buttons |
| `--radius-lg` | 12 px | Large containers, hero cards |
| `--radius-xl` | 16 px | Marketing section cards |
| `--radius-full` | 9999 px | Pills, toggle switches, avatars |

### 2.6 Shadows & Elevation

LegalMint AI is a flat-design system that uses shadows sparingly — only to communicate *interaction* (elevated modals, dragged items), not decoration.

| Token | Value | Use |
|---|---|---|
| `--shadow-none` | `none` | Default surface |
| `--shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Subtle card lift, hover on rows |
| `--shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | Dropdown menus, tooltips |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Modals, dialogs, popovers |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Elevated drawers, slide-out panels |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Full-screen overlays (rare) |

**Elevation Layering (z-index Scale)**

| Layer | z-index | Component |
|---|---|---|
| Base | `0` | Page content, cards |
| Dropped | `100` | Sticky table headers |
| Overlay | `200` | Dropdowns, select menus, tooltips |
| Modal | `300` | Dialog, modal, drawer backdrop |
| Modal content | `310` | Dialog, modal, drawer body |
| Toast | `400` | Notification toasts |
| Skip link | `500` | Accessibility skip-to-content |

---

## 3. Component Library Specification

### 3.1 Button Variants

All buttons share a base set of properties: `size` (`sm`, `md`, `lg`), `disabled`, `loading`, and `asChild` for polymorphic rendering (e.g., rendering as `<Link>`).

#### `Button` Props

```ts
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent' | 'outline'
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
  loading: boolean
  leftIcon: LucideIcon
  rightIcon: LucideIcon
  fullWidth: boolean
}
```

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|---|
| **Primary** | `primary-600` | White | None | Main CTA (Create Document, Start Onboarding, Save & Continue) |
| **Secondary** | `primary-100` | `primary-700` | None | Supporting actions (Cancel, Back, View Details) |
| **Ghost** | Transparent | `neutral-700` | None | Toolbar, inline actions, icon-only buttons |
| **Destructive** | `error-600` | White | None | Delete document, revoke access, cancel subscription |
| **Accent** | `accent-500` | `neutral-900` | None | Premium feature upsell, key milestone completion |
| **Outline** | Transparent | `primary-600` | `primary-300` | Secondary CTAs on dark backgrounds, card actions |

**Additional States**

- **Loading:** Replaces `leftIcon` with a `Loader2` (Lucide) spinner. Button remains the same width if `loading` toggles on.
- **Disabled:** Reduces opacity to `0.5` and sets `cursor: not-allowed`. Does not fire `onClick`.
- **Full-width:** Stretches to 100% of parent container. Used in mobile layouts and stacked form actions.

#### `IconButton` (extends `Button`)

Satisfies the 44 px minimum touch target on mobile. Available in `sm` (32 px), `md` (40 px), and `lg` (48 px).

### 3.2 Card Components

Cards are the primary organisational unit for content. All cards share `padding` (`--space-4`), `border-radius` (`--radius-md`), and `border` (`neutral-200`).

#### `DocumentCard`

Displays a single document in lists and grids.

**Props**
```ts
interface DocumentCardProps {
  title: string
  type: 'contract' | 'policy' | 'filing' | 'correspondence'
  status: 'draft' | 'in_review' | 'final' | 'executed' | 'expired'
  updatedAt: Date
  owner: { name: string; avatar?: string }
  complianceScore?: number // 0–100
  tags: string[]
  onOpen: () => void
  onMore: () => void // context menu
}
```

**Layout**
```
┌──────────────────────────┐
│ [Icon]  Title             │
│         Type · Updated    │
│                           │
│ Badge: Draft              │
│                           │
│ Owner avatar  Score: 94%  │
│               ████████░░  │
└──────────────────────────┘
```

#### `ComplianceCard`

Summarises a single regulatory framework or compliance domain.

**Props**
```ts
interface ComplianceCardProps {
  framework: string // e.g., "GDPR", "SOC 2", "HIPAA"
  icon: LucideIcon // rendered from framework registry
  overallStatus: ComplianceStatus
  totalRequirements: number
  metRequirements: number
  lastAuditDate?: Date
  nextDeadline?: Date
  onOpen: () => void
}
```

**Layout**
```
┌──────────────────────────┐
│ GDRP               [Icon]│
│ Overall: Compliant       │
│                           │
│ Requirements              │
│ 42 / 48 met               │
│ ████████████████████░░    │
│                           │
│ Next deadline: 15 Jun 2026│
└──────────────────────────┘
```

#### `MetricCard`

Renders a single KPI with optional trend indicator.

**Props**
```ts
interface MetricCardProps {
  label: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  trendValue: string // e.g., "+12%"
  description?: string
  icon?: LucideIcon
  loading?: boolean
}
```

**Layout**
```
┌──────────────────────────┐
│ Label                    │
│ 247                [Icon]│
│ ↑ 12% from last month    │
│ Description text...      │
└──────────────────────────┘
```

### 3.3 Form Elements

All form elements implement a consistent set of states: `default`, `focused`, `filled`, `error`, `disabled`, `readOnly`.

#### `Input`

Standard text input with optional `leftIcon`/`rightIcon`, `error` message, and `helperText`.

```ts
interface InputProps {
  label: string
  placeholder: string
  type: 'text' | 'email' | 'password' | 'number' | 'url'
  error?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  disabled: boolean
  required: boolean
}
```

#### `InputGroup`

Groups related inputs horizontally (e.g., First Name + Last Name, or City + State + ZIP). Renders children with a shared border and label.

#### `Select`

Native `<select>` with custom trigger styling. Supports `options` array, `placeholder`, `error`, and `searchable` (converts to a combobox with typeahead filtering when `searchable` is true).

#### `Toggle` / `Switch`

Binary toggle for on/off settings. Renders as a pill-shaped switch with `checked` / `unchecked` states. Animates the thumb position with `transition-all duration-200`.

#### `MultiStepWizard`

The core onboarding and document-creation interaction pattern. Composed of a `Stepper` and step content panels.

```ts
interface WizardStep {
  id: string
  title: string
  description: string
  isOptional: boolean
  isComplete: boolean
}

interface MultiStepWizardProps {
  steps: WizardStep[]
  currentStep: number
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  isLastStep: boolean
  children: React.ReactNode
}
```

**Behaviour**
- Steps are sequential and cannot be skipped unless marked `isOptional`.
- The wizard persists form state in-session (React state or URL search params for shareable progress).
- Navigating "Back" does not clear previously filled data.
- On the final step, the "Next" button text changes to "Complete" and triggers a confirmation dialog.

### 3.4 Navigation

#### `Sidebar`

Persistent left-hand navigation present on all authenticated pages.

**Structure (top to bottom)**
```
┌─────────────────┐
│ [Logo] LegalMint │
│                 │
│ Dashboard       │  ← active state: primary-100 bg, primary-700 text,
│ Documents       │    primary-600 left border (3px)
│ Compliance      │
│ Templates       │
│ ─────────────── │  ← divider
│ Settings        │
│ Billing         │
│                 │
│ [Collapse btn]  │
│                 │
│ [User avatar]   │
│ Vikash Meena    │
│ vikash@law.com  │
└─────────────────┘
```

**Props**
```ts
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activePath: string
}
```

**Collapsed state** (`64 px` width): shows icons only with tooltips on hover. Expands on hover with a 150 ms animation if the user's preference is set to "expand on hover."

#### `TopBar`

A 56 px tall bar at the top of the content area. Not a full header — the sidebar handles primary navigation.

**Contents**
- **Breadcrumbs** (left): Auto-generated from route. Clickable segments. Last segment is plain text (current page).
- **Search** (centre): `Cmd+K` / `Ctrl+K` trigger for global command palette. When focused, a `CommandPalette` modal opens.
- **Quick actions** (right): Create New (dropdown: Document, Template, Compliance Check), Notifications bell (with unread badge), Help (links to docs / support).

```ts
interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[]
  notificationCount: number
  onSearch: (query: string) => void
}
```

#### `Breadcrumbs`

Rendered by `TopBar` but also available standalone for page-level use.

```ts
interface BreadcrumbsProps {
  items: { label: string; href?: string }[]
  separator?: 'chevron' | 'slash' // default: chevron
}
```

### 3.5 Modal / Dialog System

Uses a layered dialog pattern built on top of `@radix-ui/react-dialog`.

#### `Modal`

```ts
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode // typically action buttons
}
```

**Behaviour**
- **Backdrop:** Semi-transparent `neutral-900` at 50% opacity. Clicking the backdrop calls `onOpenChange(false)` unless `preventBackdropClose` is set.
- **Escape key:** Closes the modal unless `preventEscapeClose` is set.
- **Focus trap:** Focus cycles within the modal. On close, focus returns to the trigger element.
- **Scroll lock:** Body scroll is locked while the modal is open.

#### `ConfirmDialog`

A pre-composed modal for destructive confirmations.

```ts
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string // default: "Delete"
  variant: 'destructive' | 'warning'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}
```

- Destructive variant renders a red confirm button with a 600 ms `setTimeout` cool-down before the button becomes clickable, preventing accidental double-clicks.

### 3.6 Toast Notifications

Rendered via a `ToastProvider` at the root layout. Toasts stack in the bottom-right corner.

```ts
interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'warning' | 'info'
  action?: { label: string; onClick: () => void }
  duration?: number // ms, default 5000
}

function useToast(): {
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}
```

**Behaviour**
- Toasts auto-dismiss after `duration` ms (default 5000).
- A progress bar at the bottom of the toast shows remaining time.
- Hovering a toast pauses the timer.
- Maximum 3 toasts visible at once; additional toasts queue.
- Screen reader announces `title` and `description` via `role="status"` and `aria-live="polite"`.

### 3.7 Badge / Pill

Used for compliance status, document state, and categorisation.

```ts
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size: 'sm' | 'md'
  children: React.ReactNode
  icon?: LucideIcon // auto-selects based on variant if omitted
  dot?: boolean // renders a filled circle left of text
}
```

**Variant Default Icons**

| Variant | Default Icon |
|---|---|
| `success` | `CheckCircle2` |
| `warning` | `AlertTriangle` |
| `error` | `XCircle` |
| `info` | `Info` |
| `neutral` | none |

**Usage Examples**
- Document status: "Draft" (neutral), "In Review" (info), "Executed" (success), "Expired" (error).
- Compliance: "Compliant" (success), "Partially Compliant" (warning), "Non-Compliant" (error).
- Tags: "GDPR" (info dot), "High Priority" (warning dot).

### 3.8 Progress Indicators

#### `Stepper`

Horizontal step indicator for multi-step wizards.

```ts
interface StepperProps {
  steps: { id: string; title: string }[]
  currentStep: number
  orientation: 'horizontal' | 'vertical'
}
```

**States per step:**
- **Completed:** Filled circle with checkmark. Title in `neutral-700`. Connector line in `primary-600`.
- **Active:** Filled circle in `primary-600` with step number. Title in `primary-700` weight 600. Connector line before is filled, after is `neutral-200`.
- **Upcoming:** Empty circle, `neutral-300` border. Title in `neutral-400`. Connector line `neutral-200`.

#### `ProgressBar`

Horizontal percentage bar for compliance scores, upload progress, onboarding completion.

```ts
interface ProgressBarProps {
  value: number // 0–100
  max?: number // default 100
  size: 'sm' | 'md' | 'lg'
  variant: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean // renders "42%" adjacent
  animated?: boolean // animated stripe for indeterminate progress
}
```

### 3.9 Document Preview Component

The document preview is a read-only rendered view of a legal document with annotation capabilities.

```ts
interface DocumentPreviewProps {
  documentId: string
  content: string // Markdown or HTML
  annotations: Annotation[]
  activeAnnotationId?: string
  complianceHighlights: ComplianceHighlight[]
  onAnnotationCreate: (range: TextRange) => void
  onAnnotationClick: (id: string) => void
  zoom: number // 0.5 – 2.0
  pageMode: 'continuous' | 'paginated'
}
```

**Render Modes**
- **Continuous:** Full document rendered as a single scrollable column. Default for editing.
- **Paginated:** Document split into A4 / Letter pages with page breaks. Default for print-ready preview.

**AI Highlights**
- Inline clauses analysed by the AI are highlighted with a subtle background tint:
  - Green tint (`success-100`): Compliant language.
  - Amber tint (`accent-100`): Potentially risky or ambiguous.
  - Red tint (`error-100`): Non-compliant or missing required clauses.
- Hovering a highlight reveals a tooltip with the AI's reasoning and a confidence percentage.

### 3.10 Export Action Bar

A sticky footer bar that appears when one or more documents or reports are selected.

```ts
interface ExportActionBarProps {
  selectedCount: number
  onExport: (format: 'pdf' | 'docx' | 'csv') => void
  onShare: () => void
  onPrint: () => void
  onClear: () => void
  formats: ('pdf' | 'docx' | 'csv')[]
}
```

**Behaviour**
- Slides up from the bottom with a 200 ms ease-out animation when `selectedCount > 0`.
- Shows "X items selected" on the left, action buttons on the right.
- Sticky to viewport bottom, but respects the sidebar.
- On mobile, actions collapse into a "Actions" dropdown to conserve space.

---

## 4. Page Layouts

### 4.1 Landing Page / Marketing Site

```
┌──────────────────────────────────────────────┐
│ [Logo]   Features  Pricing  About    [Login] │  ← Sticky nav, transparent bg → solid on scroll
│                                      [Start] │
├──────────────────────────────────────────────┤
│                                              │
│   Hero: Headline (Merriweather Black)        │
│   Subheadline (Inter, neutral-700)           │
│   [Start Free Trial] [Book Demo]             │
│                                              │
├──────────────────────────────────────────────┤
│   Trust bar: "Trusted by 500+ law firms"     │
│   [Logo cloud of client/partner logos]       │
├──────────────────────────────────────────────┤
│   Feature sections (alternating left/right)  │
│   - AI Contract Review                       │
│   - Compliance Automation                    │
│   - Document Generation                      │
├──────────────────────────────────────────────┤
│   How It Works (3-column stepper)            │
├──────────────────────────────────────────────┤
│   Pricing (3-tier cards)                     │
├──────────────────────────────────────────────┤
│   Testimonials carousel                      │
├──────────────────────────────────────────────┤
│   Footer: Links, Legal, Social               │
└──────────────────────────────────────────────┘
```

**Key Design Decisions**
- Deep navy (`primary-950`) as the primary dark background for hero and footer. Gold accent (`accent-500`) for primary CTAs.
- Feature illustrations use custom SVG line-art (consistent stroke width, muted `primary-200` colour, accent highlights).
- No stock photography. Visuals are diagrammatic — flows, documents, shields.

### 4.2 Dashboard

```
┌──────┬───────────────────────────────────────┐
│ Side │ [Breadcrumbs]        [Search] [🔔][👤]│
│ bar  ├───────────────────────────────────────┤
│      │ Compliance Health Score     78 / 100  │
│      │ ████████████████████░░░░░░░░░░░░░░░░  │
│      │ ↑ 4 pts since last audit              │
│      ├──────────┬──────────┬────────┬────────┤
│      │ Metric   │ Metric   │ Metric │ Metric │
│      │ Card     │ Card     │ Card   │ Card   │
│      ├──────────┴──────────┴────────┴────────┤
│      │                                      │
│      │  Recent Documents                    │
│      │  ┌──────┐ ┌──────┐ ┌──────┐         │
│      │  │ Doc  │ │ Doc  │ │ Doc  │  + View │
│      │  │ Card │ │ Card │ │ Card │    All  │
│      │  └──────┘ └──────┘ └──────┘         │
│      │                                      │
│      ├──────────────────────────────────────┤
│      │                                      │
│      │  Upcoming Deadlines                  │
│      │  ┌──────────────────────────────────┐│
│      │  │ GDPR Audit  ·  15 Jun 2026 · 32d ││
│      │  │ SOC 2 Renew ·  01 Jul 2026 · 48d ││
│      │  └──────────────────────────────────┘│
│      │                                      │
└──────┴──────────────────────────────────────┘
```

**Key Design Decisions**
- Compliance Health Score is the hero element. Rendered as a large donut chart or a linear gauge. Green/amber/red thresholds at 80/50.
- Metric cards form a 2×2 or 4-column grid depending on viewport.
- Recent documents show the 3 most-recently modified document cards with a "View All" link.
- Deadlines are a compact list with countdown badges (e.g., "32 days left").

### 4.3 Onboarding Flow

A multi-step wizard (5–6 steps) that an AI interviewer drives. The user answers questions; the AI builds a compliance profile and document baseline.

**Steps**
1. **Welcome & Firm Profile** — Firm name, jurisdiction, practice areas.
2. **Compliance Landscape** — Which regulations apply? Checkbox list populated by AI based on jurisdiction.
3. **Current Documents** — Upload existing contracts/policies or connect cloud storage (Google Drive, Dropbox, SharePoint).
4. **Risk Assessment** — AI analyses uploaded documents and presents findings: "We found 12 high-risk clauses across 5 contracts."
5. **Priorities** — User ranks compliance priorities. AI suggests order based on deadlines and risk.
6. **Review & Confirm** — Summary dashboard of the profile. User confirms and enters the main app.

```
┌──────────────────────────────────────────────┐
│ Step 2 of 6: Compliance Landscape            │
│                                              │
│ Based on your jurisdiction (California, USA) │
│ and practice areas, we've identified these   │
│ applicable regulations:                      │
│                                              │
│ ☑ CCPA / CPRA       ☑ GDPR (if EU clients)  │
│ ☐ SOC 2             ☑ HIPAA                 │
│ ☑ State Bar Rules   ☐ PCI DSS               │
│                                              │
│ [← Back]                     [Continue →]    │
│                                              │
│ ●──●──◉──○──○──○                            │
└──────────────────────────────────────────────┘
```

**Key Design Decisions**
- Wizard is full-width (no sidebar during onboarding). A minimal top bar shows the LegalMint logo and a "Save & Exit" link.
- AI-generated content is marked with a subtle `Sparkles` icon and a "Generated by AI" label with the confidence score.
- Progress is auto-saved after each step to the user's profile. Browser refresh does not lose progress.

### 4.4 Document Editor / Preview

A split-pane layout for reviewing and annotating documents.

```
┌──────┬──────────────────────┬─────────────────┐
│ Side │ Document Preview     │ AI Insights     │
│ bar  │                      │ Panel           │
│      │ ┌──────────────────┐ │                 │
│      │ │                  │ │ Risk Score: 67  │
│      │ │  NON-DISCLOSURE  │ │                 │
│      │ │  AGREEMENT       │ │ ⚠ 3 High Risk  │
│      │ │                  │ │    Clauses      │
│      │ │  This Agreement   │ │                 │
│      │ │  is entered into  │ │ Clause 4.2(a)  │
│      │ │  as of...         │ │ Ambiguous      │
│      │ │                  │ │ indemnification │
│      │ │  ████ amber ████  │ │ scope.         │
│      │ │                  │ │ [View] [Ignore] │
│      │ │  1. Definition   │ │                 │
│      │ │  ...             │ │ Clause 7.3      │
│      │ │                  │ │ Missing GDPR    │
│      │ │  ██ red ████      │ │ data-processing │
│      │ │                  │ │ addendum.       │
│      │ │  ...             │ │ [Generate]      │
│      │ │                  │ │                 │
│      │ └──────────────────┘ │                 │
│      │                      │                 │
│      │ [Export] [Share]     │ [+ Add Note]    │
└──────┴──────────────────────┴─────────────────┘
```

**Key Design Decisions**
- Resizable panes. Default split: sidebar 280 px | document 60% | insights 40% remaining.
- Collapsible insights panel. A toggle in the top bar opens/closes it.
- AI highlights are interactive — clicking one scrolls the insights panel to the corresponding analysis.
- The export bar appears when the insights panel proposes actionable changes.

### 4.5 Compliance Roadmap View

A timeline/Gantt-like view showing compliance milestones.

```
┌──────┬───────────────────────────────────────┐
│ Side │ Compliance Roadmap                    │
│ bar  │ [Timeline View] [List View] [Export]  │
│      ├───────────────────────────────────────┤
│      │                                       │
│      │ ──●──────●──────○────────○────────●── │
│      │   Q1      Q2      Q3       Q4    Q1   │
│      │                                       │
│      │ GDPR Audit Complete     ✅ Jun 15     │
│      │ SOC 2 Gap Assessment    🔄 Jul 01     │
│      │ HIPAA Policy Update     ⏳ Aug 12     │
│      │ PCI DSS Certification   ⚠ Sep 30     │
│      │                                       │
│      │ ┌──────────────────────────────────┐  │
│      │ │ Expanded milestone detail on     │  │
│      │ │ selecting a timeline item...     │  │
│      │ └──────────────────────────────────┘  │
└──────┴───────────────────────────────────────┘
```

**Key Design Decisions**
- Timeline is horizontal, scrollable. Each milestone is a diamond or circle on the timeline.
- Colours match compliance status: green (complete), amber (in progress), blue (planned), red (overdue).
- List view alternative for dense data on smaller screens.
- Selecting a milestone opens a detail panel below the timeline (not a modal).

### 4.6 Settings & Billing

A tabbed settings page with sections consistent with SaaS expectations but styled with LegalMint authority.

**Tabs:** Profile → Team → Billing → Integrations → API Keys → Audit Log

```
┌──────┬───────────────────────────────────────┐
│ Side │ Settings                              │
│ bar  │ [Profile] [Team] [Billing] [Int...]   │
│      ├───────────────────────────────────────┤
│      │                                       │
│      │ Firm Profile                          │
│      │ ┌──────────────────────────────────┐  │
│      │ │ Firm Name    [_______________]   │  │
│      │ │ Jurisdiction [▼ California   ]   │  │
│      │ │ Practice Area[▼ Corporate    ]   │  │
│      │ └──────────────────────────────────┘  │
│      │                                       │
│      │ Notification Preferences             │
│      │ ☑ Compliance deadline reminders      │
│      │ ☑ Document review requests           │
│      │ ☐ Product updates                    │
│      │                                       │
│      │ [Save Changes]                        │
└──────┴───────────────────────────────────────┘
```

---

## 5. Interaction Patterns

### 5.1 Loading States

| Context | Pattern | Details |
|---|---|---|
| **Page navigation** | Top bar progress bar | Thin 3 px `primary-500` bar across the top of the viewport. Fades out on route completion. |
| **Dashboard widgets** | Skeleton cards | Placeholder rectangles with `animate-pulse`. Match the rough dimensions of the loaded content. Width: randomised 60–90% of container. |
| **Document list** | Skeleton rows | 5–6 rows of `h-12` rectangles with a `rounded-sm` avatar circle on the left. |
| **Document preview** | Skeleton paragraphs | Multiple `h-4` rectangles of varying widths, mimicking paragraph layout. |
| **AI analysis running** | Animated progress with status text | A `ProgressBar` with animated stripe + a status message that updates: "Scanning document..." → "Identifying clauses..." → "Cross-referencing GDPR..." → "Generating recommendations..." |
| **File upload** | Progress bar with cancel | Drag-and-drop zone replaced by a progress card showing filename, percentage, and a Cancel button. |
| **Form submission** | Button loading state | Submit button shows `Loader2` spinner. Form fields become `readOnly` during submission. |

**Rule:** Never show a bare spinner. Always pair it with a label describing what is happening.

### 5.2 Empty States

Empty states are opportunities to guide, not dead ends.

| Context | Illustration | Message | Action |
|---|---|---|---|
| **No documents** | `FileText` icon in `neutral-300`, 64 px | "No documents yet. Upload your first contract or generate one with AI." | `[Upload Document]` `[Generate with AI]` |
| **No compliance frameworks** | `Shield` icon in `neutral-300` | "No compliance frameworks configured. Tell us about your firm to get started." | `[Start Compliance Setup]` |
| **No search results** | `Search` icon in `neutral-300` | "No documents match \`"{query}\`". Try a different search term or adjust filters." | `[Clear Filters]` |
| **No notifications** | `Bell` icon in `neutral-300` | "All caught up! You'll be notified of compliance deadlines and document updates." | (no action needed) |
| **Billing: no payment method** | `CreditCard` icon | "Add a payment method to activate your subscription." | `[Add Payment Method]` |

**Rule:** Every empty state must have at least one clear, actionable next step. The empty state illustration is always a single Lucide icon, never a complex illustration that could fail to load.

### 5.3 Error States

| Context | Pattern | Recovery |
|---|---|---|
| **Page load failure** | Full-page error with illustration | "We couldn't load this page. [Try Again] or [Go to Dashboard]." |
| **API mutation failure** | Inline error on the form field or a toast | Toast: "Failed to save. Please try again." with a Retry action. Form field: red border + error message below. |
| **Document upload failure** | Error card replacing the progress card | Shows filename, error reason (e.g., "File exceeds 25 MB limit"), and `[Retry]` / `[Remove]` buttons. |
| **AI analysis failure** | Inline panel message | "Analysis could not be completed for this document. The AI model may not support this format. [Try Again] or [Contact Support]." |
| **Session expiry** | Modal overlay | "Your session has expired. Please log in again to continue." with `[Log In]` button. Prevents data loss by auto-saving before logging out. |
| **Network offline** | Persistent banner at top of viewport | "You are offline. Changes will be saved locally and synced when you reconnect." Yellow (`warning-100`) background. |
| **Rate limit exceeded** | Toast + disabled buttons | "You've reached the limit for AI document reviews this hour. Your limit resets in 23 minutes. [Upgrade Plan]." |

**Rule:** Error messages must tell the user (1) what happened, (2) why (in plain language), and (3) what to do next. Never display raw error codes or stack traces.

### 5.4 Success States

| Context | Pattern | Behaviour |
|---|---|---|
| **Document saved** | Toast + inline "Saved" indicator | Toast: "Document saved successfully." Inline: A subtle "Saved" checkmark that appears near the document title and fades after 2 s. |
| **Document generated by AI** | Toast + navigate to preview | Toast: "Document generated. Review and edit before finalising." with `[View Document]` action. Navigates to the document preview. |
| **Compliance check complete** | Score animation + results panel | The Compliance Health Score animates from the old value to the new value (counter animation, 600 ms ease-out). The results panel opens automatically. |
| **Onboarding complete** | Confetti-free celebration page | Clean "You're all set!" page with a summary of what was configured and three suggested next actions: "Review Your Documents," "Explore Compliance Roadmap," "Invite Your Team." |
| **Export complete** | Toast + auto-download | Toast: "Exported as PDF." Browser download starts. Export bar closes. |

---

## 6. Responsive Design Strategy

### 6.1 Breakpoint System

| Token | Min Width | Target Device |
|---|---|---|
| `xs` | `360 px` | Small phones (iPhone SE, Galaxy S) |
| `sm` | `640 px` | Large phones, small tablets portrait |
| `md` | `768 px` | Tablets portrait, small laptops |
| `lg` | `1024 px` | Tablets landscape, laptops |
| `xl` | `1280 px` | Desktops |
| `2xl` | `1536 px` | Large desktops |

### 6.2 Mobile-First Approach

All components are designed mobile-first. Styles cascade **up** using `min-width` media queries.

**Key Adaptations**

| Component | Mobile (< 768 px) | Tablet (768–1024 px) | Desktop (> 1024 px) |
|---|---|---|---|
| **Sidebar** | Hidden. Hamburger menu opens a slide-out drawer. | Collapsed (icons only). Expands on tap. | Full sidebar (280 px) with collapse toggle. |
| **Top Bar** | Full width. Breadcrumbs hidden; page title shown. Search icon only. | Breadcrumbs truncated to last 2 segments. | Full breadcrumbs + search bar. |
| **Dashboard** | Single column. Metric cards stack vertically. | 2-column grid for metric cards. | 4-column grid for metric cards. 2-column for widgets. |
| **Document cards** | Full-width cards, stacked. | 2-column grid. | 3-column grid (comfortable) or list view (compact toggle). |
| **Document preview** | Full-width, no insights panel. Toggle button to overlay insights. | Split pane: 70% document, 30% insights. | Split pane: sidebar + 60% document + 40% insights. |
| **Modals** | Full-screen (`size="full"`). Close button top-left. | Centred sheet, 90vw max. | Centred sheet, size-dependent width. |
| **Wizard** | Single column. Stepper is horizontal, scrollable if needed. | Centred narrow container (640 px). | Centred narrow container (800 px). Sidebar hidden during onboarding. |
| **Tables** | Cards replace rows. Each card shows one record. | Standard table, horizontal scroll if needed. | Full table with all columns. |
| **Export bar** | Actions collapse into a dropdown. | Full action bar, reduced padding. | Full action bar. |

### 6.3 Touch Targets

All interactive elements satisfy the WCAG 2.5.5 minimum target size of 44 × 44 CSS pixels on touch devices. This is achieved via padding on the interactive element, not by increasing font size.

### 6.4 Performance Budgets

| Metric | Budget |
|---|---|
| First Contentful Paint | < 1.2 s |
| Largest Contentful Paint | < 2.5 s |
| Time to Interactive | < 2.5 s |
| Total Blocking Time | < 200 ms |
| Cumulative Layout Shift | < 0.1 |
| JavaScript bundle (gzipped) | < 200 KB initial, < 500 KB total per route |

---

## 7. Accessibility Checklist

### 7.1 Perceivable

- [ ] **1.1.1 Non-text Content:** All icons have `aria-label` or are accompanied by visible text. Document preview images have alt text describing the document type. Charts have text-based data tables as alternatives.
- [ ] **1.2.1 Audio-only and Video-only:** Not applicable (no video/audio content in v1).
- [ ] **1.3.1 Info and Relationships:** Form inputs use `<label>` elements. Tables use `<th>` with `scope` attributes. Headings follow a logical nesting order (`h1` → `h2` → `h3`).
- [ ] **1.3.2 Meaningful Sequence:** DOM order matches visual order. Sidebar renders before main content in DOM but is positioned via CSS.
- [ ] **1.3.3 Sensory Characteristics:** No instructions rely solely on colour, shape, or position. "Click the blue button" → "Click the 'Save Changes' button."
- [ ] **1.4.1 Use of Colour:** Status is always communicated with both colour AND an icon/text label. Compliance badges use colour + icon + text.
- [ ] **1.4.2 Audio Control:** Not applicable.
- [ ] **1.4.3 Contrast (Minimum):** All text meets 4.5:1 (body) and 3:1 (large text) contrast ratios against their backgrounds. Verified with axe-core in CI.
- [ ] **1.4.4 Resize Text:** All text scales to 200% without loss of content or functionality.
- [ ] **1.4.5 Images of Text:** No images of text are used except in the logo.
- [ ] **1.4.10 Reflow:** Content reflows to a single column at 320 px width without horizontal scrolling.
- [ ] **1.4.11 Non-text Contrast:** UI components (buttons, inputs, focus rings) maintain 3:1 contrast against adjacent colours.
- [ ] **1.4.12 Text Spacing:** Content is functional when users override text spacing (line height 1.5, paragraph spacing 2× font size, letter spacing 0.12×, word spacing 0.16×).
- [ ] **1.4.13 Content on Hover or Focus:** Tooltips are dismissible without moving the pointer (Escape key) and the content is hoverable (persistent until hover/focus is removed).

### 7.2 Operable

- [ ] **2.1.1 Keyboard:** All functionality is operable through a keyboard. No keyboard traps.
- [ ] **2.1.2 No Keyboard Trap:** Focus can always be moved away from any component using standard keyboard navigation.
- [ ] **2.1.4 Character Key Shortcuts:** All single-character shortcuts are remappable or can be turned off. `Cmd+K` requires a modifier key and is exempt.
- [ ] **2.2.1 Timing Adjustable:** Session expiry warnings appear 2 minutes before expiry with an option to extend. No other time-limited interactions.
- [ ] **2.2.2 Pause, Stop, Hide:** Auto-dismissing toasts can be paused on hover. No auto-playing content.
- [ ] **2.3.1 Three Flashes or Below:** No flashing content.
- [ ] **2.4.1 Bypass Blocks:** A "Skip to main content" link is the first focusable element on every page.
- [ ] **2.4.2 Page Titled:** Every page has a unique, descriptive `<title>`.
- [ ] **2.4.3 Focus Order:** Focus follows a logical sequence. Modals trap focus within the dialog.
- [ ] **2.4.4 Link Purpose (In Context):** Link text clearly describes the destination. "View all documents" not "Click here."
- [ ] **2.4.5 Multiple Ways:** All pages are reachable via sidebar navigation, search, and breadcrumbs.
- [ ] **2.4.6 Headings and Labels:** Headings describe the page section. Form labels describe the expected input.
- [ ] **2.4.7 Focus Visible:** All interactive elements have a visible focus indicator. Uses `:focus-visible` with a 2 px `primary-600` ring offset by 2 px from the element.
- [ ] **2.5.1 Pointer Gestures:** Multi-point gestures have single-pointer alternatives. Pinch-to-zoom on document preview also has +/- buttons.
- [ ] **2.5.2 Pointer Cancellation:** Actions fire on `pointerup`, not `pointerdown`. Users can cancel by moving the pointer away.
- [ ] **2.5.3 Label in Name:** Accessible names of controls contain their visible text labels.
- [ ] **2.5.4 Motion Actuation:** No functionality triggered by device motion.
- [ ] **2.5.5 Target Size:** All touch targets are at least 44 × 44 CSS pixels. Exceptions: inline links in text blocks, which inherit line height.
- [ ] **2.5.7 Dragging Movements:** Document annotation (drag-to-select text) has a keyboard alternative (Shift+Arrow keys to extend selection).

### 7.3 Understandable

- [ ] **3.1.1 Language of Page:** `<html lang="en">` is set. Pages with multilingual content use `lang` attributes on the relevant containers.
- [ ] **3.1.2 Language of Parts:** Legal terms in Latin or other languages are wrapped in `<span lang="la">`.
- [ ] **3.2.1 On Focus:** Focusing an element does not trigger a change of context (navigation, form submission, modal opening).
- [ ] **3.2.2 On Input:** Changing a form control setting does not auto-submit or change context unless the user is informed beforehand. Exception: filter dropdowns that apply filters on selection — these use `aria-live="polite"` to announce the change.
- [ ] **3.2.3 Consistent Navigation:** The sidebar navigation order and structure is identical across all pages.
- [ ] **3.2.4 Consistent Identification:** Components with the same functionality are identified consistently. All "Save" buttons say "Save" (not "Save Changes," "Save Document," etc., unless there is a meaningful distinction).
- [ ] **3.3.1 Error Identification:** Form errors are described in text, not just indicated by red borders. Error messages appear below the relevant field.
- [ ] **3.3.2 Labels or Instructions:** All form inputs have visible labels. Required fields are marked with an asterisk and the legend "Required fields are marked with *" appears at the top of the form.
- [ ] **3.3.3 Error Suggestion:** Validation errors include a suggestion for correction. "Email address is invalid. Please enter a valid email, e.g., name@domain.com."
- [ ] **3.3.4 Error Prevention (Legal, Financial, Data):** Destructive actions (document deletion, subscription cancellation, team member removal) require confirmation. Submissions can be reversed within a short window (soft-delete with 30-day recovery).

### 7.4 Robust

- [ ] **4.1.1 Parsing:** HTML validates. Elements have complete start and end tags. IDs are unique. Attributes are not duplicated.
- [ ] **4.1.2 Name, Role, Value:** All custom UI components expose correct ARIA roles, states, and properties. Toggle switch: `role="switch"` with `aria-checked`. Modal: `role="dialog"` with `aria-modal="true"` and `aria-labelledby`. Tab list: `role="tablist"` with `role="tab"` and `aria-selected` per tab.
- [ ] **4.1.3 Status Messages:** Dynamic content changes (AI suggestions appearing, real-time compliance updates, form submission feedback) are announced via `aria-live` regions without moving focus.

### 7.5 Testing Protocol

- **Automated:** axe-core and `@axe-core/react` run in CI on every PR. Any violation blocks merge.
- **Manual keyboard audit:** Performed by the QA team per sprint. Every interaction path is tested keyboard-only.
- **Screen reader audit:** Tested with NVDA (Windows) and VoiceOver (macOS) on the top 5 user flows per release.
- **Contrast audit:** All colour combinations verified with the WebAIM contrast checker and baked into the design token generation script.
- **Zoom audit:** All pages tested at 200% browser zoom and 400% on critical flows (onboarding, document review).

---

## 8. Design Tokens Reference

### 8.1 CSS Custom Properties (Complete)

```css
:root {
  /* ── Typography ── */
  --font-heading: 'Merriweather', Georgia, 'Times New Roman', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  --leading-xs: 1rem;
  --leading-sm: 1.25rem;
  --leading-base: 1.5rem;
  --leading-lg: 1.75rem;
  --leading-xl: 1.75rem;
  --leading-2xl: 2rem;
  --leading-3xl: 2.25rem;
  --leading-4xl: 2.5rem;
  --leading-5xl: 1.1;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* ── Colours ── */
  /* Primary */
  --color-primary-950: #0A0F2C;
  --color-primary-900: #0F1A45;
  --color-primary-800: #16235E;
  --color-primary-700: #1E3077;
  --color-primary-600: #2840A0;
  --color-primary-500: #3B52D4;
  --color-primary-400: #5B6FE6;
  --color-primary-300: #8896F0;
  --color-primary-200: #B8C2F8;
  --color-primary-100: #E0E4FB;
  --color-primary-50: #F2F4FD;

  /* Accent (Gold/Amber) */
  --color-accent-900: #78350F;
  --color-accent-700: #B45309;
  --color-accent-500: #D97706;
  --color-accent-400: #F59E0B;
  --color-accent-300: #FBBF24;
  --color-accent-200: #FDE68A;
  --color-accent-100: #FEF3C7;
  --color-accent-50: #FFFBEB;

  /* Neutrals */
  --color-neutral-900: #0F172A;
  --color-neutral-700: #334155;
  --color-neutral-500: #64748B;
  --color-neutral-400: #94A3B8;
  --color-neutral-300: #CBD5E1;
  --color-neutral-200: #E2E8F0;
  --color-neutral-100: #F1F5F9;
  --color-neutral-50: #F8FAFC;

  /* Semantic */
  --color-success-600: #059669;
  --color-success-400: #34D399;
  --color-success-100: #D1FAE5;
  --color-error-600: #DC2626;
  --color-error-400: #F87171;
  --color-error-100: #FEE2E2;
  --color-warning-600: #D97706;
  --color-warning-400: #FBBF24;
  --color-warning-100: #FEF3C7;
  --color-info-600: #2563EB;
  --color-info-100: #DBEAFE;

  /* Background */
  --color-bg-page: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-bg-sidebar: #0F1A45;
  --color-bg-input: #FFFFFF;

  /* ── Spacing ── */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* ── Layout ── */
  --container-max: 1280px;
  --container-narrow: 800px;
  --sidebar-width: 280px;
  --sidebar-collapsed: 64px;
  --topbar-height: 56px;

  /* ── Border Radius ── */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* ── Z-Index Scale ── */
  --z-base: 0;
  --z-dropped: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-modal-content: 310;
  --z-toast: 400;
  --z-skip-link: 500;

  /* ── Transitions ── */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-modal: 200ms ease-out;

  /* ── Focus Ring ── */
  --focus-ring: 0 0 0 2px var(--color-bg-card), 0 0 0 4px var(--color-primary-600);
}

/* ── Dark Mode Overrides (future) ── */
/* .dark { ... } — not implemented in v1 */
```

---

## Appendix A: LegalMint AI Brand Voice in UI

**Tone attributes:** Authoritative but not arrogant. Precise but not robotic. Empathetic but not casual.

- Buttons use imperative verbs: "Review Document," "Generate Clause," "Start Assessment."
- Error messages avoid "Oops" or "Something went wrong." Instead: "The document could not be saved. Please try again."
- AI-generated content is always labelled: "Suggested by LegalMint AI" with a timestamp and confidence score.
- The product name is "LegalMint AI" on first mention, "LegalMint" thereafter. Never "LE" or "LE AI" in user-facing copy.

---

## Appendix B: File Organisation Convention

```
packages/lib/src/
├── tokens/
│   ├── colors.ts         # Colour token definitions as typed objects
│   ├── typography.ts     # Font family, size, leading, weight definitions
│   ├── spacing.ts        # Spacing scale
│   ├── shadows.ts        # Box-shadow definitions
│   └── index.ts          # Re-exports all tokens
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Stepper.tsx
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── ExportActionBar.tsx
│   ├── cards/
│   │   ├── DocumentCard.tsx
│   │   ├── ComplianceCard.tsx
│   │   └── MetricCard.tsx
│   └── forms/
│       ├── MultiStepWizard.tsx
│       ├── InputGroup.tsx
│       └── Toggle.tsx
└── hooks/
    ├── useToast.ts
    ├── useMediaQuery.ts
    └── useKeyboardShortcut.ts
```

---

*This document serves as the single source of truth for all UI/UX decisions in LegalMint AI. Any divergence between this specification and the implemented code is a bug. Design review happens in PR alongside code review, with this document linked as the acceptance criteria.*