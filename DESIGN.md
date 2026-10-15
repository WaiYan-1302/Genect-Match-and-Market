# GENECT Buddy Platform - Product and Experience Design

## Document status

This document describes two different things and keeps them deliberately separate:

1. **Current implementation:** this repository contains a family-facing GENECT Buddy frontend demo using dummy data and local state.
2. **Proposed product direction:** secure persistence, real role workflows, and live-service integration described below have not been implemented.

The existing Marketplace is a reference for GENECT's visual identity and for lessons learned about readability and accessibility. Shopping grids, sellers, baskets, ratings, reviews, and checkout are not Buddy Platform requirements.

The latest product requirements in this document supersede the Buddy guide where they differ. In particular, Buddy visits must take place at predesignated GENECT-approved venues, not at a participant's home.

## Product purpose

GENECT Buddy connects older adults with vetted and trained companions for intergenerational companionship. A family member can register an older adult, manage a membership, and receive updates after visits.

The service is not professional caregiving and does not replace family relationships. Its purpose is companionship and family peace of mind.

The baseline journey is:

1. Family registration and creation of an older-adult profile.
2. Companion application, vetting, and training.
3. Staff-confirmed matching.
4. Gradual communication between matched participants.
5. Visit scheduling at a GENECT-approved venue.
6. Companion visit report.
7. Family update, with photos only when the required consent is recorded.

Matching begins as an admin-curated process. An automated matching algorithm is not part of the proposed first version.

## Safety and readiness boundary

Documentation and dummy-data development can proceed now. Until the GENECT Board approves the trust and safety policy:

- Do not onboard real families, older adults, or companions.
- Do not schedule real visits.
- Do not use real health, routine, or emergency-contact information.
- Do not claim pilot, legal, insurance, safeguarding, consent, or production readiness.

The current repository demonstrates Buddy navigation, a family overview, a staff-confirmed sample connection, local chat, gradual-permission states, approved venues, and family updates. It does not implement secure registration, persisted workflows, verified guardian access, real booking, subscriptions, or safety operations.

## Roles and relationships

Roles do not by themselves grant every permission. The relationship to a specific person, match, conversation, visit, or subscription must also be checked.

### Family member or supporter

- Creates and manages their own account.
- Registers or supports an older adult through an explicit relationship.
- Manages the membership if designated as the payer.
- Receives authorized visit updates.
- Sees only information permitted by their relationship and recorded consent.

A family payer, an older adult's supporter, and a minor's guardian are distinct relationships. One must not silently inherit permissions from another.

### Older adult

- Has a profile containing only information required for matching, scheduling, and authorized support.
- May or may not have their own login; this is unresolved.
- Must retain appropriate control over consent, photo disclosure, media, and visits.

The baseline guide does not require an older adult account. The product must decide whether the older adult, a family representative, or both communicate with the companion. Every message must show the actual sender regardless of the chosen model.

### Companion applicant

- Applies through a dedicated application flow.
- Completes GENECT vetting and training outside or alongside the product.
- Becomes eligible for matching only after staff approval.
- Sees only their authorized matches, conversations, meetings, and visit-report tasks.

The proposed baseline status path is:

```text
applied -> in_training -> approved -> inactive
```

Only staff may confirm these transitions. Rejection, withdrawal, reactivation, expiry, and retraining rules remain unresolved and must not be inferred from this simplified path.

### Staff or administrator

- Reviews companion applications and training state.
- Reviews family and older-adult profiles only as authorized.
- Curates and confirms matches manually.
- Separately confirms meeting eligibility.
- Manages approved venues and availability.
- Oversees reports, blocks, suspensions, visit reports, and family updates.

Staff confirmation of a match and confirmation that a meeting may occur are separate checks.

### Guardian of an underage participant

Guardian support is proposed for linked underage accounts, subject to unresolved age and safeguarding policy.

