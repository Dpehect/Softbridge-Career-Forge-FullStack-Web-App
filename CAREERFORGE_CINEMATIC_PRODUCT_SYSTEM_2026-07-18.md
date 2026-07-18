# CareerForge — Cinematic Product System

**Revision:** 18 July 2026  
**Purpose:** Product-experience specification and implementation record for the premium CareerForge redesign.

This document is deliberately not a visual-effects wishlist. Every interaction must improve orientation, continuity, feedback, progress, hierarchy, trust or emotional engagement. Effects that do none of these are excluded.

## A. Current product problems

### Navigation and information architecture

- Six top-level product destinations expose implementation boundaries. Analysis and Resume are one job; Coach and Roadmap are one intent.
- The user can begin by uploading a resume from several pages, but no route owns the complete application journey.
- Jobs visually resembles a live marketplace even though the current catalogue is explicit sample data.
- History, backups and resume versions overlap conceptually.

### Cognitive load and user journey

- The interface asks “which tool?” when it should ask “what outcome?”.
- Dashboard goals give ATS score, application count and course completion equal weight without proving they are the user’s highest-value actions.
- A score can become the goal rather than a truthful, role-specific application.
- Landing repeats the same proposition across too many sections.

### ATS and HR credibility

- A universal ATS score cannot be verified across employer systems.
- Previous logic inferred 1.5 years for an experience with unreadable dates; this is removed in the current implementation.
- Previous impact detection accepted unqualified two-digit numbers; current detection requires metric/scope context.
- Listing order previously became mandatory-skill status when requirement language was absent; ambiguous skills are now kept non-mandatory.
- Text extraction volume still cannot prove complex PDF layout compatibility. Layout-dependent findings must remain “not evaluated” without the source document geometry.

### Visual hierarchy and static feeling

- The prior hero showed an impressive static 86/100 mock score without confidence or limitation context.
- Product-area changes lacked a consistent orientation transition.
- Fast actions were distributed across navigation and page controls with no keyboard-first entry point.

### AI trust

- “AI active” versus local fallback is visible, but each recommendation still needs rule/model/source provenance.
- Prompt instructions alone cannot prevent invented claims; structured evidence and user confirmation must enforce this in the UI.
- No recruiter-labelled AI evaluation corpus is present.

## B. Simplified information architecture

### Main navigation

1. **Home** — one next action, blockers and factual activity.
2. **Resume Workspace** — import, extraction review, analysis, editing, versions and export.
3. **Job Pipeline** — target jobs, saved roles, applications, stages and interviews.
4. **Career Assistant** — contextual coaching, interview practice and evidence-gap plan.
5. **Account Center** — identity, security, sync, consent, export and deletion.

### Merged and contextual sections

| Previous surface | New ownership |
|---|---|
| Resume Analysis / Forge | Resume Workspace → Analyze mode |
| Resume editor / version / export | Resume Workspace → Edit and Versions modes |
| Match / saved / applied / stages | Job Pipeline |
| Coach / interview preparation | Career Assistant → Conversation or Practice mode |
| Roadmap / skills / goals | Career Assistant → Development plan |
| Profile / sync / privacy actions | Account Center |

Analysis and development-plan routes remain available for compatibility but are presented as contextual tools, not equal top-level products.

## C. New user journey

### First visit to first value

1. Landing explains the evidence-based application outcome.
2. User imports a resume locally.
3. Extraction review asks the user to confirm identity, roles, dates and ambiguous fields.
4. User pastes a target job or selects “baseline review only”.
5. CareerForge presents the three highest-impact findings, unknown inputs and confidence.
6. User applies or edits one suggestion and sees a before/after diff.
7. The estimate changes by a realistic range, never a guaranteed exact gain.
8. Account creation is offered to preserve the now-valuable workspace.
9. User saves a named resume version to one application.

### Application progression

Draft → Resume ready → Applied → Interview → Offer / Rejected / Archived.

Every stage owns a date, note, next action and linked resume version. Interview preparation inherits the target job and resume evidence automatically.

### Career progression

