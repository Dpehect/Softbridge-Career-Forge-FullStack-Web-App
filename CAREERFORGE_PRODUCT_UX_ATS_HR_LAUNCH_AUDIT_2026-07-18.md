# CareerForge — Product, UX, ATS & HR Launch Audit

**Audit date:** 18 July 2026  
**Audited revision:** `fb242c4` (`main`)  
**Decision:** **Not ready for a public paid launch. Suitable for a controlled beta after the critical items below are closed.**

## Scope, evidence and limitations

This audit evaluates the current repository, the production build, product copy, deterministic scoring logic, AI endpoint, local/cloud data model, database migration and automated tests. The supplied prompt references a screen recording, but no recording was attached to this audit request. The live Vercel URL could not be opened by the available browser/web environment. Therefore visual findings are based on the current `main` production build and its rendered desktop/mobile test surfaces; deployment-specific behaviour is not claimed as verified.

Verified in this audit:

- ESLint: pass with zero warnings.
- TypeScript: pass.
- Unit tests: 7/7 pass. The tests cover only ATS and job-match scoring.
- Production build: pass; 21 pages generated.
- E2E/accessibility: 17/18 pass. Desktop landing fails a serious WCAG AA colour-contrast rule; app routes and mobile landing pass the present shell-level suite.
- Dependency audit: two moderate PostCSS vulnerabilities through Next.js; no high/critical finding at the configured threshold.
- Repository contains a Supabase migration, ownership-based RLS policies and an authenticated/rate-limited AI endpoint. This proves intended configuration, not that the migration is deployed correctly in production.

The test suite does **not** prove the complete upload → analysis → edit → version → match → apply → interview journey, real Google authentication, real Supabase sync/conflict recovery, AI-provider behaviour, account deletion, PDF/DOCX parsing fidelity or production observability.

## Executive verdict

CareerForge looks like a credible, carefully built portfolio product. It does not yet behave like one coherent career platform. Six top-level workspace destinations—Dashboard, Analysis, Resume, Jobs, Coach and Roadmap—expose the implementation structure instead of guiding the user through a job-search outcome. The interface repeatedly asks the user to decide which tool to open next.

The most serious product issue is trust. The application correctly labels its job records as demo data and now exposes score ranges and confidence, but the underlying ATS and match calculations still make unsupported inferences. Unknown employment duration becomes 1.5 years. Text length stands in for document structure. A two-digit number can be counted as impact. A static skill list and substring matching stand in for recruiter judgement. These are reasonable prototype heuristics; they are not a defensible ATS product methodology.

The most serious UX issue is fragmentation. Analysis and Resume are two views of the same job. Jobs and application stages should be one pipeline. Coach and Roadmap should be one contextual assistant. The dashboard should route one next action, not summarize every subsystem.

The strongest part is engineering hygiene: strict linting, type checking, build validation, unit tests, E2E scaffolding, authenticated AI calls, input limits, quota control, RLS and honest demo labels. The weakest part is product validation: there is no evidence that scoring correlates with ATS parsing or recruiter decisions, no complete outcome loop, no real job supply, no payment proposition and no production telemetry.

---

# 1. Biggest UX mistakes

## 1.1 Navigation mirrors features, not user intent — critical

The primary navigation exposes six product areas. “Analysis” and “Resume” are indistinguishable to a first-time user until explored. “Coach” and “Roadmap” compete for the same career-guidance intent. “Jobs” mixes discovery, saved jobs, match estimates and application tracking.

**User cost:** decision fatigue before value. A user with a resume and a target job should not have to understand CareerForge’s internal feature taxonomy.

**Fix:** reduce signed-in primary navigation to:

1. **Today** — one recommended next action and recent outcomes.
2. **Applications** — resume versions, target jobs, fit evidence and pipeline.
3. **Career Assistant** — interview preparation, goals and learning plan in context.
4. **Account** — identity, sync, privacy and export.

Analysis and editing become modes inside an application workspace. Job discovery and tracking become tabs inside Applications. Roadmap becomes an assistant-generated plan, not a separate catalogue destination.