- A verified guardian can view authorized linked conversations.
- A guardian participates through their own account.
- Both sides must see that guardian visibility exists.
- Guardian access is limited to conversations covered by a verified guardian relationship.
- Guardian access to chat does not grant blanket access to profiles, health data, emergency contacts, or unrelated conversations.

Secure relationship verification and revocation are required. An adult cannot obtain guardian access merely by claiming the relationship.

## Role-specific journeys

### Family journey

1. Choose English or Japanese.
2. Create an account and verify identity as required by future policy.
3. Register an older adult and the family relationship.
4. Enter the minimum authorized profile, preferences, and accessibility needs.
5. Review membership options without invented prices or entitlements.
6. Wait for staff-curated matching.
7. Follow permitted communication and visit activity.
8. Receive a family update after an eligible visit.

### Companion journey

1. Choose English or Japanese.
2. Create an applicant account.
3. Submit the companion application.
4. See a clear application and training status.
5. Become match-eligible only after approval.
6. Review a staff-confirmed match and introduction.
7. Communicate under the connection-progress and consent rules.
8. Request or respond to a visit only when eligible.
9. Attend at the approved venue and submit the visit report.

### Staff journey

1. Review companion applications and training evidence.
2. Review eligible family profiles and approved companions.
3. Confirm a match manually.
4. Monitor reported or blocked interactions without presenting progress as a trust score.
5. Manage approved venues, hours, capacity, and closures.
6. Confirm meeting eligibility separately from the match.
7. Review visit reports and release appropriate family updates.
8. Maintain an auditable record of sensitive decisions.

## Visual identity

### ID card capture

My Page links to a dedicated bilingual capture page at `/identity`. It preserves the GENECT white, yellow and cream visual style. The sequence is front, angled edge/thickness, a six-second hold/up/down clip, then reverse where applicable. My Number cards never request the reverse. Each capture has a review, visual-confirmation checkbox and retake action; camera failure and interruption have recovery states. Edge and movement evidence are for visual review, not automatic authenticity or identity approval. See [ID_CAPTURE.md](./ID_CAPTURE.md) for research and implementation boundaries.

The Buddy Platform should preserve the strongest parts of the GENECT Marketplace visual language:

- Warm GENECT yellow and cream accents
- White backgrounds and dark, readable text
- Calm layouts with generous spacing
- Welcoming, human imagery
- Visible support and human stories
- Editorial warmth without shopping-oriented density

### Typography and readability

The Marketplace prototype often uses 7-11 px interface text. Buddy must not repeat that pattern.

- Use a readable default body size, normally at least 16 px.
- Use comfortable line height and line length.
- Use large, clearly labeled touch targets.
- Do not make baseline readability depend on an easy-to-read toggle.
- Test Japanese fonts, punctuation, line breaking, and mixed-language content.
- Avoid relying on color alone to explain state.

### Interaction accessibility

- Provide visible keyboard focus.
- Meet appropriate text and control contrast.
- Use correct dialog naming, semantics, focus trapping, and focus restoration.
- Announce relevant status and validation messages through accessible live regions.
- Expose selected, disabled, locked, loading, error, and success states semantically and visually.
- Respect reduced-motion preferences.
- Preserve user input when recoverable errors occur.

## Bilingual interface

Every user-facing interface must support English and Japanese, including:

- Navigation and dashboards
- Registration and companion applications
- Chat, sender names, and guardian labels
- Connection-progress explanations
- Locked-feature messages
- Consent and permission prompts
- Venue details and booking
- Validation, errors, empty states, loading states, and confirmations
- Notifications and transactional emails
- Safety, reporting, and support text

Use centralized translation keys and a shared terminology glossary. Provide a language switch and persist the user's preference at account level when signed in and locally before sign-in.

Bilingual UI does not imply automatic translation of user messages. User-generated content remains in its original language unless message translation is separately designed and approved.

## Gradual communication design

### Purpose

Matched participants begin with limited communication features and unlock additional options through pair-level connection progress. Progress is an interaction measure. It is not currency, a purchasable balance, a safety rating, or proof that another person is trustworthy.

