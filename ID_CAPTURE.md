# ID card capture

Implemented on 2026-10-15 at `/identity`, linked from My Page. This is a sample-card capture tool with English and Japanese UI, not an identity-verification decision service.

## Research and design choices

- [TRUSTDOCK capture guide](https://biz.trustdock.io/web/ekyc-e): align front, thickness and reverse views to a camera outline; avoid low light, glare and unreadable text. The implementation uses this sequence plus a movement clip, with explicit review and retake.
- [TRUSTDOCK presentation hosted by the Bank of Japan](https://www.boj.or.jp/paym/outline/mirai_forum/data/rel220114c6.pdf): shows front/edge/reverse capture and notes the My Number reverse exception. This tool never requests a My Number reverse; it reminds users to keep the front visible during movement and edge capture. It cannot automatically recognize a mistakenly presented reverse.
- [Liquid eKYC](https://liquidinc.asia/liquid-ekyc): provider offerings include document-image and IC-based verification. Capturing a photograph here is not equivalent to the provider's verification service.
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia): camera requires permission and a secure context; failure and pending permission need explicit handling.
- [MDN MediaRecorder format support](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static): select an available recording MIME type instead of assuming WebM works on every browser.

## Implemented experience

1. Select a sample licence, residence card or My Number card layout and acknowledge local sample capture.
2. Capture the front with an outline and advisory brightness feedback.
3. Tilt slightly to show the face and lower edge, using an angled guide.
4. Record a silent six-second clip: hold for two seconds, move up for two seconds, move down for two seconds. The clip is retained for playback, not merely a timer animation.
5. Capture the reverse for licence and residence layouts only.
6. Review each photo/video and explicitly confirm visibility or retake it. Review all captures before discarding.

The guide does not detect document corners. Still images retain the full unmirrored camera frame rather than cropping away edge evidence. Brightness is a sampled luminance hint; it is not a blur, glare, OCR, forgery or document classifier. The edge/thickness and movement checks are user visual confirmations. Neither elapsed time nor these confirmations produce an approved identity status. Physical thickness in millimetres, correct motion, holder identity and authenticity are not automatically verified.

## Lifecycle and storage

- Rear camera preferred, front/rear switch available; microphone never requested.
- Photos and clips held only as memory-backed object URLs in the current component.
- No upload, localStorage, IndexedDB, analytics, database or verification status writes.
- Camera and recorder stopped on review, cancellation, switching, navigation, track loss and page hiding. Pending callbacks are invalidated to prevent resurrecting a cancelled capture.
- Old preview URLs revoked on replacement; all preview URLs revoked on discard/unmount/page exit.
- Video bytes capped at 25,000,000. Format support checked at runtime; no unsupported-recording fallback pretending completion.
- Refresh/navigation discards the capture session. HTTPS is needed on phones; localhost works for development on the same device. Plain LAN HTTP is not sufficient.

## Required before real identity verification

Select a verification provider or implement an authorized reviewer workflow; agree document eligibility and current policy; add authenticated capture sessions, restricted storage, retention/deletion and audit controls. Provider-side or reviewed evidence checks must address replacement documents, screen replays, tampering, motion and identity. No automatic thickness, liveness or regulatory-compliance claim is made by this prototype.

## Device checks

Verification on 2026-10-15: `npx tsc --noEmit --incremental false` passed. Executed assertions passed for My Number reverse exclusion, other card sequences, movement-cue boundaries, camera-error classification and clip limits. The production build did not complete: the existing `.next` cache stalled before compilation and an attempted backup move failed with filesystem access errors. No connected browser was available, so live camera, recording playback and visual/device behavior were not verified in this session.

Use sample cards only. Exercise rear/front cameras, denied/busy/missing camera, pending permission cancellation, Safari/Chrome codec choices, background interruption, all three layouts, review/retake, clip playback and cleanup. Confirm My Number never requests the reverse. Physical-camera/device testing remains necessary even when type checking and production compilation pass.