Outcome data informs a development plan. A skill milestone is complete only when evidence exists—a project, deployed work, assessment or confirmed professional example—not when a checkbox is clicked.

## D. Page-by-page redesign

### Landing

- **Purpose:** establish one product promise and earn the first resume import.
- **Hierarchy:** proposition → live evidence demo → method/trust → concise product flow → beta/pricing state → CTA.
- **Dynamic behaviour:** semantic analysis stages; realistic 64→68 sample change; user-controlled workspace tabs.
- **Motion:** transform-based entry and progress interpolation; meaningful text never fades through inaccessible contrast.
- **Empty/loading/error:** static, fully usable fallback before client motion; file errors explain supported alternatives.
- **Mobile:** one-column demonstration, no floating overlays or heavy scene.

### Home

- **Purpose:** answer what changed and what to do next.
- **Hierarchy:** one Today priority, blockers, recent events, then secondary momentum.
- **Data rule:** no invented trends; hide unavailable metrics.
- **Motion:** priority expands from selected action; activity additions use brief positional feedback.
- **Empty state:** upload resume / use labelled sample.

### Resume Workspace

- **Desktop:** document/version rail, editable resume, contextual evidence panel.
- **Mobile:** section list → full-screen section editor → finding drawer; never compress three panes.
- **Dynamic behaviour:** selecting Experience updates only relevant evidence findings.
- **Actions:** Apply draft, Edit, Compare, Undo, Reject with reason, Need evidence.
- **Loading:** real semantic steps—extracting text, identifying sections, checking target evidence.
- **Error:** preserve original source and edits; parsing failure offers paste/manual review.

### Job Pipeline

- **Views:** Recommended/sample, Saved, Applied, Interview, Offer, Archived.
- **Match presentation:** required, preferred, evidence, experience, logistics and language rows; Match/Gap/Unknown states precede the summary estimate.
- **Card continuity:** selecting a role expands detail without discarding list/filter context.
- **Empty state:** add target manually or use explicitly labelled sample role.
- **Mobile:** horizontally scrollable stages with accessible tab alternative; sticky Add application action.

### Career Assistant

- **Purpose:** act on current workflow context, not provide generic chat.
- **Default actions:** strengthen evidence, prepare interview, plan follow-up.
- **Response:** Finding, Evidence, Recommendation, Expected effect, Confidence, Action.
- **Loading:** response phase and partial structured sections; user prompt persists immediately.
- **Error:** deterministic evidence remains available; retry affects only failed response.

### Account Center

- **Purpose:** make identity, sync, AI consent and data control understandable.
- **Sync conflict:** compare device/account update times and record counts; preserve both until a choice is confirmed.
- **Deletion:** re-authenticated complete account deletion with retention statement.
- **Mobile:** full-width grouped controls; destructive action isolated and confirmed.

## E. WebGL storyboard

WebGL is a progressive enhancement for the landing narrative only. It is not mounted in authenticated workspaces and must never block import or navigation.

### Scene 1 — Fragmented evidence

- **Purpose:** show resume sections, skills, target jobs and application events as separate structured clusters.
- **Visual:** labelled planes/nodes in a calm orthographic field; no galaxy or random particle sphere.
- **Camera:** fixed with a maximum 2° pointer response.

### Scene 2 — Career intelligence connection

- **Purpose:** explain how shared evidence connects experience to target requirements.
- **Visual:** only evidence-backed edges illuminate; unknown relationships remain dotted and muted.
- **Scroll:** normal page scroll maps 0–1 progress to edge formation; no scroll hijacking.

### Scene 3 — Resume evidence

- **Purpose:** focus on one experience line and its role/impact connections.
- **Visual:** weak claim becomes a verified claim; estimate changes 64→68.
- **Rule:** animation cannot imply certainty or a guaranteed hiring outcome.

### Scene 4 — Application path

- **Purpose:** recompose the network into Draft → Applied → Interview stages.
- **Camera:** subtle 6–10% dolly, under 500ms per contextual transition.

### Performance and accessibility fallback