### Initial configurable proposal

```text
P = min(60, 20S + 10A)
```

Where:

- `S` is qualifying reciprocal conversations, capped at 3.
- `A` is jointly completed introduction prompts, capped at 2.
- `P` is pair-level connection progress.

This formula and its thresholds are hypotheses for usability testing, not established policy or validated safety controls.

### Qualifying conversation

A qualifying conversation requires at least two nonempty messages from each matched participant.

- Whitespace-only messages do not count.
- Longer messages earn no additional progress.
- One-sided activity earns no progress.
- Guardian-authored messages do not count as the underage participant's messages.
- A message can contribute to at most one qualifying-conversation event.
- Duplicate message or progress events must not award progress twice.

The proposed qualification timestamp is the server timestamp of the message that first completes the requirement of two eligible messages from each participant in the current candidate window. For the next conversation, the candidate window begins exactly four hours after the previous qualification timestamp. Messages before that next-window timestamp cannot be reused for another qualifying conversation.

### Joint introduction prompts

Optional prompts can include:

- “What would you enjoy doing together?”
- “Which approved venue would suit you?”

Both matched participants answer; their answers do not need to agree. Each prompt can award progress once after both eligible answers exist.

### Proposed feature thresholds

| Progress | Newly available option |
| ---: | --- |
| 0 | Text chat, interests, introduction, and illustrated avatar |
| 20 | Option for each person to reveal their own real profile photo |
| 30 | Image sharing, subject to mutual permission |
| 40 | Video sharing, subject to mutual permission; maximum 25 MB per video |
| 60 | Request a call or request a meeting at an approved venue |

Two qualifying conversations plus two completed prompts reach 60. Three qualifying conversations alone also reach 60.

### Progress is not consent or eligibility

An unlocked option becomes available; it does not automatically reveal a photo, send media, begin a call, or authorize a meeting.

Progress remains separate from:

- Each participant's current consent
- Companion approval and training
- Staff-confirmed matching
- Guardian requirements
- Venue and schedule eligibility
- Blocking, reporting, suspension, or account restrictions

Photo disclosure remains optional. Declining to share a real photo or video must not stop further text progress. Each person controls disclosure of their own profile photo. Mutual permission is required for media, calls, and meeting requests.

Text chat can still contain phone numbers, addresses, or other contact details. Feature gating alone does not prevent this. Detection, warnings, moderation, and enforcement for contact sharing remain unresolved policy work.

A guardian-assisted progress bypass is not approved behavior. Whether one should exist is an unresolved decision requiring explicit safeguarding review.

## Guardian visibility and sender attribution

Every message must visibly represent the authenticated author.

Examples:

- Aaron writes: **Aaron**
- Aaron's mother writes: **Aaron's Guardian**
- Japanese guardian label: **Aaronの保護者**

The relationship to the underage participant is displayed separately from the sender identity. A guardian message must never appear to have been written by the underage participant and must never count as that participant's progress activity.

Conversation UI must clearly disclose guardian visibility to both sides before and during communication. It should also expose changes in guardian access without rewriting the authorship of historical messages.

## Approved-venue booking experience

Visits may occur only at predesignated, active GENECT-approved venues. Users cannot enter an arbitrary meeting address or schedule a visit at a personal home.

Approved venue details can be public and are distinct from private personal location information. The venue experience should show:

- Venue identity and public address
- Accessibility information
- Opening hours
- Bookable availability
- Capacity or booking limits
- Active or inactive status
- Any relevant arrival or support instructions

Examples might include community centers, university spaces, or partner cafes. These are examples, not confirmed GENECT partners.

### Proposed booking flow

1. Eligible matched participants request a meeting after reaching the proposed threshold.
2. Both participants provide the required permission, including guardian permission where future policy requires it.
3. A participant selects an active approved venue and available time.
4. The server validates match status, companion approval, communication permission, venue status, opening hours, availability, capacity, blocks, suspensions, and staff meeting eligibility.
5. The reservation is created atomically so competing requests cannot take the same capacity.
6. Staff and participants receive bilingual confirmation.

