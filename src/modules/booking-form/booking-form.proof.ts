/**
 * The proof-upload limits, and the ONLY place they are written.
 *
 * architecture.md names this file as the home for them — "never retyped here or
 * in the form". A second copy is how a form that accepts 2MB meets a route
 * handler that rejects at 1MB, and the visitor gets an error after the upload
 * finished rather than before it started.
 *
 * Deliberately free of React and of zod so the Phase 4 route handler can import
 * the same constants without dragging either into a server bundle.
 */

/** 2MB. Matches the `proof` rule in architecture.md's POST contract. */
export const MAX_PROOF_BYTES = 2 * 1024 * 1024;

export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedProofType = (typeof ALLOWED_PROOF_TYPES)[number];

/** For the `accept` attribute. Derived, never typed twice. */
export const PROOF_ACCEPT = ALLOWED_PROOF_TYPES.join(",");

export type ProofProblem = "missing" | "too_large" | "wrong_type";

/**
 * Validate a chosen file before it is ever uploaded.
 *
 * Returns the problem rather than a message: the copy is Indonesian and belongs
 * to the component, the rule belongs here, and keeping them apart is what lets
 * the Phase 4 handler reuse this without importing UI strings.
 */
export function checkProof(file: File | null | undefined): ProofProblem | null {
  if (!file) return "missing";
  // Type first. A 5MB PDF is both wrong-type and too-large, and naming the
  // format problem is more useful than telling someone to compress a PDF.
  if (!ALLOWED_PROOF_TYPES.includes(file.type as AllowedProofType)) return "wrong_type";
  if (file.size > MAX_PROOF_BYTES) return "too_large";
  return null;
}
