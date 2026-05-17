# Feature Specification: Compliance Health Monitor

**Feature ID:** FEAT-004
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-05-13

---

## 1. Feature Overview and Purpose

The Compliance Health Monitor is the ongoing surveillance and alert system of LegalEase AI. It continuously tracks the user's compliance posture by computing a real-time health score, monitoring regulatory changes, and delivering actionable alerts. Where the Compliance Mapping Engine provides the static roadmap, the Health Monitor provides the dynamic "pulse" — ensuring users stay compliant as their business and the regulatory landscape evolve.

### Key Objectives
- Compute and display a real-time Compliance Health Score
- Monitor regulatory changes and alert users when their obligations shift
- Track document expiry and remind users to update policies
- Deliver alerts through multiple channels (in-app, email digest)
- Recommend prioritized actions to improve compliance posture
- Prevent alert fatigue through intelligent aggregation and throttling

---

## 2. Health Score Calculation Formula

### Score Dimensions

The Compliance Health Score is a weighted composite of four dimensions, each scored 0-100, combined into a single 0-100 score.

```
HealthScore = (DR × 0.35) + (DC × 0.30) + (DU × 0.20) + (PM × 0.15)
```

Where:

| Symbol | Dimension | Weight | Description |
|--------|-----------|--------|-------------|
| **DR** | Requirements Completeness | 35% | Percentage of applicable compliance requirements marked as complete |
| **DC** | Document Currency | 30% | Percentage of generated documents that are up-to-date (not expired or outdated due to profile changes) |
| **DU** | No Dismissed/Unresolved Alerts | 20% | 100 minus a penalty for each unresolved alert, weighted by severity |
| **PM** | Profile Completeness | 15% | Percentage of BusinessProfile fields that are filled (non-null, non-default) |

### Detailed Formulas

#### DR — Requirements Completeness
```
DR = (completedRequirements / totalApplicableRequirements) × 100
```
- Only requirements marked as "completed" by the user count
- `totalApplicableRequirements` comes from the Compliance Mapping Engine
- Recalculated whenever a requirement is completed or the roadmap is re-evaluated

#### DC — Document Currency
```
DC = (upToDateDocuments / totalPublishedDocuments) × 100
```
- A document is "up-to-date" when:
  - No profile fields that affect the document have changed since last publish
  - The document was published within the required review period (default: 12 months)
  - No new jurisdiction requirements have been added that affect the document
- If `totalPublishedDocuments = 0`, DC = 100 (nothing is out of date)

#### DU — Alert Resolution
```
DU = max(0, 100 - alertPenalty)
alertPenalty = Σ (alertWeight × isUnresolved)
alertWeight = { critical: 25, high: 15, medium: 8, low: 3 }
```
- Capped at a minimum of 0 (score cannot go negative)
- Alerts are considered "resolved" when the user takes the recommended action OR explicitly dismisses the alert
- Maximum penalty is 100 (can bring score to 0 if many unresolved critical alerts exist)

#### PM — Profile Completeness
```
PM = (filledFields / totalTrackedFields) × 100
```
- "Filled" = non-null, non-empty-string, non-default value
- Fields are weighted equally
- Skipped optional fields during onboarding count as unfilled

### Score Interpretation

| Score Range | Label | Color | Icon | Action Urgency |
|-------------|-------|-------|------|----------------|
| 90-100 | Excellent | Green | ✅ | Maintain current posture |
| 75-89 | Good | Light Green | 🟢 | Address remaining items |
| 60-74 | Fair | Yellow | 🟡 | High-priority items need attention |
| 40-59 | Needs Attention | Orange | 🟠 | Multiple issues, dedicate time soon |
| 0-39 | At Risk | Red | 🔴 | Immediate action required, legal exposure |

### Score Trend
- The system stores snapshots of the health score daily
- Trends are displayed as a sparkline chart: last 30 days of scores
- Score changes > 10 points in a single day trigger a "significant change" alert

---

