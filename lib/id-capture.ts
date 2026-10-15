export type CardType = "license" | "residence" | "my-number";
export type CaptureStep = "front" | "edge" | "motion" | "back";

export function captureSteps(type: CardType): CaptureStep[] {
  // Never request the number-bearing reverse of a My Number card.
  return type === "my-number" ? ["front", "edge", "motion"] : ["front", "edge", "motion", "back"];
}

export const MOTION_DURATION_MS = 6000;
export const MAX_CLIP_BYTES = 25_000_000;

export function motionCue(elapsed: number): "hold" | "up" | "down" {
  return elapsed < 2000 ? "hold" : elapsed < 4000 ? "up" : "down";
}

export function cameraError(name: string): "denied" | "missing" | "busy" | "failed" {
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "missing";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "failed";
}