- Server-render an equivalent SVG/static composition first.
- Dynamically import React Three Fiber only after the hero is visible and the device passes capability checks.
- DPR cap 1.5; pause render loop off-screen; no textures; dispose geometry/materials.
- Disable continuous render for reduced-motion, save-data, hidden tabs and low-power signals.
- Reduced-motion fallback uses a static diagram plus the same semantic text and controls.
- Screen readers receive the textual product sequence, never raw scene geometry.

WebGL remains a Phase 4 enhancement until the simplified journey and score model pass validation. Shipping it earlier would hide product risk behind spectacle.

## F. Motion specification

| Category | Duration | Easing | Use |
|---|---:|---|---|
| Feedback | 140ms | standard | press, toggle, state icon |
| Orientation | 220ms | standard | tabs, drawers, disclosure |
| Continuity | 340ms | enter | route/workspace context |
| Progress | 220–500ms | standard | real value interpolation |
| Landing narrative | ≤520ms | enter | scene composition only |

Rules:

- All actions remain interruptible.
- No essential information is encoded only by position, colour or animation.
- Text does not use partial-opacity entrance when this reduces contrast.
- Looping motion stops when the user reads or the element leaves the viewport.
- `prefers-reduced-motion` removes camera movement, parallax, continuous particles and route transforms while preserving state.

Implemented motion tokens: `--duration-fast`, `--duration-base`, `--duration-slow`, `--duration-cinematic`, `--ease-standard`, `--ease-enter`, `--ease-exit`.

## G. Realistic ATS model

Use separate outputs; do not claim one universal ATS score.

### Parseability check — Pass / Warning / Not evaluated

Text extraction, reading order, standard sections, header/footer loss, tables/columns, OCR and unsupported layout. Pasted text cannot prove visual parseability.

### Resume readiness estimate — 100

| Factor | Weight |
|---|---:|
| Parsing and structure | 15 |
| Target-role coverage | 20 |
| Experience relevance | 20 |
| Evidence and measurable impact | 20 |
| Writing quality | 10 |
| Skills credibility | 10 |
| ATS risk factors | 5 |

Penalties apply only to observed facts. Unknown dates, layout and logistics reduce confidence; they never receive positive defaults. Keyword stuffing reduces skill credibility. Dates and version numbers are not impact.

### Confidence

- **High:** layout inspected, extraction confirmed, detailed JD, dates verified, sufficient evidence.
- **Medium:** reliable text with one important missing dimension.
- **Low:** partial/pasted content, ambiguous dates or sparse JD.

Show score, range, confidence, missing inputs, positive/negative evidence and a delta ledger. Potential improvements use ranges such as +2–4, never promises.

Example: 64 (60–68), medium confidence. Missing production AWS evidence and two ambiguous dates. Verified checkout result increases evidence; after confirmation, new estimate 68 (64–72).

## H. HR evaluation framework

Every finding includes:

1. Observation.
2. Exact source evidence.
3. Recruiter interpretation—what can and cannot be concluded.
4. Smallest truthful action.
5. Expected effect on clarity/evidence/alignment.
6. Confidence and reason.
7. Missing context or alternative interpretation.
8. User verification before applying generated facts.

Prohibited claims: guaranteed interview, ATS-approved, perfect resume, recruiter certainty, inferred employment duration as fact, or unvalidated interview probability.

## I. Component architecture

```text
RootLayout
└── WorkspaceSyncProvider
    └── SiteChrome
        ├── Header
        │   ├── WorkspaceNavigation
        │   ├── QuickCommandTrigger
        │   └── AccountControl
        ├── CommandPalette
        ├── DemoNotice
        └── Route content

Landing
├── Navbar
├── Hero
│   └── ProductScenario
│       ├── AtsWorkspaceMockup
│       ├── JobTrackerMockup
│       └── MatchInsightsMockup
└── Static/WebGL narrative boundary (Phase 4)
```

- Zustand owns local workspace state and lightweight UI preferences.
- Supabase modules own authenticated persistence and quota state.
- Deterministic scoring lives outside React and is unit-tested.
- Framer Motion owns UI continuity. CSS owns simple interaction states.
- WebGL, when shipped, is dynamically imported behind one isolated client boundary and receives serialisable narrative state only.
- The command palette emits navigation/actions; it does not become a second state store.

