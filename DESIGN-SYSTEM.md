# LegalMint AI — Design System & Implementation Plan

## 0. Design Brief

**Product**: LegalMint AI — India's AI-powered legal compliance platform
**Primary Users**: Indian business owners, startup founders, compliance officers
**Primary Goal**: Generate compliant legal documents, track compliance status, stay updated with regulations
**Business Goal**: Convert free users to paid plans (₹499/₹1,499/month)
**Brand Signals**: Professional, trustworthy, modern, India-first, AI-powered
**Tech Stack**: Next.js 14, Tailwind CSS, Supabase, tRPC, Framer Motion, Lucide React

### Success Metrics
- Clear visual hierarchy on every page
- Consistent spacing, typography, color usage
- Intuitive navigation with obvious next actions
- Professional, trustworthy aesthetic
- Accessible (WCAG 2.1 AA)

---

## 1. Design Tokens

### 1.1 Color System

#### Neutrals (Slate-based, cool temperature)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `0 0% 100%` | `224 71% 4%` | Page background |
| `--foreground` | `224 71% 4%` | `210 40% 98%` | Primary text |
| `--card` | `0 0% 100%` | `224 71% 4%` | Card backgrounds |
| `--card-foreground` | `224 71% 4%` | `210 40% 98%` | Card text |
| `--popover` | `0 0% 100%` | `224 71% 4%` | Popover backgrounds |
| `--popover-foreground` | `224 71% 4%` | `210 40% 98%` | Popover text |
| `--muted` | `220 14% 96%` | `220 14% 12%` | Secondary backgrounds |
| `--muted-foreground` | `220 9% 46%` | `220 9% 55%` | Secondary text |
| `--border` | `220 13% 91%` | `220 14% 15%` | Borders, dividers |
| `--input` | `220 13% 91%` | `220 14% 15%` | Input borders |

#### Brand Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `243 75% 59%` | `243 75% 59%` | Primary actions, links (Indigo) |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | Text on primary |
| `--primary-light` | `243 75% 96%` | `243 75% 15%` | Subtle backgrounds |
| `--secondary` | `142 71% 45%` | `142 71% 45%` | Success, positive actions (Emerald) |
| `--secondary-foreground` | `0 0% 100%` | `0 0% 100%` | Text on secondary |
| `--secondary-light` | `142 71% 96%` | `142 71% 15%` | Subtle backgrounds |

#### Semantic Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--destructive` | `0 84% 60%` | `0 84% 60%` | Errors, delete actions |
| `--warning` | `38 92% 50%` | `38 92% 50%` | Warnings, in-progress |
| `--success` | `142 71% 45%` | `142 71% 45%` | Success states |
| `--info` | `217 91% 60%` | `217 91% 60%` | Info, tips |