## 1.2 The journey has multiple starts and no authoritative next step — critical

The landing, Dashboard, Analysis, Resume, Jobs, Coach and Roadmap pages can all load demo data or redirect toward a CV. This handles empty states, but it also creates seven competing onboarding paths. The product never establishes whether the primary job is “improve my base resume”, “prepare one application”, or “manage my career”.

**Fix:** make **Create an application workspace** the primary job. A first session asks for only:

- a resume,
- a target role or job description,
- optional sign-in after the first useful result.

The system then generates a sequenced checklist. Every completion routes to the next step automatically.

## 1.3 Dashboard is a subsystem summary, not a decision surface — high

ATS optimisation, applications and learning modules are presented as weekly goals with equal conceptual weight. This is product-led gamification without evidence that those three actions are the right priorities for the user. “Reach 80% ATS” is especially problematic because it turns a heuristic into a target users will game.

**Fix:** replace the generic weekly checklist with one outcome-based panel:

- **Today’s priority:** e.g. “Add evidence for TypeScript in Acme application resume.”
- **Why now:** “Application is in Draft and the role closes in 3 days.”
- **One primary action.**
- **What changed:** factual events only—version exported, application moved, interview scheduled.

Never set “score ≥ 80” as a user goal. The goal is a credible application, not a high internal number.

## 1.4 Resume work is split across Analysis and Resume — critical

Analysis produces findings; Resume provides an editor, preview, recommendations, versioning and export. Moving between them breaks the feedback loop and makes score changes hard to attribute.

**Fix:** one Resume Workspace with a persistent three-pane model on desktop and staged views on mobile:

- left: sections and source evidence,
- centre: editable resume,
- right: findings for the selected target job.

Applying a change must show a before/after diff and the exact rubric delta. Version history belongs in this workspace.

## 1.5 Landing page is too long and repeats the proposition — high

Hero, product switcher, showcases, how-it-works, examples, methodology, pricing and final CTA repeat similar promises. This is visually polished but cognitively expensive. The page tries to prove an entire suite before the user experiences the core value.

**Fix:** keep Hero, one interactive proof, three-step method, trust/methodology, pricing or beta status, and final CTA. Remove duplicate showcase storytelling. The landing should answer: what is analysed, what is not known, where data goes, and what the user gets in under two minutes.

## 1.6 Landing mockup still contains unreadable text — critical accessibility

The desktop E2E test found serious colour contrast failures in the hero product preview. Examples include `#818b8f` on `#f4f8f5` at 12px (3.25:1), `#519b95` on `#f4f8f5` at 14px (3.02:1), and `#519b95` on `#f7fcfa` at 12px (3.13:1). These fail the 4.5:1 WCAG AA target for normal text.

**Fix:** use the dark teal/ink token for all meaningful mockup text; reserve pale teal/grey for non-text decoration. Minimum mockup body size 14px, labels 13px at 600 weight, line-height 1.45. If the preview cannot fit readable content, remove content rather than shrink it. Add a desktop landing contrast regression test.

## 1.7 Mobile shell passes, but task completion is not tested — high

The present mobile checks verify one heading, no horizontal overflow, no console errors and automated accessibility rules. They do not prove that file upload, long-form editing, filters, pipeline movement, recommendation review or export is usable on a phone.

**Fix:** add mobile task tests for import, apply suggestion, undo, save version, filter job, add application and send coach prompt. For the resume editor, use a focused edit mode rather than compressing desktop panes.

---

# 2. Biggest product mistakes

## 2.1 The product has no single measurable core outcome

CareerForge currently spans resume editing, ATS analysis, job discovery, application tracking, coaching and learning paths. The breadth makes a good demo but weakens the commercial promise. It is unclear whether success means a better document, a submitted application, an interview or long-term career growth.

**Redesign:** define the product outcome as **“Help a candidate submit a truthful, role-specific application and prepare for the next hiring stage.”** Measure:

- time from import to first role-specific export,
- percentage of recommendations accepted, edited or rejected,
- applications with a linked resume version,
- stage conversion and user-reported interview outcome,
- false-positive feedback rate.

## 2.2 There is no credible return loop