## J. Implementation roadmap

### Phase 1 — Simplification

| Task | Priority | Impact | Complexity | Dependency/Risk | Acceptance |
|---|---|---|---|---|---|
| Five-workspace navigation | Critical | High | M | Route compatibility | Desktop/mobile expose no duplicate analysis/roadmap destinations. |
| Command palette | High | Medium | M | Keyboard/focus | Cmd/Ctrl+K, search, arrow/Enter/Escape and focus are accessible. |
| Merge Resume + Analysis | Critical | High | XL | Store/version model | One workflow preserves selection, diff and undo. |
| Merge Jobs + Pipeline | Critical | High | L | Application entity | Every application links JD, stage and resume version. |
| Contextual Assistant | High | High | L | Shared context | Coach opens with active application/resume context. |

### Phase 2 — ATS credibility

| Task | Priority | Impact | Complexity | Dependency/Risk | Acceptance |
|---|---|---|---|---|---|
| Remove positive unknown defaults | Critical | High | M | Parser coverage | Unknown duration/logistics never increases score; regression tests pass. |
| Split parseability/readiness/match | Critical | High | L | Data model/copy | Three outputs have distinct evidence and limitations. |
| Recruiter-labelled evaluation set | Critical | High | XL | Domain reviewers | Precision, unsupported-claim rate and agreement reported by version. |
| Evidence contract | Critical | High | L | AI schema | Every suggestion has source, confidence and confirmation. |

### Phase 3 — Dynamic product UI

| Task | Priority | Impact | Complexity | Dependency/Risk | Acceptance |
|---|---|---|---|---|---|
| Live semantic analysis states | High | Medium | M | Real processing events | No fake percentage; each stage maps to actual work. |
| Shared context transitions | Medium | Medium | L | Route composition | Selected entity remains identifiable across workspace changes. |
| Outcome-based dashboard | High | High | M | Deadlines/events | One priority uses real data; unavailable trends stay hidden. |

### Phase 4 — Cinematic experience

| Task | Priority | Impact | Complexity | Dependency/Risk | Acceptance |
|---|---|---|---|---|---|
| Static intelligence-network story | Medium | Medium | M | Final copy | Story is comprehensible without motion. |
| Adaptive WebGL enhancement | Low | Medium | XL | Performance budget | Lazy, pausable, DPR-capped, zero functional dependency. |
| Shared element morphs | Medium | Medium | L | Unified entities | Under 500ms and interruptible; no full-context loss. |

### Phase 5 — Accessibility and performance

| Task | Priority | Impact | Complexity | Dependency/Risk | Acceptance |
|---|---|---|---|---|---|
| WCAG 2.2 AA regression | Critical | High | M | Full task coverage | Zero serious A/AA violation in public/product routes. |
| Reduced-motion/capability modes | Critical | High | M | Motion/WebGL | All workflows equivalent with motion disabled. |
| Mobile task E2E | Critical | High | L | Unified flows | Import, edit, version, apply and assistant tasks pass. |
| Performance budget | High | High | M | RUM/Lighthouse | 90+ performance and no WebGL impact before interaction. |

## Current implementation record

This revision implements the first vertical slice:

- five-workspace desktop and mobile navigation;
- contextual Analysis and Development Plan tools;
- Cmd/Ctrl+K accessible command palette;
- transform-based route orientation transition with reduced-motion fallback;
- live, realistic 64→68 resume-readiness hero scenario;
- visible confidence, range and ATS limitation copy;
- darker landing semantic colours and no opacity entrance on meaningful text;
- no invented 1.5-year experience credit;
- no mandatory-skill inference from list order;
- no impact credit for a plain two-digit number/year;
- unit regression coverage for unknown duration and false metric evidence.

The unified Resume Workspace, shared application entity and optional WebGL narrative remain intentionally phased work. They should not be simulated through superficial route labels or decorative graphics.