#### Accent & Ring
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent` | `220 14% 96%` | `220 14% 12%` | Hover states |
| `--accent-foreground` | `224 71% 4%` | `210 40% 98%` | Hover text |
| `--ring` | `243 75% 59%` | `243 75% 59%` | Focus rings |

### 1.2 Typography Scale

| Size | Value | Line Height | Weight | Usage |
|------|-------|-------------|--------|-------|
| `text-xs` | `0.75rem` | `1rem` | 400/500 | Captions, labels |
| `text-sm` | `0.875rem` | `1.25rem` | 400/500 | Body secondary, help text |
| `text-base` | `1rem` | `1.5rem` | 400 | Body text |
| `text-lg` | `1.125rem` | `1.75rem` | 500/600 | Subheadings, card titles |
| `text-xl` | `1.25rem` | `1.75rem` | 600 | Section headings |
| `text-2xl` | `1.5rem` | `2rem` | 700 | Page titles |
| `text-3xl` | `1.875rem` | `2.25rem` | 700 | Hero subtitles |
| `text-4xl` | `2.25rem` | `2.5rem` | 800 | Hero headings |
| `text-5xl` | `3rem` | `1` | 800 | Landing hero |
| `text-6xl` | `3.75rem` | `1` | 800 | Landing hero (large) |

**Font**: Inter (system fallback: `system-ui, -apple-system, sans-serif`)
**Font features**: `cv02, cv03, cv04, cv11` enabled
**Max line length**: `65ch` for body text

### 1.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `0.5` | `2px` | Tight gaps, icon spacing |
| `1` | `4px` | Icon-text gaps |
| `1.5` | `6px` | Small gaps |
| `2` | `8px` | Standard gaps |
| `3` | `12px` | Form field gaps |
| `4` | `16px` | Card padding, section gaps |
| `5` | `20px` | Medium gaps |
| `6` | `24px` | Large gaps |
| `8` | `32px` | Section spacing |
| `10` | `40px` | Page section gaps |
| `12` | `48px` | Major section gaps |
| `16` | `64px` | Page padding |
| `20` | `80px` | Hero padding |
| `24` | `96px` | Large padding |
| `32` | `128px` | Hero padding (large) |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `calc(var(--radius) - 4px)` | Buttons, inputs, small elements |
| `md` | `calc(var(--radius) - 2px)` | Cards, badges |
| `lg` | `var(--radius)` | Large cards, modals |
| `xl` | `1rem` | Feature cards, hero elements |
| `2xl` | `1.5rem` | Hero containers |
| `full` | `9999px` | Avatars, pills, badges |

**Default `--radius`**: `0.75rem` (12px)

### 1.5 Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Buttons, small cards |
| `DEFAULT` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Hover cards, dropdowns |
| `lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Popovers, modals |
| `xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Large modals |

### 1.6 Icon System

**Library**: Lucide React v0.417.0
**Default sizes**:
- `w-4 h-4` (16px) — inline icons, list items
- `w-5 h-5` (20px) — buttons, nav items
- `w-6 h-6` (24px) — card icons, feature icons
- `w-8 h-8` (32px) — hero icons, large feature cards
- `w-10 h-10` (40px) — empty states
- `w-12 h-12` (48px) — large empty states

**Icon color rules**:
- Default: `text-muted-foreground`
- Primary action: `text-primary`
- Success: `text-emerald-500`
- Warning: `text-amber-500`
- Error: `text-red-500`
- Feature cards: Colored backgrounds with matching icon colors

---

## 2. Component Specifications

### 2.1 Button

**Variants**:
- `default` — Primary action, indigo bg, white text
- `destructive` — Error/delete, red bg, white text
- `outline` — Secondary action, border, transparent bg
- `secondary` — Tertiary action, muted bg
- `ghost` — Invisible bg, hover highlight
- `link` — Text-only, underline on hover

**Sizes**:
- `sm` — `h-9 px-3 text-sm`
- `default` — `h-10 px-4 py-2`
- `lg` — `h-11 px-8 text-base`
- `icon` — `h-10 w-10`

**States**: default, hover, focus (ring-2), active, disabled

### 2.2 Card

**Anatomy**: Card > CardHeader > CardTitle + CardDescription > CardContent > CardFooter

**Variants**:
- `default` — White bg, border, subtle shadow
- `interactive` — Hover lift effect, cursor pointer
- `selected` — Primary border, ring highlight

### 2.3 Badge

**Variants**:
- `default` — Primary bg, white text
- `secondary` — Muted bg, muted-foreground text
- `destructive` — Red bg, white text
- `outline` — Border only
- `success` — Emerald bg, white text
- `warning` — Amber bg, white text
- `info` — Blue bg, white text

### 2.4 Input

**Features**: label, error, helperText, leftIcon, rightIcon
**States**: default, focus (ring-2), disabled, error (red border)
**Height**: `h-10` (40px)

### 2.5 Select

**Features**: label, error, helperText
**States**: default, focus, disabled, error

### 2.6 Dialog

**Based on**: Radix UI Dialog
**Features**: overlay, close button, header, footer, title, description
**Animation**: fade-in + scale-in

### 2.7 Tabs

**Based on**: Radix UI Tabs
**Features**: tab list, tab triggers, tab content
**Animation**: underline slide

### 2.8 Avatar

**Features**: image src, initials fallback, deterministic colors
**Sizes**: `sm` (32px), `md` (40px), `lg` (48px)

### 2.9 Progress

**Features**: value, max, color, size, showLabel
**Colors**: default (indigo), success (emerald), warning (amber), destructive (red)
**Sizes**: `sm` (6px), `md` (10px), `lg` (16px)

### 2.10 Alert

**Variants**: default, info, success, warning, destructive
**Anatomy**: Icon + AlertTitle + AlertDescription

### 2.11 Separator

**Variants**: horizontal, vertical

---

## 3. Page Layouts

### 3.1 Landing Page (/)

**Sections**:
1. Navigation (sticky, glass effect)
2. Hero (gradient background, animated blobs, trust markers)
3. Features (6 cards, 3-column grid)
4. How It Works (3-step process)
5. Pricing (3 cards, middle highlighted)
6. Testimonials/Social Proof
7. CTA (gradient background)
8. Footer (links, copyright)

### 3.2 Dashboard (/dashboard)

**Layout**: Header + Sidebar + Main Content
**Header**: Logo, search/command, theme toggle, user avatar, sign out
**Sidebar**: Grouped nav (Navigation / Account), active state highlight
**Main**: Stats grid, quick actions, recent activity, getting started

### 3.3 Documents (/documents)

**Layout**: Header + Document Type Grid + Document List
**Document Types**: 7 cards with colored icons
**Document List**: Search, filter, bulk actions, preview, export

### 3.4 Compliance (/compliance)

**Layout**: Header + Score Card + Category Breakdown + Calendar + Requirements
**Score Card**: Large percentage, progress bar
**Category Breakdown**: Horizontal bars by category
**Requirements**: List with status dropdowns

### 3.5 Billing (/billing)

**Layout**: Header + Current Plan + Plan Grid + Payment Methods
**Plan Grid**: 4 cards (Free/Starter/Pro/Enterprise)

### 3.6 Settings (/settings)

**Layout**: Header + Profile Card + Data & Privacy Card + About Card
**Profile**: Name, email (disabled), company name, save button

### 3.7 Auth Pages (/login, /signup)

**Layout**: Centered card on gradient background
**Features**: Email/password, Google OAuth, forgot password link

---

## 4. Implementation Phases

### Phase 1: Foundation (Done)
- [x] Design tokens in globals.css
- [x] Tailwind config
- [x] UI primitives (button, card, badge, input, textarea, tabs, dialog, avatar, progress, alert, separator)

### Phase 2: Missing Components
- [ ] Select component
- [ ] Switch/Toggle component
- [ ] Checkbox component
- [ ] Label component
- [ ] Popover component
- [ ] Tooltip component (Radix-based)
- [ ] Dropdown Menu component
- [ ] Form component (react-hook-form integration)

### Phase 3: Brand Consistency
- [ ] Unify "LegalMint AI" branding across all pages
- [ ] Update logo component
- [ ] Update metadata and SEO

### Phase 4: Landing Page Redesign
- [ ] Hero section with animated gradient
- [ ] Features section with better hierarchy
- [ ] How It Works section
- [ ] Testimonials section
- [ ] Pricing section with better cards
- [ ] CTA section
- [ ] Footer redesign

### Phase 5: Dashboard Redesign
- [ ] Header redesign with better spacing
- [ ] Sidebar with active state, icons, grouping
- [ ] Stats cards with better design
- [ ] Quick actions with better cards
- [ ] Mobile responsive improvements

### Phase 6: Page Redesigns
- [ ] Documents page
- [ ] Compliance page
- [ ] Billing page
- [ ] Settings page
- [ ] Auth pages (login/signup)
- [ ] Onboarding page

### Phase 7: Polish & Animation
- [ ] Page transitions with Framer Motion
- [ ] Stagger animations for lists
- [ ] Hover effects on cards
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### Phase 8: Accessibility & QA
- [ ] Contrast audit
- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Screen reader testing
- [ ] Mobile responsive testing

---

## 5. Design Rules

### Spacing Rules
- Use the spacing scale exclusively — no arbitrary values
- Inside-group spacing < between-group spacing
- Card padding: `p-6` (24px)
- Section spacing: `space-y-8` (32px)
- Page padding: `py-20` (80px) for landing, `py-8` (32px) for dashboard

### Typography Rules
- Max 3 font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Body text: `text-base` with `leading-relaxed`
- Headings: Use weight and color before adding new sizes
- Links: `text-primary` with underline on hover

### Color Rules
- Primary color for main actions only
- Secondary color for success states
- Muted colors for secondary text
- Never use raw color values — always use CSS variables
- Dark mode: adjust backgrounds, keep brand colors consistent

### Border Rules
- Use subtle borders (`border-border/50`) for cards
- Use stronger borders for inputs (`border-input`)
- Use no borders for buttons (use shadows instead)

### Shadow Rules
- Cards: `shadow-sm`
- Hover cards: `shadow-md`
- Dropdowns: `shadow-lg`
- Modals: `shadow-xl`

### Icon Rules
- Always use Lucide React icons
- Consistent sizing within contexts
- Colored backgrounds for feature cards
- Monochrome for nav and buttons

---

## 6. Accessibility Requirements

- All interactive elements must be keyboard accessible
- Focus rings must be visible (ring-2 ring-ring)
- Color contrast must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- Form inputs must have associated labels
- Error messages must be announced to screen readers
- Images must have alt text
- Motion must respect `prefers-reduced-motion`

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1400px | Large screens |

**Container**: `max-w-7xl` (1280px) centered with `mx-auto`
**Mobile**: Single column, bottom nav, stacked cards
**Tablet**: 2-column grids, sidebar hidden
**Desktop**: 3-column grids, sidebar visible

---

## 8. File Structure (Post-Redesign)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Design tokens
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard shell
│   │   └── page.tsx                  # Dashboard home
│   ├── documents/page.tsx            # Documents
│   ├── compliance/page.tsx           # Compliance
│   ├── billing/page.tsx              # Billing
│   ├── settings/page.tsx             # Settings
│   ├── login/page.tsx                # Login
│   ├── signup/page.tsx               # Signup
│   └── ...                           # Other pages
├── components/
│   ├── ui/                           # UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── alert.tsx
│   │   ├── separator.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   └── dropdown-menu.tsx
│   ├── Logo.tsx                      # Logo component
│   ├── PageTransition.tsx            # Page animations
│   ├── StaggerContainer.tsx          # Stagger animations
│   └── ...                           # Other components
└── lib/
    ├── utils.ts                      # cn() utility
    └── ...                           # Other utilities
```