Local persistence, saved jobs and roadmap progress create stored state, not a compelling reason to return tomorrow. There are no real deadlines, follow-ups, interview events, outcome learning or personalised priority changes.

**Fix:** the return loop should be the application pipeline: follow-up due, closing date, interview preparation, requested resume change and post-outcome reflection. Do not manufacture notifications; derive them from user-entered or verified application events.

## 2.3 The paid proposition is hypothetical

Pricing advertises Pro as “coming soon” with cloud sync, STAR coaching, history and multi-device access. Some of those capabilities already partly exist, while no price, checkout, entitlement, billing state or support promise exists.

**Fix:** before paid launch, choose one:

- **Honest beta:** remove pricing cards and use “Free beta—no payment collected”.
- **Real product:** implement price, checkout, entitlement checks, cancellation/refund policy, billing portal and support SLA.

Do not sell “advanced AI” until quality is evaluated and failure boundaries are visible.

## 2.4 Static demo jobs imitate a marketplace

The repository’s jobs, companies, salaries, applicant counts, post dates and application links are authored fixtures. They are labelled as demo on detail pages, which is correct, but the Jobs destination still visually behaves like a live job marketplace.

**Fix:** rename it **Application Pipeline**. Let users paste a URL/JD or manually create a target. Keep sample roles behind an explicit “Use sample data” mode with a persistent Demo banner. Remove applicant counts, invented expiration dates and unusable application URLs from the normal experience.

## 2.5 Roadmaps are static course catalogues, not career plans

The roadmap data is predefined, progress is checkbox-based and completion is not backed by work evidence. It competes with the immediate application outcome and risks looking like filler.

**Fix:** remove Roadmap from primary navigation. Career Assistant can recommend at most one gap plan tied to a target role, with evidence requirements such as a project, repository, assessment or course completion. Progress alone must not improve readiness scores.

## 2.6 Account creation occurs outside a designed onboarding contract

Google sign-in and sync exist, but onboarding does not clearly explain local-first behaviour, what will sync, conflict resolution, AI data transmission and deletion boundaries. The account page deletes workspace/profile rows but explicitly does not remove identity-provider access.

**Fix:** ask for sign-in after a useful local result. Before sync, show a concise data contract: fields synced, AI-bound context, retention, device/cloud choice and deletion scope. Provide a server-side complete account deletion path, not “contact support”.

---

# 3. Biggest AI mistakes

## 3.1 Deterministic heuristics and generative AI are not separated clearly enough

The score is calculated locally, while coaching uses Gemini when authenticated and a local fallback otherwise. The Coach UI exposes “AI Active” versus “Local Fallback”, which is a good start, but individual recommendations do not consistently state whether they came from a rule, job text or model inference.

**Fix:** every result carries a provenance label:

- **Document fact** — directly parsed, with source excerpt.
- **Rule check** — deterministic rule and version.
- **Model suggestion** — generated text, requiring user verification.
- **Unknown** — insufficient evidence.

## 3.2 Recommendations do not use a mandatory evidence contract

The provider prompt asks the model not to invent metrics and to state uncertainty. Prompt text is not a product guarantee. The UI must enforce the response shape.

**Fix:** require structured output for every recommendation: observation, exact source, proposed change, expected recruiter impact, confidence, uncertainty and `requires_user_confirmation`. Reject or downgrade output with missing evidence. Never let generated achievements or numbers enter the resume without explicit confirmation.

## 3.3 No AI evaluation suite exists

There is no versioned set of resumes/JDs with recruiter-approved expected behaviour, hallucination checks, bilingual quality checks, prompt-injection cases, bias review or regression thresholds.

**Fix:** build an evaluation set of at least 100 anonymised/synthetic cases across seniority, function, language, career gaps and non-traditional backgrounds. Track evidence precision, unsupported-claim rate, actionability, recruiter agreement and bilingual consistency by prompt/model version.

## 3.4 No streaming or recoverable partial state

The provider call is bounded and timed out, but the experience waits for a complete answer. A timeout loses the value of partial generation and gives no retry scope.

