# GENECT Buddy Platform - Backend Architecture

## Document status

This document separates verified repository behavior from the proposed Buddy Platform architecture.

- **Implemented now:** a frontend-only GENECT Buddy experience using dummy data and local React state, plus an unused legacy Marketplace-oriented Supabase client and schema.
- **Proposed:** the Buddy Platform backend described below. Its entities, authorization, persistence, booking integrity, billing, and safety workflows are not implemented in this repository.

The latest product requirements take priority over conflicting assumptions in the Buddy guide. Visits are proposed only at predesignated GENECT-approved venues, not at personal homes.

## Verified implementation inventory

### Application

- Next.js App Router with the dashboard at `app/page.tsx` and local ID capture at `app/identity/page.tsx`.
- ID capture stores photos and a silent movement clip in browser memory only; there is no upload or identity-approval backend. See [ID_CAPTURE.md](./ID_CAPTURE.md).
- One large Buddy client component at `components/BuddyPlatform.tsx`.
- Overview, Connection, Messages, Visits, and My Page navigation.
- Hardcoded Buddy participant, match, update, membership, and approved-venue dummy data.
- Local React state for language, prompts, progress presentation, photo permission, messages, venue selection, support, and notifications.
- Frontend-only demonstrations of a staff-confirmed match, gradual communication permissions, guardian sender guidance, approved venues, and meeting eligibility.
- No Buddy authentication, database persistence, verified guardian linking, staff workflow, real reservation, private storage, billing, or notification delivery.

### Supabase client

`lib/supabase.ts` creates a browser client using:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The helper returns `null` if either variable is absent. It is not imported by the application. There is no server Supabase client, session middleware, generated database types, or implemented authentication flow.

### Existing schema

`supabase/schema.sql` is Marketplace-oriented. It defines profiles, sellers, categories, listings, listing images, favorites, orders, order items, and messages. It does not model the Buddy Platform.

Its RLS policies are incomplete even for the Marketplace: profiles, listing images, orders, and order items lack normal client access paths; seller onboarding and administration are absent; and listing moderation can be bypassed once a seller exists. This schema must not be reused as proof that Buddy authorization exists.

### Tooling and deployment

- Dependencies and a package lockfile are present.
- No automated tests, lint configuration, CI configuration, or deployment configuration is present.
- This folder is not a Git working tree.
- No GitHub, Vercel, Supabase, Stripe, or email integration has been verified.

## Readiness boundary

Until the GENECT Board approves the trust and safety policy, all Buddy development and testing must use dummy data only.

Do not onboard real families, older adults, or companions; store real sensitive records; or schedule real visits. Documentation can proceed. The repository must not be described as production-ready, legally compliant, insured, approved for underage use, or equipped with finalized consent procedures.

## Proposed stack

The Buddy guide proposes:

- **Next.js:** application pages and protected server workflows
- **Separate Buddy Supabase project:** Auth, Postgres, and private file storage
- **Stripe Billing:** recurring subscriptions
- **Email provider:** not yet selected
- **GitHub and Vercel:** version control and deployment, subject to actual setup

The Buddy Supabase project should remain separate from the Marketplace project because Buddy handles different roles, relationships, communication, and sensitive information.

The guide names Community, Bridge Standard, and Bridge Premium memberships. Exact prices, entitlements, eligibility effects, and restrictions remain unresolved and must not be encoded from assumptions.

## Proposed conceptual data model

Names below are conceptual, not migrations or committed schema names.

### Identity and access

#### Accounts

Authentication identities and account-level settings such as status, preferred language, and accessibility preferences.

#### Role assignments

Explicit assignments such as family member, companion applicant, approved companion, staff, or administrator. Sensitive authorization must not rely only on a role string supplied by the browser.

#### Family-to-older-adult relationships

Records how a family member relates to an older adult and which permissions have been granted. Payer, supporter, update recipient, and profile manager should be explicit capabilities rather than assumed synonyms.

#### Guardian-to-minor relationships