## 3. Dashboard Widget Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMPLIANCE HEALTH MONITOR DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐│
│  │  HEALTH SCORE       │  │  REQUIREMENTS       │  │  DOCUMENTS        ││
│  │                     │  │                     │  │                   ││
│  │       ┌─────┐       │  │  12 of 47 completed │  │  1 of 3 outdated  ││
│  │       │ 72  │       │  │  ████████░░░░░░░░░░ │  │  ████░░░░░░░░░░░░ ││
│  │       └─────┘       │  │                     │  │                   ││
│  │    Fair ●           │  │  [View All]         │  │  [View All]       ││
│  │                     │  └─────────────────────┘  └───────────────────┘│
│  │  ▲ 5 pts this week  │                                               │
│  │  ┌────────────────┐ │  ┌─────────────────────┐  ┌───────────────────┐│
│  │  │   ▁▂▃▄▃▅▆     │ │  │  ALERTS              │  │  PROFILE           ││
│  │  └────────────────┘ │  │                     │  │                   ││
│  │  [View Details]     │  │  🔴 2 Critical      │  │  85% complete     ││
│  └─────────────────────┘  │  🟡 4 Medium        │  │  ██████████████░░ ││
│                           │  [View All Alerts]  │  │  [Complete Profile]││
│                           └─────────────────────┘  └───────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  RECOMMENDED ACTIONS                                         [View All] │
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │  🔴 Update Privacy Policy — GDPR effective date in 14 days             │
│  │  🟡 Add Cookie Consent Banner — ePrivacy compliance overdue            │
│  │  🟡 Review Data Processing Agreement — New third-party integrations    │
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  RECENT ACTIVITY                                                    ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │  May 12  •  Requirement "Data Retention Policy" marked complete     ││
│  │  May 10  •  Privacy Policy v3 published                             ││
│  │  May 08  •  Profile updated: added "France" to target markets       ││
│  │  May 05  •  Alert: CCPA amendment effective June 1                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Widget Data Sources
| Widget | Data Source | Refresh Rate |
|--------|-------------|--------------|
| Health Score | Computed from DR, DC, DU, PM | On every relevant action + daily snapshot |
| Requirements Progress | Compliance Mapping Engine | Real-time (on requirement status change) |
| Documents Status | Document Generator version records | Real-time (on publish/profile change) |
| Alerts Summary | Alert Engine (aggregated) | Real-time (on alert creation/resolution) |
| Profile Completeness | BusinessProfile | Real-time (on profile edit) |
| Recommended Actions | Priority-scored merged list from all dimensions | Real-time |
| Recent Activity | Audit log (last 7 days) | Real-time |

---

## 4. Alert Types and Triggers

### Alert Taxonomy

| Alert Type | Trigger Condition | Severity | Auto-Expiry |
|------------|-------------------|----------|-------------|
| **New Regulation** | A new regulation is added to the Jurisdiction DB that matches the business profile | Critical or High | Never (must be resolved) |
| **Regulation Update** | An existing regulation applicable to the business is amended or updated | High or Medium | Never (must be resolved) |
| **Regulation Deadline** | A compliance deadline is approaching (within 30, 60, or 90 days) | Critical (<30d), High (<60d), Medium (<90d) | Expires on deadline date |
| **Document Expiry** | A document has not been reviewed/updated within the required period (default: 12 months from publish) | High | Never (must be resolved) |
| **Document Out of Date** | Business profile changed, affecting a published document | Medium | Resolved when document is re-published |
| **Health Score Drop** | Health score decreases by >10 points in a single day | Medium | Expires after 7 days |
| **Profile Incomplete** | Key profile fields remain unset long after onboarding (>14 days) | Low | Resolved when field is filled |
| **Requirement Overdue** | A high-priority requirement remains incomplete beyond its recommended deadline | Medium | Resolved when completed |
| **Conflict Detected** | New regulation creates a conflict with an existing compliance approach | High | Resolved when user acknowledges or resolves |
| **Industry Benchmark** | User's score is significantly below the industry average for similar businesses | Low | Expires after 30 days |

### Alert Lifecycle
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ CREATED  │───▶│ DELIVERED│───▶│  VIEWED  │───▶│ RESOLVED │
│          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                      │                              │
                      │         ┌──────────┐         │
                      └────────▶│DISMISSED │◀────────┘
                                └──────────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │ EXPIRED  │
                                └──────────┘