**Fix:** stream sectioned responses, show current phase, persist the user prompt immediately, allow retry for the failed response only, and preserve a deterministic fallback. Streaming must not imply factual certainty.

## 3.5 Privacy explanation is incomplete at the moment of AI use

The product says resume parsing occurs locally, but AI coaching sends a bounded resume context to a provider. Those are materially different privacy behaviours.

**Fix:** immediately before first AI request, preview the exact context fields being sent, identify the provider category, link retention terms, and offer “continue without sending CV context”. Store consent version and timestamp.

---

# 4. Biggest ATS credibility mistakes

## 4.1 “ATS score” implies a universal system that does not exist — critical

Commercial ATS products parse, index and filter differently. A single CareerForge number cannot predict “the ATS”. The current cap/range/confidence model is more honest than a raw score, but the name still overclaims.

**Fix:** split the concept into:

- **Parseability check:** Pass / Warning / Unable to verify.
- **Resume evidence quality estimate:** 0–100, rubric-based.
- **Target-role alignment estimate:** 0–100 only with a sufficiently detailed JD.

Never call a baseline resume score a job-specific ATS score.

## 4.2 Unknown experience duration is fabricated as 1.5 years — critical

When two four-digit years cannot be extracted, each experience entry adds 1.5 years. This can materially inflate experience alignment, including overlapping or undated roles.

**Fix:** unknown must remain unknown. Parse month/year ranges, present/current roles and overlaps. Ask the user to confirm ambiguous dates. Exclude unverified duration from the score and lower confidence.

## 4.3 Document length is treated as structure evidence

`rawLength` between 300 and 7000 receives structure points and is described as potentially fitting one or two pages. Character count does not prove pagination, column order, tables, headers, footers, text boxes, font size or OCR quality.

**Fix:** inspect the original document layout. Record extraction coverage, reading order, number of pages, columns/tables, text-as-image and header/footer loss. If only pasted text exists, report visual compatibility as **Not evaluated**.

## 4.4 Metric detection is too permissive

The impact regex accepts generic two-digit numbers. Years, team identifiers or unrelated counts can become “measurable impact”. A number is not automatically an outcome.

**Fix:** detect action + metric + affected object + result context. Classify evidence as outcome, scale, scope or date. Dates and version numbers receive no impact credit. Show the exact sentence counted.

## 4.5 More experience entries automatically score better

Two positions receive a five-point bonus and one position is described as “little career progression”. That penalises students, early-career candidates, long-tenure employees and returners without recruiter justification.

**Fix:** score the quality and relevance of available evidence, not number of employers. Adjust expectations by declared career stage. Never infer weak progression from one role alone.

## 4.6 Keyword scoring rewards list length

Up to ten points come from the number of unique skills, even without a target JD. This encourages keyword accumulation. Substring matching also creates false positives (`C` inside longer strings, broad terms inside unrelated phrases).

**Fix:** baseline analysis should check skill evidence, not quantity. Job-specific coverage must use token/alias boundaries, required/preferred classification, recency and evidence location. A listed but unsupported skill cannot equal a demonstrated skill.

## 4.7 Required/preferred classification is brittle

The system examines roughly 80 characters around a skill and looks for words such as “must” or “required”; if nothing is required it assigns the first 60% of extracted skills as required. This creates invented requirements.

**Fix:** preserve JD section hierarchy and list structure. If classification is ambiguous, mark it unknown and let the user correct it. Never turn list order into requirement strength without evidence.

## 4.8 Language and location checks are shallow

Mentioning “English” anywhere in the CV can satisfy an English requirement. Remote roles are assigned full location compatibility regardless of country, timezone, work authorisation or remote region.

**Fix:** separate language level, work authorisation, country, timezone and work mode. Only evaluate dimensions explicitly present in both candidate and job data; otherwise show Not evaluated.

## 4.9 Score caps are calibration policy, not validation

Low/medium/high confidence caps (48/76/92 for resume; 65/82/93 for match) prevent impressive but absurd numbers. They do not demonstrate correlation with ATS parsing or recruiter decisions.