If a venue closes, becomes inactive, conflicts with another reservation, or cancels availability, affected meetings must enter a clear state and participants must receive next-step guidance. The system must not silently move a meeting to an arbitrary location.

Private home addresses and live personal location sharing are not part of this flow.

## Visit reports and family updates

A proposed visit report can record the date, duration, activities, general mood, companion notes, follow-up requests, and media references.

Family updates should be concise and reliable. They can include what happened, how the older adult appeared generally, upcoming plans, and photos only when the required consent is recorded and still valid.

Health and emergency-contact information must not be broadly copied into chat, reports, or family feeds. Access must be limited to specifically authorized purposes and people.

## Required interface states

Every major flow must design and translate the following states rather than relying on blank screens or generic toasts:

### Loading

- Initial page and dashboard loading
- Profile and application submission
- Conversation and message history loading
- Upload and media processing
- Venue availability refresh
- Booking and billing confirmation

### Empty

- No match yet
- No messages yet
- No eligible venues or time slots
- No visits or family updates
- No active membership
- No staff-review items

### Error

- Validation errors attached to the relevant field
- Lost connectivity and retry guidance
- Authorization failure without leaking protected information
- Upload rejection, including the video-size limit
- Venue closure, capacity conflict, or stale availability
- Payment or subscription failure without claiming service eligibility

### Locked or unavailable

- Feature threshold not reached
- Consent not granted or withdrawn
- Companion not approved
- Match or meeting not confirmed
- Guardian approval required
- Venue inactive or unavailable
- User blocked or account suspended

Locked-state copy must distinguish progress from safety, consent, and administrative eligibility.

### Success

- Application received
- Match confirmed
- Prompt completed
- Permission recorded
- Booking requested or confirmed
- Visit report submitted
- Family update published
- Guardian link changed

## Current implementation versus proposed design

| Area | Current repository | Proposed Buddy design |
| --- | --- | --- |
| Product | Interactive family-facing Buddy demo | Companion, matching, communication, visit, and update platform |
| Users | Presented family account; no authentication | Family, older adult as decided, companion, staff, and verified guardian relationships |
| Data | Hardcoded Buddy dummy data and local state | Separate Buddy data model and dummy data until approval |
| Matching | Staff-confirmed sample match in UI | Persisted staff-curated and staff-confirmed workflow |
| Communication | Local demo chat and gradual-permission UI | Authorized match-scoped chat with actual sender attribution |
| Meetings | Approved-venue selection and eligibility UI | Server validation, reservations, and capacity handling |
| Updates | Dummy family activity feed | Visit reports and consent-aware family updates |
| Billing | None | Proposed Stripe Billing subscriptions; details unresolved |
| Languages | English/Japanese UI switch across the demo | Complete translated product and notifications |
| Accessibility | Readable typography, focus, reduced motion, responsive navigation | Full tested keyboard, screen-reader, status, and dialog behavior |

## Open product decisions

- Minimum participant age and eligibility
- Who underage participants may match with
- Guardian consent rules for photos, media, calls, and meetings
- Verification method for guardians and other relationships
- Multiple guardians, revocation, and access-history behavior
- What changes when an underage user reaches adulthood
- Retention of guardian-authored messages and prior access records
- Whether the older adult, family representative, or both use chat
- Whether older adults require accounts
- Rejection, withdrawal, reactivation, retraining, and approval-expiry states for companions
- Exact membership prices, entitlements, and restrictions for Community, Bridge Standard, and Bridge Premium
- Whether contact-sharing detection or moderation is required in text
- Whether a guardian-assisted progress bypass should exist
- Progress behavior after unmatching and rematching
- Consent versioning, expiry, withdrawal, and evidence requirements
- Visit cancellation, no-show, incident, and emergency procedures
- Venue approval criteria and confirmed venue partners
- Email delivery provider
- Final trust and safety, insurance, legal, privacy, and safeguarding policy