Verified, revocable links between a guardian account and an underage participant. The record should include relationship status, verification evidence reference, effective period, scopes, who approved it, and an audit trail.

A guardian link must not be created merely because an adult claims the relationship.

### Companion pipeline

#### Companion applications

Application data and current workflow status. The baseline proposed transitions are:

```text
applied -> in_training -> approved -> inactive
```

Only authorized staff can transition these states. Rejection, withdrawal, reactivation, retraining, and approval expiry require product decisions before implementation.

#### Training and approval records

Separate evidence and staff decisions supporting eligibility. An `approved` value alone should not erase who approved it, when, against which training version, or why it later changed.

### Matching and conversation

#### Matches

Staff-curated relationships between eligible participants. A match should record status, staff confirmation, effective period, closure reason, and safety restrictions.

No automated matching algorithm is proposed for the initial version.

#### Conversation participants

The accounts and represented participant relationships authorized for a conversation. This enables an older adult, family representative, and guardian to have explicit, different participation rules if the product later approves them.

#### Messages

Every message records:

- The actual authenticated sender account
- The conversation
- Any represented participant relationship, separately
- Server timestamp
- Original user-entered language/content
- Message status and moderation metadata as authorized

If Aaron writes, the author is Aaron. If Aaron's mother writes, the author is Aaron's Guardian / Aaronの保護者. The guardian's message must never be stored or displayed as Aaron's message.

Guardian-authored messages do not count as the underage participant's progress activity.

### Connection progress and permissions

#### Connection progress

Pair-level derived state for a match. It is not a wallet, safety score, reputation score, or proof of trustworthiness.

The initial configurable proposal is:

```text
P = min(60, 20S + 10A)
```

- `S`: qualifying reciprocal conversations, capped at 3
- `A`: jointly completed introduction prompts, capped at 2
- `P`: connection progress

The formula is a usability hypothesis, not an approved safety policy.

#### Progress events

Store or derive deduplicated events rather than accepting a progress total from the browser. A progress event should have a stable uniqueness key tied to its match and source messages or prompt.

A qualifying conversation requires at least two nonempty messages from each matched participant:

- Trimmed empty messages do not count.
- Length earns no extra credit.
- One-sided messages do not qualify.
- Guardian messages do not count for the linked minor.
- One message cannot contribute to multiple qualifying-conversation events.
- Retries and duplicate delivery cannot create duplicate progress.

The proposed qualification timestamp is the server `created_at` of the message that first completes two eligible messages from each participant in the current candidate window. After an event qualifies, the next candidate window begins exactly four hours after that timestamp. Messages earlier than the new window are not reused.

Each jointly completed introduction prompt can produce one event after both matched participants submit an eligible answer. Answers do not need to agree. Prompt responses from a guardian must not silently substitute for the minor's response.

#### Proposed thresholds

| Progress | Available capability |
| ---: | --- |
| 0 | Text chat, interests, introduction, illustrated avatar |
| 20 | Each participant may choose to reveal their own profile photo |
| 30 | Image sharing, with mutual permission |
| 40 | Video sharing, with mutual permission and a 25 MB maximum per video |
| 60 | Request a call or request an approved-venue meeting |

Two conversations plus two prompts reach 60. Three conversations alone reach 60.

Progress unlocks the option to act. It does not itself grant consent, reveal a photo, authorize media, begin a call, or permit a meeting.

#### Communication permissions and consent

Maintain explicit, revocable records for photo disclosure, image sharing, video sharing, calls, meeting requests, visit photos, and family updates as required by policy.

Photo disclosure is optional. Refusing to disclose a photo or share media must not prevent later text-based progress.

Mutual permission is required for media, calls, and meeting requests. Guardian permission may also be required depending on unresolved age policy. A guardian-assisted progress bypass is not approved and must not be invented.

Text can still contain contact details or addresses. Feature gating does not solve that risk. Contact-sharing detection and moderation remain separate unresolved policy.

### Approved venues and visits

#### Approved venues

Store:

- Venue identity and public address
- Accessibility details
- Opening hours
- Bookable schedules or availability rules
- Capacity and booking limits
- Active/inactive status
- Closure periods and operational notes
- Staff approval and audit metadata

Community centers, university spaces, and partner cafes are examples only, not confirmed partners.

Private home addresses and live personal locations are outside this proposed meeting flow.

#### Meeting requests and reservations

Each request references an approved venue. The server must validate, at the time of confirmation:

- Active staff-confirmed match
- Approved and active companion
- Required progress threshold
- Current mutual permission
- Any required guardian permission
- Absence of applicable block or suspension
- Separate staff meeting eligibility
- Active approved venue
- Opening hours and bookable availability
- Capacity and conflicting reservations

Reservation creation should be transactional or otherwise concurrency-safe. A frontend-disabled button is not sufficient protection.

Venue closure or deactivation must trigger an explicit cancellation or rescheduling workflow. The system must preserve the reason, notify affected participants in their language, release capacity safely, and never substitute an arbitrary or home address.

#### Visits

Record the confirmed reservation, participants, approved venue, scheduled and actual time, status, and references to reports or incidents. Staff-confirmed matching and meeting eligibility remain separate decisions.

#### Visit reports and family updates

Visit reports may include duration, activities, general mood, companion notes, future requests, and authorized media references. Family updates are derived from visit records and visible only to permitted family relationships.

Photos appear only with recorded, applicable consent. The system should record the consent basis and media reference rather than copying unrestricted files into broadly readable records.

### Media

Media objects should record owner, match or visit scope, purpose, content type, byte size, storage path, consent references, moderation status, and retention state.

Buddy media belongs in private storage. Requirements include:

- Authorization on upload and retrieval
- Short-lived signed or server-authorized access
- Server-enforced permitted file types
- Server-enforced 25 MB maximum for each video
- Image and video validation based on actual file content, not only filename or browser MIME type
- Removal of location metadata where feasible
- Access checks at every retrieval, including current block, suspension, match, relationship, and consent state
- Retention and deletion behavior to be approved

Hiding an upload or download button in the frontend does not protect private media.

### Memberships and billing

Proposed entities include billing customers, subscription references, plan identifiers, status history, and webhook-event deduplication.

Stripe Billing is proposed for Community, Bridge Standard, and Bridge Premium. Pricing and entitlements are unresolved. The server must derive billing state from verified provider events, not browser claims. Secret keys and webhook secrets must never use `NEXT_PUBLIC_` variables or be committed.

Payment status must not silently override safety, guardian, matching, companion approval, consent, or venue rules.

### Safety, reporting, and audit

#### Reports and blocks

Participants need scoped reporting and blocking. A relevant block or account suspension overrides progress and communication eligibility immediately.

The effect on existing bookings, media access, family updates, and staff escalation must be defined. Progress behavior after unmatching and rematching remains unresolved rather than assumed to persist or reset.

#### Audit records

Record high-impact changes such as:

- Role changes
- Guardian linking, verification, scope, and revocation
- Companion approval and training status
- Match confirmation and closure
- Consent grant and withdrawal
- Venue approval, closure, and booking override
- Meeting eligibility
- Publication of family updates
- Billing webhook processing
- Blocks, suspensions, reports, and administrative access to sensitive records

Audit records should capture actor, action, subject, server time, and appropriate reason without becoming an unrestricted copy of sensitive content.

## Proposed relationship overview

```text
account
├── role_assignment
├── family_older_adult_relationship ── older_adult_profile
├── guardian_minor_relationship ────── underage_participant
├── companion_application ──────────── training_and_approval
└── conversation_participant

staff-confirmed match
├── conversation
│   ├── conversation_participant
│   ├── message (actual sender account)
│   ├── introduction_prompt_answer
│   ├── progress_event
│   └── communication_permission / consent
├── meeting_request ── approved_venue ── venue_availability
│   └── visit
│       ├── visit_report
│       └── family_update
└── media_object

account / relationship / match
├── report
├── block
└── audit_record

family payer ── subscription ── billing provider reference
```

## Authorization model