**Fix:** calibrate on a labelled corpus, publish sample size and error measures, and version thresholds. Until then label the score “beta estimate” and avoid claims about interview probability.

---

# 5. Features that should be merged

| Current features | Merge into | Product behaviour |
|---|---|---|
| Analysis + Resume editor + versions + export | **Resume Workspace** | Findings are anchored to resume text; changes show diff and rubric delta; target job remains visible. |
| Job matching + saved jobs + applications + stages | **Application Pipeline** | Each application owns a JD, company, resume version, evidence gaps, dates and interview plan. |
| Coach + Roadmap | **Career Assistant** | The assistant uses the active application or user goal; learning actions exist only when tied to evidence gaps. |
| Dashboard + Activity | **Today** | One priority, upcoming deadlines and factual change history. |
| Settings + Profile + Sync | **Account & Data** | Identity, locale, sync, export, deletion, consent and provider use in one place. |
| Forge history + backups + resume versions | **Version history** | One understandable revision model instead of three overlapping histories. |

The merged experience should use one shared entity: `ApplicationWorkspace`. It contains candidate profile, source resume, target job, role-specific resume versions, findings, tasks, application stage, events and interview material.

---

# 6. Features that should be removed or hidden

1. **Standalone Roadmap navigation:** hide until plans are contextual and evidence-backed.
2. **Generic ATS ≥80 weekly goal:** remove; it encourages score gaming.
3. **Applicant counts and fictional application links:** remove outside explicit sample mode.
4. **Standalone job-marketplace framing:** remove until jobs come from a real, attributable source.
5. **Pro pricing card:** remove for beta, or implement actual billing and entitlements.
6. **Unsupported “career score”, “recruiter score” or “interview readiness” concepts:** do not add; remove anywhere they cannot be decomposed into verified signals.
7. **Duplicate landing showcases:** keep one interactive proof and one methodology section.
8. **“Add skill” as a one-click resume action:** replace with “Provide evidence” or “Mark not applicable”.
9. **Generic coach welcome/filler messages in saved history:** store user work, not decorative seed content.
10. **Animated metric emphasis where evidence is weak:** uncertainty should be visually stronger than animation.

---

# 7. Features that should be redesigned

## Resume analysis

Use a finding queue rather than a wall of cards. Findings are ordered by blocking severity and target relevance. Selecting one highlights the source text. Actions are Apply draft, Edit, Dismiss with reason, or Need evidence. Dismissals improve future recommendations.

## Job matching

Replace one dominant percentage with a coverage matrix: Required, Preferred, Evidence, Experience, Location/work authorisation, Language. Each row is Match, Gap, Unknown or Not applicable. Show the estimate only as a secondary summary.

## Application tracking

Every application stage transition should record date, note, next follow-up and linked resume version. “Applied” without a version and date is incomplete. Add outcome capture so the product can learn which recommendations are useful.

## Coach

Default to the current workflow context rather than an empty chat. Offer three actions: prepare interview, improve evidence, plan follow-up. Answers should be structured into evidence, recommendation, example and uncertainty. Preserve citations to the resume/JD.

## Sync conflict

Use calm copy and a comparison, not a technical conflict warning. Suggested title: **“İki farklı çalışma alanı bulundu”**. Body: **“Bu cihazdaki ve hesabınızdaki çalışmalar farklı zamanlarda güncellenmiş. Devam etmek istediğiniz sürümü seçin; diğer sürümü 30 gün boyunca yedek olarak saklayacağız.”** Show last updated time, record counts and Preview. Offer Keep device, Keep account, or Review and merge. Do not force a blind destructive choice.

## Account deletion

Provide Delete CareerForge account as a server-side, re-authenticated action covering app data and auth identity. State the retention/deletion window and send confirmation. Client-side table deletion is not sufficient proof of complete erasure.

---

# 8. New user journey

## First session