```

### Alert Creation Rules
- **New Regulation Alert:** Triggered by nightly cron within 24 hours of regulation being added to Jurisdiction DB
- **Regulation Update Alert:** Triggered by nightly cron within 24 hours of amendment being recorded
- **Deadline Alert:** Triggered at 90, 60, 30, 14, 7, and 1 days before deadline
- **Document Expiry Alert:** Triggered when document age passes review period threshold
- **Health Score Drop:** Triggered by daily snapshot comparison at midnight UTC

### Alert Duplication Prevention
- If a similar alert already exists (same type, same subject, still unresolved), a new alert is NOT created
- Instead, the existing alert's `last_triggered_at` timestamp is updated and its severity may be upgraded

---

## 5. Monitoring Frequency and Mechanism

### Monitoring Schedule

| Monitor | Frequency | Mechanism |
|---------|-----------|-----------|
| Regulation Database Polling | Every 6 hours | Cron job queries Jurisdiction DB for changes since last poll |
| Deadline Proximity Check | Daily at 03:00 UTC | Cron iterates all active requirements with deadlines, checks proximity |
| Document Age Check | Daily at 04:00 UTC | Cron checks `published_at` against review period for all published documents |
| Document Profile Sync | On profile save | Event-driven: when BusinessProfile is updated, check all published documents for impact |
| Health Score Snapshot | Daily at 02:00 UTC | Cron computes and stores score; compares with yesterday for drop detection |
| Profile Incomplete Check | Weekly (Monday 10:00 UTC) | Cron checks profiles that are >14 days old with <80% completeness |

### Architecture
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  CRON SCHEDULER     │     │  EVENT LISTENER      │     │  MANUAL TRIGGERS     │
│  (temporal/quart)  │     │  (webhook/pubsub)    │     │  (dashboard refresh)│
└────────┬────────────┘     └────────┬────────────┘     └────────┬────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  MONITORING ENGINE   │
                          │  - Diff computation  │
                          │  - Alert rule eval   │
                          │  - Score recompute   │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  ALERT DISPATCHER    │
                          │  - Dedup             │
                          │  - Severity calc     │
                          │  - Channel routing   │
                          └──────────┬──────────┘
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                    ┌──────────────┐  ┌──────────────┐
                    │  IN-APP      │  │  EMAIL       │
                    │  NOTIFICATIONS│  │  DIGEST      │
                    └──────────────┘  └──────────────┘
```

---

## 6. Alert Delivery

### In-App Notifications
- Real-time toast notification for critical alerts (auto-dismiss after 10 seconds)
- Notification bell icon in header with unread count badge
- Notification drawer: chronologically sorted list, grouped by date
- Clicking an alert opens the relevant context (requirement, document, profile field)
- "Mark as Read" on hover, "Dismiss" to archive without action
- Filter notifications: All / Unread / Critical Only

### Email Digest
- **Frequency options:** Daily (for critical only), Weekly (every Monday), Monthly (1st of month), Off
- **Digest structure:**

```
Subject: LegalEase AI Compliance Digest — May 13, 2026

┌──────────────────────────────────────────────────┐
│  LEGALEASE AI                                     │
│  Weekly Compliance Digest                         │
│  For: YourCompany, Inc.                           │
│  Period: May 6 - May 13, 2026                     │
├──────────────────────────────────────────────────┤
│                                                    │
│  YOUR HEALTH SCORE: 72 (FAIR) ▲ 5 from last week  │
│                                                    │
│  ── CRITICAL ALERTS (1) ──                        │
│  🔴 GDPR Art. 27 Representative deadline          │
│     You have 14 days to appoint an EU              │
│     representative. [View Details →]               │
│                                                    │
│  ── HIGH ALERTS (2) ──                            │
│  🟠 Privacy Policy out of date                    │
│     Profile changes affect your policy.            │
│     [Update Now →]                                 │
│                                                    │
│  ── YOUR PROGRESS ──                              │
│  • 14 of 47 requirements completed (30%)          │
│  • 2 of 3 documents up to date                    │
│  • 3 new requirements this week                   │
│                                                    │
│  ── RECOMMENDED FOCUS THIS WEEK ──                │
│  1. Update your Privacy Policy                    │
│  2. Complete 5 data protection requirements       │
│  3. Review new CCPA amendment details             │
│                                                    │
│  [View Full Dashboard]  |  [Manage Notifications]   │
└──────────────────────────────────────────────────┘
```

