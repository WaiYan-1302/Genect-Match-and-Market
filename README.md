# GENECT Buddy Platform

## Repository status

This repository now contains a **frontend demonstration of the proposed GENECT Buddy Platform**. It replaces the earlier Marketplace page while preserving GENECT's warm visual identity.

The demo uses dummy data and browser-local React state. It demonstrates product layout and interaction states only; it is not connected to a Buddy backend or live service.

| Area | Current repository | Proposed Buddy Platform |
| --- | --- | --- |
| Product | Interactive Buddy family dashboard demo | Intergenerational companionship platform |
| Data | Hardcoded Buddy dummy data | Separate Buddy Supabase project using dummy data until approval |
| Authentication | Demo account presentation only | Family, companion, staff, and relationship-aware access |
| Matching | Staff-confirmed match shown in UI | Persisted staff-curated matching workflow |
| Communication | Local demo chat and permission states | Authorized match-scoped gradual communication |
| Visits | Approved-venue selection and eligibility UI | Server-validated venue booking and visit records |
| Updates | Dummy family update feed | Visit reports and consent-aware family updates |
| Billing | Not implemented | Proposed recurring Stripe Billing subscriptions |
| Languages | English/Japanese switch with inline demo copy | Centralized, complete localization required |

For the proposed product experience, see [DESIGN.md](./DESIGN.md). For verified backend status and the proposed architecture, see [BACKEND.md](./BACKEND.md).

## Product purpose

GENECT Buddy is intended to connect older adults with vetted and trained companions for intergenerational companionship. A family member can register an older adult, manage a membership, and receive updates after visits.

The baseline proposed workflow is:

1. Family registration and older-adult profile.
2. Companion application, vetting, and training.
3. Staff-confirmed matching.
4. Gradual communication between matched participants.
5. Scheduling at a predesignated GENECT-approved venue.
6. Companion visit report.
7. Family update, with photos only when the required consent is recorded.

Matching starts as a manual, admin-curated workflow. No automated matching algorithm is proposed for the initial version.

Visits cannot be scheduled at an arbitrary address or personal home. Community centers, university spaces, and partner cafes are examples of possible venue types, not confirmed partners.

## Safety and dummy-data boundary

The Buddy guide requires dummy data until the GENECT Board approves the trust and safety policy. Documentation work can proceed now, but development and testing must not use real participant information.

Until approval:

- Do not onboard a real family, older adult, or companion.
- Do not schedule a real visit.
- Do not store real health, routine, or emergency-contact data.
- Do not upload real participant photos or communication media.
- Do not claim production, pilot, legal, insurance, safeguarding, consent, or underage-participation readiness.

Use clearly fictional names, contact details, venues, conversations, health considerations, and billing identities. Stripe work, when approved for development, must use test mode.

## Current implementation

ID capture is available from **My Page → Start ID capture**, or `/identity` (`?lang=ja` for Japanese). It provides a card outline, angled edge photo, a six-second up/down video, review/retake and camera error handling. Captures remain in the tab; use sample cards only. Thickness and motion are reviewed visually, not automatically authenticated. See [ID_CAPTURE.md](./ID_CAPTURE.md) for research, browser requirements and limitations.

The code currently provides a responsive family-facing Buddy demo with:

- Overview, Connection, Messages, Visits, and My Page destinations
- Persistent desktop sidebar and mobile bottom navigation based on the former Buddy layout pattern
- English and Japanese interface switching
- A staff-confirmed dummy match between an older adult and companion
- Pair-level connection progress and two interactive shared prompts
- Communication permission and optional-photo states
- Local demo messaging with guardian sender-attribution guidance
- Approved-venue selection and meeting-eligibility checks in the UI
- Family updates, membership, profile, accessibility, and support panels
- Responsive layouts, visible focus, reduced-motion support, and accessible status notifications

The code does **not** currently provide:

- Authentication or accounts
- Persisted older-adult profiles
- Companion application, training, or approval workflows
- Staff matching tools
- Persisted chat or verified guardian access
- Server-calculated connection progress or persisted consent
- Server-validated venue booking
- Persisted visit reports or family updates
- Private media storage
- Recurring subscriptions
- Email delivery
- Production localization infrastructure beyond the inline demo dictionary
- Buddy-specific database tables or authorization policies

All current Buddy actions are demonstrations. They do not create durable backend records.

## Proposed Buddy requirements

The proposed Buddy Platform includes:

- Family-to-older-adult relationships with explicit permissions
- Companion states beginning with `applied -> in_training -> approved -> inactive`
- Manual staff matching
- Guardian-to-minor relationships that require secure verification
- Actual sender attribution for every message
- Pair-level connection progress with deduplicated server-side events
- Optional photo disclosure and consent-controlled media
- Approved-venue scheduling with server-side eligibility and capacity validation
- Visit reports and permission-aware family updates
- Reports, blocks, suspensions, and audit history
- Community, Bridge Standard, and Bridge Premium memberships through recurring billing

Membership prices, exact entitlements, and restrictions are not finalized.

### Connection progress proposal

The initial configurable hypothesis is:

```text
P = min(60, 20S + 10A)
```

- `S` is qualifying reciprocal conversations, capped at 3.
- `A` is jointly completed introduction prompts, capped at 2.
- `P` is pair-level connection progress.

Progress is not a trust or safety score. It does not replace consent, companion approval, staff confirmation, guardian requirements, venue eligibility, blocking, or suspension.

Proposed feature thresholds are 0 for text and an illustrated avatar, 20 for optional personal photo disclosure, 30 for image sharing, 40 for videos up to 25 MB, and 60 for requesting a call or approved-venue meeting. Mutual permission is required where applicable. Photo disclosure remains optional and refusing media must not prevent text progress.