1. **Landing:** one promise—prepare a truthful, role-specific application.
2. **Import resume:** PDF/DOCX/TXT or paste. Explain local parsing and unsupported formats.
3. **Extraction review:** user confirms name, dates, roles, skills and parsing ambiguities. No score yet.
4. **Set target:** paste JD/URL or choose target role. “No target yet” remains available but produces only baseline checks.
5. **First result:** show three highest-impact, evidence-backed findings; show unknowns before the estimate.
6. **Value checkpoint:** user applies/edits one recommendation and sees the exact diff.
7. **Account prompt:** “Save this workspace across devices.” Explain sync and AI data use.
8. **Export or add application:** save a named resume version to the target application.

## Returning session

1. Open **Today**.
2. See one priority derived from stage/deadline/user goal.
3. Enter the active application workspace.
4. Complete the action—e.g. verify date, add evidence, follow up, or prepare interview.
5. Record outcome. Dashboard updates with factual progress, not gamified score pressure.

## Failure path

- Parsing failure offers paste/manual entry and explains what was unreadable.
- Insufficient JD shows which dimensions are unavailable.
- AI failure preserves deterministic findings and allows retry.
- Sync conflict preserves both versions until the user confirms.
- Export failure never marks the task complete.

---

# 9. New information architecture

```text
Public
├── Product / Methodology
├── Privacy & Terms
└── Sign in

Workspace
├── Today
│   ├── Next action
│   ├── Deadlines
│   └── Recent outcomes
├── Applications
│   ├── Pipeline
│   └── Application workspace
│       ├── Target job
│       ├── Resume & findings
│       ├── Versions & export
│       ├── Application events
│       └── Interview preparation
├── Career Assistant
│   ├── Contextual coaching
│   ├── Evidence-gap plan
│   └── Goals
└── Account & Data
    ├── Profile
    ├── Sync
    ├── AI consent
    ├── Export
    └── Deletion
```

On mobile, use Today, Applications and Assistant as the three primary destinations. Account belongs in the profile menu. Do not expose editing modes as navigation items.

---

# 10. Realistic ATS scoring model

There should not be one universal “ATS score”. Use three separate evaluations.

## A. Parseability check — no numeric score

- Text extraction coverage
- Reading order
- Section detection
- Columns/tables/text boxes
- Header/footer contact loss
- OCR or text-as-image
- Unsupported font/symbol risk

Output: **Pass**, **Warning**, **Unable to verify**. Pasted text cannot receive a visual parseability pass.

## B. Resume evidence quality estimate — 100 points

| Category | Weight | What earns credit |
|---|---:|---|
| Contact and identity completeness | 10 | Required contact fields, valid structure, professional links where relevant |
| Section completeness and chronology | 15 | Role-appropriate sections, confirmed dates, no unexplained parser gaps |
| Experience clarity | 20 | Clear role/company/dates; concise action and scope |
| Evidence and outcomes | 20 | Verifiable outcome/scope metrics in context, not numbers alone |
| Skill evidence | 15 | Skills supported in work/projects, with recency where available |
| Readability | 10 | Scannable bullets, sensible density and consistent structure |
| Role positioning | 10 | Summary and evidence aligned to the user-declared role family |

Career-stage expectations must change the rubric. Missing information reduces confidence rather than automatically implying poor quality.

## C. Target-role alignment estimate — 100 points, only with a JD

| Category | Weight | Rule |
|---|---:|---|
| Confirmed required qualifications | 35 | User-verifiable required signals only |
| Preferred qualifications | 10 | Separate from required |
| Evidence depth and recency | 20 | Skill appears in credible recent context |
| Experience scope/seniority | 15 | Confirmed duration and responsibilities; no fabricated duration |
| Domain/product context | 10 | Relevant industry/problem evidence |
| Logistics | 10 | Location, work authorisation, work mode and language when explicitly known |

## Confidence and missing data

Confidence is independent of quality:

- **High:** document layout inspected, extraction confirmed, detailed JD, dates verified, at least four evidence-bearing experience/project records.
- **Medium:** text extraction is good but one major dimension is missing or inferred.
- **Low:** pasted/partial text, ambiguous dates, sparse JD or fewer than three reliable evidence signals.

Low-confidence output should be a range and should not exceed 70. “Unknown” dimensions are excluded and disclosed; they are never silently treated as zero or a positive default.

## Why 68 rather than 74

Every result needs a delta ledger, for example:

```text
Base rubric result                         74
Unverified employment dates               -4
Two required skills listed without proof  -5
Strong quantified outcome with context    +3
Final evidence-quality estimate            68
Range                                   62–72
Confidence                              Medium
```

After an edit, show only changes caused by that edit. Never imply that adding keywords guarantees screening or interviews.

## Validation requirement

Before calling the model production-grade, compare outputs against:

- parser results from multiple representative ATS/import systems where legally and technically feasible,
- at least two independent recruiter labels per case,
- false-positive and false-negative rates by category,
- inter-rater agreement,
- score stability after irrelevant wording changes,
- subgroup fairness checks.

---

# 11. Recruiter-approved feedback model

Each recommendation must follow this contract:

1. **Observation:** neutral, specific and non-judgmental.
2. **Evidence:** exact resume/JD excerpt and location.
3. **Recruiter interpretation:** what a recruiter can and cannot conclude.
4. **Action:** smallest truthful improvement.
5. **Expected impact:** scanability, evidence strength or role alignment—not “get hired”.
6. **Confidence:** high/medium/low with reason.
7. **Uncertainty:** missing context and alternative interpretation.
8. **Verification:** user confirms facts before application.

Example:

> **Observation:** “Yönettim” describes responsibility but not scale or outcome.  
> **Evidence:** Experience → Acme → bullet 2: “Satış projelerini yönettim.”  
> **Recruiter interpretation:** The scope, your individual contribution and result are unclear. This does not mean the work lacked impact.  
> **Action:** If true, add project scope and a verified business result: “Three regional campaigns…”  
> **Expected impact:** Makes ownership and scale easier to assess.  
> **Confidence:** High—the source sentence is explicit.  
> **Needs confirmation:** project count and result must come from the user; CareerForge must not generate them as facts.

Prohibited language includes “guaranteed interview”, “ATS-approved”, “recruiters will love”, “perfect fit”, “you fully meet the experience requirement” when dates are inferred, and any invented benchmark presented as industry fact.

---

# 12. AI transparency model

## Result-level transparency

Every AI-assisted result displays:

- context used: resume version, target JD and user answers;
- context not available;
- deterministic rubric version and model version separately;
- provenance for every claim;
- confidence and estimated range;
- “Report incorrect feedback” action;
- “Do not use this suggestion” and reason capture.

## Data transparency

Before first provider call:

- show the exact context payload in plain language;
- distinguish local parsing from provider processing;
- obtain versioned consent;
- offer context-free coaching;
- document retention/deletion and third-party boundaries.

## Safety rules enforced in product, not only prompts

- Structured response schema.
- No generated numeric achievement can be applied without confirmation.
- No sensitive attribute may be used to rank candidate suitability.
- No interview probability or hiring prediction without validated data and legal review.
- Prompt-injection delimiters plus output validation and logging.
- Timeout, retry, quota and provider-status UI.
- Human-readable audit trail when a suggestion changes the resume.

---

# 13. Priority roadmap

## Critical — before any public launch

1. **Fix all landing contrast failures.** Acceptance: zero serious WCAG A/AA violations on desktop and mobile for every public/product route.
2. **Remove fabricated duration and other positive defaults.** Acceptance: unknown dates, logistics and requirements never add score; tests cover overlaps, present roles and ambiguity.
3. **Rename/split ATS outputs.** Acceptance: parseability, evidence quality and target alignment are distinct; no universal ATS claim.
4. **Make demo mode unmistakable.** Acceptance: no fictional applicant count, salary, expiry or apply link appears as live data.
5. **Ship one complete core-flow E2E test.** Acceptance: import → confirm extraction → select target → review finding → edit/undo → save version → add application → export.
6. **Verify production Supabase and RLS.** Acceptance: integration tests prove cross-user isolation, unauthenticated denial, quota enforcement, sync and deletion against a staging project.
7. **Add production observability.** Acceptance: error tracking, structured logs, health checks, AI latency/error/rate metrics and alert ownership.
8. **Clarify privacy at AI boundary.** Acceptance: informed consent and exact-context preview before first provider request.

## High — before paid launch