### Notification Preferences (User Settings)
| Setting | Options | Default |
|---------|---------|---------|
| Email digest frequency | Daily / Weekly / Monthly / Off | Weekly |
| Critical alert immediate email | On / Off | On |
| In-app notifications | On / Off | On |
| Quiet hours | Start time — End time | Off |
| Per-alert-type email toggle | On/Off per alert type | All On |

---

## 7. Recommended Actions Engine

### Action Generation Logic
```
FUNCTION generateRecommendedActions(userId, limit = 5):
    actions = []

    // From Compliance Mapping Engine
    incompleteCritical = getIncompleteRequirements(userId, minScore: 80, limit: 2)
    FOR EACH req IN incompleteCritical:
        actions.push({ source: "roadmap", priority: req.priorityScore, action: req.title, link: req.id })

    // From Document Generator
    outdatedDocs = getOutdatedDocuments(userId, limit: 2)
    FOR EACH doc IN outdatedDocs:
        actions.push({ source: "documents", priority: 70, action: "Update " + doc.type, link: doc.id })

    // From Health Monitor
    unresolvedAlerts = getUnresolvedCriticalAlerts(userId, limit: 2)
    FOR EACH alert IN unresolvedAlerts:
        actions.push({ source: "alerts", priority: 90, action: alert.recommendedAction, link: alert.id })

    // From Profile
    IF businessProfile.completeness < 80:
        actions.push({ source: "profile", priority: 50, action: "Complete your business profile", link: "profile" })

    // Sort by priority descending, take top N
    actions.sort(by: priority, desc: true)
    RETURN actions[0..limit]
```

### Action Presentation
- Actions are shown as a sorted list with priority icons
- Each action has a direct link to the relevant page/feature
- "Dismiss" button for actions user wants to ignore (with confirmation)
- "Snooze" button to defer an action: "Remind me in 3 days / 1 week / 1 month"
- Completed actions are crossed out and moved to the bottom for 24 hours before removal

---

## 8. Edge Cases

### Multiple Alerts Firing Simultaneously
- **Scenario:** A major regulation change (e.g., GDPR amendment) affects 20 requirements and 3 documents for the user
- **Handling:** The alert engine groups related alerts into a single "summary alert": "GDPR amendment affects 20 requirements and 3 documents in your roadmap. [Review All Changes]"
- Individual alerts are still created for detail view, but the notification center shows the summary alert first

### False Positives
- **Scenario:** A regulation update is recorded in the Jurisdiction DB but doesn't actually affect the user's specific situation
- **Handling:** The applicability rules engine filters out non-applicable changes during the diff computation. Only genuine matches create alerts.
- **User override:** If a user believes an alert is a false positive, they can "Dismiss with reason." This feeds back into the system to improve applicability rules.

### Alert Fatigue
- **Prevention strategies:**
  - **Rate limiting:** Maximum 3 in-app notifications per 24-hour period per user
  - **Batching:** Non-critical alerts are batched into a single daily notification
  - **Severity-based throttling:** Low-severity alerts are only delivered in weekly digest, not in-app
  - **Snooze:** Users can snooze specific alert types or all alerts
  - **Auto-resolution:** Some alerts auto-resolve (e.g., deadline alerts expire after deadline passes)
- **Monitoring:** The system tracks the user's alert engagement rate (clicks per alert). If engagement drops below 20%, the system suggests reducing alert frequency.

### Health Score Edge Cases
- **Brand new user (post-onboarding):** Requirements completeness = 0%, document currency = 100% (no docs yet), alerts = 0, profile = varies. Score typically 20-50. Message: "Your score will improve as you work through your compliance roadmap."
- **All requirements complete, all docs up to date, no alerts:** Score = 100. Message: "Excellent! You're fully compliant. We'll keep monitoring for changes."
- **Score decrease without user action:** Caused by regulation updates or new deadlines. Alert generated to explain the change.
- **Profile fields intentionally left blank:** Some businesses may not have all profile fields applicable. The PM score treats intentionally skipped fields differently from genuinely missing ones.

---