Use server-side authorization plus database access controls. Every protected operation should combine:

1. Authenticated account identity.
2. Active role assignment.
3. Verified relationship to the subject or conversation.
4. Current match, approval, block, and suspension state.
5. Operation-specific consent and eligibility.
6. Least-privilege access to required fields only.

Do not trust browser-provided values for:

- Roles or administrator status
- Family or guardian relationships
- Companion training or approval
- Match confirmation
- Progress totals or qualifying events
- Consent or communication permissions
- Venue approval, availability, or capacity
- Meeting eligibility
- Billing or subscription status
- Publication of visit reports or family updates

Supabase RLS should be tested as an authorization boundary, not treated as complete merely because it is enabled. Privileged server code must also validate input and avoid using a service-role client for broad user-driven queries.

## Sensitive data boundaries

Health considerations, routines, and emergency contacts are sensitive by default. Access should be restricted to specifically authorized people and purposes and should be auditable.

- Guardian chat visibility does not grant health-data access.
- A family payer does not automatically gain every care or conversation permission.
- A companion should receive only the minimum information approved for the match or visit.
- Public approved-venue addresses are not personal location data.
- Personal home addresses and live location sharing are not part of the proposed visit flow.
- User-generated chat remains in its original language unless translation is separately approved.

Data minimization, retention, deletion, export, incident response, emergency access, and legal basis remain policy work and must be resolved before real data is used.

## Validation and meaningful test needs

### Authorization tests

- Anonymous, family, older adult if applicable, companion applicant, approved companion, guardian, staff, and administrator scenarios
- Cross-family and cross-match data isolation
- Forged guardian relationship and revoked guardian access
- Guardian message attribution and exclusion from minor progress
- Block and suspension overrides
- Least-privilege access to sensitive fields and media

### Progress tests

- Two messages from each eligible participant qualify once
- One-sided, empty, long, guardian-authored, duplicate, and retried messages do not over-award
- Four-hour candidate-window boundary uses server time consistently
- Prompt events deduplicate
- Caps hold at `S = 3`, `A = 2`, and `P = 60`
- Two conversations plus two prompts and three conversations alone both produce 60
- Photo refusal does not stop text progress

### Venue and booking tests

- Arbitrary addresses and home visits are rejected
- Inactive or closed venues cannot be booked
- Opening hours, capacity, and booking limits are enforced server-side
- Concurrent booking attempts cannot exceed capacity
- Venue closure and cancellation notify and release capacity correctly
- A confirmed match without meeting eligibility cannot book

### Media tests

- Unauthorized upload and retrieval fail
- Expired links stop working
- File content and type validation rejects disguised files
- Videos over 25 MB fail server-side
- Metadata removal is checked where supported
- Consent withdrawal, block, or suspension changes access as approved by policy

### Billing and webhook tests

- Duplicate and out-of-order provider events are safe
- Browser-provided subscription state is ignored
- Payment failure does not bypass or corrupt safety eligibility
- Test mode and dummy accounts are used before approval

### Bilingual and accessibility tests

- Server validation returns stable translation keys or localized safe messages
- English and Japanese transactional notifications cover the same event states
- Japanese content round-trips without corruption
- Authorization errors do not reveal protected records in either language

## Missing implementation

No Buddy backend feature is currently implemented. Meaningful next work includes:

1. Approve terminology, age, guardian, consent, and safety decisions.
2. Create a separate Buddy Supabase project using dummy data only.
3. Convert proposed concepts into reviewed, versioned migrations.
4. Implement Auth and server-side role/relationship checks.
5. Implement the companion pipeline and manual matching first.
6. Add match-scoped chat with actual sender attribution.
7. Implement deduplicated progress calculation on the server.
8. Add private media authorization and validation.
9. Implement approved venues and concurrency-safe booking.
10. Implement visit reports and consent-aware family updates.
11. Integrate Stripe Billing in test mode after plans are approved.
12. Add bilingual notifications, audit records, reports, and blocks.
13. Complete privacy, security, RLS, and end-to-end reviews before any real pilot.