1. Merge Analysis + Resume into Resume Workspace.
2. Merge Jobs + tracker into Application Pipeline.
3. Merge Coach + Roadmap into contextual Career Assistant.
4. Replace dashboard score goals with stage/deadline priorities.
5. Build recruiter-labelled ATS/feedback evaluation corpus and regression suite.
6. Implement complete account deletion and re-authentication.
7. Add real billing/entitlements or remove Pro pricing.
8. Add real job import with source attribution, freshness and failure states.
9. Test sync conflicts, offline recovery, provider failure and file parsing across representative documents.

## Medium — after beta signal

1. Outcome capture and recommendation usefulness feedback.
2. Recruiter evidence review panel and calibration dashboard.
3. Streaming coach with recoverable partial responses.
4. Contextual interview packs linked to application stage.
5. Bias/fairness review across career stage and non-traditional profiles.
6. Performance budgets and real-user monitoring.

## Low — only if metrics justify it

1. Broader career learning catalogue.
2. Additional resume templates.
3. Decorative motion and dashboard visualisation.
4. Marketplace-style discovery filters.
5. Social proof, streaks or gamification.

---

# 14. Final score

These are current-state scores, not aspirational scores. A 10/10 is not credible without real-user outcomes, scoring validation and production evidence.

| Category | Score | Reason |
|---|---:|---|
| **UI** | **7.6/10** | Strong editorial system and coherent components, but the hero mockup still has serious desktop contrast failures and some information density remains demo-led. |
| **UX** | **6.7/10** | Good empty states, responsive shell and accessible app routes; weak task continuity and too many competing destinations. |
| **Product** | **5.9/10** | Ambitious feature set but no singular outcome, return loop, validated paid proposition or real job supply. |
| **ATS Credibility** | **5.2/10** | Versioned rubric, caps, ranges and confidence are meaningful improvements; unsupported duration, keyword, impact and structure heuristics remain launch-blocking. |
| **HR Realism** | **5.4/10** | Advice generally avoids outright invention, but the scoring model still makes recruiter-significant assumptions and rewards proxy signals. |
| **AI Trustworthiness** | **6.6/10** | Auth, schema validation, quota, timeout, prompt-injection boundary and model/fallback state are good; no structured evidence contract, consent checkpoint or AI eval suite. |
| **Simplicity** | **5.3/10** | Six workspace destinations, duplicate resume tools and a long landing page expose product breadth rather than a guided workflow. |
| **User Journey** | **5.8/10** | Many safe entry points but no single end-to-end, automatically sequenced application journey or verified outcome loop. |
| **Portfolio Value** | **8.1/10** | Memorable full-stack scope, real remediation work and strong engineering hygiene. The project becomes significantly stronger if presented as a trust/calibration case study rather than a finished ATS competitor. |
| **Production Readiness** | **6.2/10** | Build/lint/type/unit foundations, CI, RLS and AI protection exist. One E2E accessibility failure, narrow coverage, no production integration evidence, two moderate dependencies and no observability prevent launch confidence. |

**Unweighted overall:** **6.3/10**

## Hiring-committee view

For a frontend/product-engineering role, this project can earn an interview because it demonstrates product breadth, state management, local/cloud architecture, security remediation, bilingual UI, automated quality gates and a coherent visual system. It will not prove senior backend, ML/AI evaluation or ATS-domain expertise by itself.

The memorable case-study story is not “I built an AI career super-app.” That claim invites comparison with products backed by proprietary datasets and years of recruiter calibration. The stronger story is: **“I audited an over-broad AI career prototype, removed fabricated trust signals, secured its AI/data paths, introduced explainable uncertainty and redesigned it around one evidence-backed application journey.”** Show before/after metrics, failed assumptions, test evidence and what remains unvalidated. That demonstrates senior judgement.

## Final launch decision

Do not launch this as a premium ATS competitor yet. Launch it as a clearly labelled beta only after the critical list is complete. The interface is ahead of the product model; the next gains will not come from more polish or more features. They will come from fewer destinations, stricter unknown handling, recruiter-labelled validation and one complete application outcome loop.