## 9. UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| **Normal** | Dashboard with live data | All widgets populated; health score prominent; recent activity stream |
| **Loading** | Initial data fetch | Skeleton loading states for each widget; staggered fade-in animations |
| **First-Time (Post-Onboarding)** | User just completed onboarding, no actions taken yet | Welcome card: "Your compliance journey begins! Here's your starting point."; health score shown but contextualized |
| **All Clear** | 100% health score, no alerts | Celebration state; "You're fully compliant."; subtle confetti animation |
| **Critical Alert Active** | One or more critical unresolved alerts | Dashboard pulses red border; health score widget prominently red; top recommended action is the critical alert |
| **Multiple Alerts** | Many unresolved alerts across severity levels | Alert widget expanded by default; summary count "8 unresolved"; filter chips |
| **Alert Overload** | >15 unresolved alerts | Warning banner: "You have many unresolved alerts. Try tackling them by priority."; suggested focus on 3 most critical |
| **No Alerts** | Alert queue empty | Alert widget shows "No active alerts ✅"; if health score is low, message: "No immediate alerts, but your compliance score needs attention." |
| **Score Unchanged (30+ days)** | No score movement in a month | Subtle nudge: "Your compliance health hasn't changed in 30 days. Everything on track?" |
| **Score Plummeting** | >20 point drop in a week | Red alert; health score sparkline shows steep decline; urgent CTA: "Investigate what changed" |
| **Profile Incomplete** | <80% profile completeness, >14 days since onboarding | Persistent banner on all pages: "Complete your profile for more accurate compliance monitoring. [Complete Now]" |
| **Email Digest Preview** | User previewing upcoming digest | Modal showing rendered email preview; "Send Now" or "Edit Preferences" buttons |
| **Notification Drawer Empty** | No in-app notifications | "No notifications yet. Alerts will appear here as your compliance needs change." |
| **Error: Monitoring Down** | Backend monitoring service unavailable | Banner: "Monitoring service temporarily unavailable. Last check: [timestamp]. We'll retry automatically." |
| **Offline/Disconnected** | User loses internet | Cached last-known state shown; "You're offline. Data shown is from [timestamp]." |

---

## 10. Acceptance Criteria

| AC# | Criteria | Priority |
|-----|----------|----------|
| AC-001 | Health score is computed correctly from all four dimensions (DR, DC, DU, PM) | P0 |
| AC-002 | Health score updates in real-time when requirements are completed, documents are published, or alerts are resolved | P0 |
| AC-003 | Dashboard widgets display accurate, up-to-date data matching backend computations | P0 |
| AC-004 | New regulation alerts are generated within 24 hours of a regulation being added to the Jurisdiction DB | P0 |
| AC-005 | Regulation update alerts are generated within 24 hours of an amendment being recorded | P0 |
| AC-006 | Deadline alerts fire at 90, 60, 30, 14, 7, and 1 days before deadline | P0 |
| AC-007 | Document expiry alerts fire when a document exceeds the review period since publish | P0 |
| AC-008 | Document out-of-date alerts fire when BusinessProfile changes affect a published document | P1 |
| AC-009 | Related alerts from the same triggering event are grouped into a summary alert | P1 |
| AC-010 | Users receive at most 3 in-app notifications per 24 hours | P1 |
| AC-011 | Weekly email digest is sent to users who have email notifications enabled | P1 |
| AC-012 | Email digest contains accurate health score, alert summary, and recommended actions | P1 |
| AC-013 | Users can configure email digest frequency (Daily, Weekly, Monthly, Off) | P1 |
| AC-014 | Users can dismiss, snooze, and resolve alerts | P1 |
| AC-015 | Alert fatigue prevention: low-severity alerts are batched, not delivered individually | P1 |
| AC-016 | Health score sparkline shows 30-day trend accurately | P2 |
| AC-017 | Health score drops > 10 points in a day generate a "significant change" alert | P2 |
| AC-018 | Dismissed false positive alerts feed back into the applicability rules system | P2 |
| AC-019 | Users can set quiet hours during which no notifications are sent | P2 |
| AC-020 | Dashboard loads within 2 seconds with cached data, 5 seconds for fresh computation | P0 |
| AC-021 | Recent activity log shows the last 7 days of compliance-related actions | P2 |
| AC-022 | Industry benchmark comparison is shown for users in industries with sufficient data (>50 businesses) | P3 |