Guardian-authored messages must display the guardian as the actual sender and must not count as the underage participant's progress.

See [DESIGN.md](./DESIGN.md) and [BACKEND.md](./BACKEND.md) for the complete proposed behavior and validation rules.

## English and Japanese requirement

Every user-facing Buddy interface must support English and Japanese, including navigation, forms, dashboards, chat labels, guardian disclosures, progress explanations, consent, venue booking, validation, loading and empty states, notifications, transactional email, and safety text.

The implementation should use centralized translation keys, consistent terminology, a language switch, and persistent language preference. This requirement does not automatically translate user-authored messages; they remain in their original language unless translation is separately specified.

## Proposed architecture

The Buddy guide proposes:

- Next.js for pages and protected server workflows
- A separate Buddy Supabase project for Auth, Postgres, and private storage
- Stripe Billing for recurring subscriptions
- An email provider that has not yet been selected
- GitHub and Vercel, subject to actual repository and project configuration

The current Marketplace schema is not a Buddy schema and should not be deployed as one. Roles, guardian links, companion approval, progress, consent, venue eligibility, billing state, and publication decisions must be validated server-side and must not be trusted from browser input.

No GitHub repository linkage, Vercel project, Buddy Supabase project, Stripe account, or email provider is configured or verified in this folder.

## Local setup for the current Buddy frontend demo

The commands below match the scripts and environment-variable names currently present in the repository. Dependencies and a lockfile are present.

### Prerequisites

- Node.js and npm

The earlier project documentation recommended Node.js 20 or newer, but `package.json` does not currently enforce a Node version.

### Install and run

```powershell
npm.cmd install
npm.cmd run dev
```

Open the `Local` URL printed by Next.js (usually `http://localhost:3000`). If port 3000 is occupied, choose one explicitly with `npm.cmd run dev -- -p 3001`.

On this Windows setup, Node can read the project under `Documents` but cannot create Next.js output there. The `dev` script mirrors the app source into a dedicated folder under Windows Temp and starts Next.js there. It watches `app`, `components`, `lib`, and `public` for edits. It reads `.env.local` from this project into the process environment without copying that file. `npm.cmd run dev:direct` is available when Node can write in the project folder. Running `npx.cmd next dev` bypasses the working `dev` script.

The current UI uses hardcoded Buddy dummy data, so Supabase credentials are not required to view the prototype. The existing optional browser client reads:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do not put a Supabase service-role key, Stripe secret key, webhook secret, or other server credential in a `NEXT_PUBLIC_` variable.

### Declared scripts

```powershell
npm.cmd run dev
npm.cmd run dev:direct
npm.cmd run build
npm.cmd run start
npm.cmd run lint
```

These scripts are declared in `package.json`. The `dev` script serves both `/` and `/identity` on the protected Windows setup. TypeScript checking and a production build from a writable copy pass. A production build in the protected project folder is still blocked by its write restriction; run the build from a writable copy or deployment environment. There is currently no automated test script or test suite. The legacy `next lint` script still requires replacement with a supported lint configuration.

### Existing SQL

`supabase/schema.sql` belongs to the Marketplace prototype. It has incomplete policies and must not be treated as production-ready or as the Buddy Platform schema. Do not apply it to a proposed Buddy Supabase project.

## Dummy-data development and testing

Before Board approval, all Buddy prototypes should use synthetic fixtures designed to exercise:

- Family and older-adult relationships
- Companion application and staff-controlled status transitions
- Manual match confirmation
- Guardian linking, visibility, revocation, and sender attribution
- English and Japanese UI and notifications
- Progress-event timing, caps, and deduplication
- Optional photo disclosure and withdrawn permissions
- Blocks and suspensions overriding communication
- Approved venue hours, closures, capacity, and conflicting reservations
- Visit reports and consent-controlled family updates
- Private media authorization and the 25 MB video limit
- Subscription behavior in provider test mode

Dummy fixtures must not be copied from real participant submissions. Test screenshots and exported datasets should also remain synthetic.

## Known limitations

- The repository implements a Buddy frontend demo, not the proposed backend workflows.
- No automated application test suite is present.
- The folder is not currently a Git working tree.
- The demo is concentrated in one large client component and should be decomposed before production work.
- Existing Supabase code is unused and the SQL policies are incomplete.
- No live service or deployment configuration has been verified.
- Research files named `Genect Design Research 1.md` and `technology_and_trust_and_safety_report.pdf` were not available during this update.

## Unresolved decisions

- Minimum participant age and eligibility
- Who underage participants may match with
- Guardian consent requirements for media, calls, and meetings
- Guardian verification, multiple guardians, revocation, and adulthood transitions
- Retention of guardian-authored messages and access history
- Whether the older adult, family representative, or both participate in chat
- Whether older adults require accounts
- Companion rejection, withdrawal, reactivation, expiry, and retraining rules
- Exact membership pricing, entitlements, and restrictions
- Contact-sharing detection or moderation in text chat
- Whether any guardian-assisted progress bypass should exist
- Progress behavior after unmatching and rematching
- Consent evidence, expiry, withdrawal, and retention
- Venue approval criteria and confirmed venue partners
- Visit cancellation, no-show, incident, and emergency procedures
- Email delivery provider
- Final trust and safety, privacy, legal, insurance, and safeguarding policy

## Reference material

- GENECT Buddy Platform Guide (local reference, not included in this repository) - baseline workflow and delivery guide; newer requirements in this repository supersede its home-visit assumption.
- The former Marketplace implementation - visual identity reference only; its shopping experience has been removed from the active page.
- `Genect Design Research 1.md` - requested but not found during this audit.
- `technology_and_trust_and_safety_report.pdf` - requested but not found during this audit.

Research recommendations, when available, should be recorded as proposals rather than approved policy or verified legal conclusions.
