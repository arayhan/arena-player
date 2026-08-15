/**
 * The `/booking` transport. **NATIVE FETCH SINCE 2026-08-15 — axios is gone.**
 *
 * WHY IT LEFT. axios measured 17.5KB gzip, and its whole justification was
 * `onUploadProgress` on the 2MB proof upload: fetch cannot report request
 * progress, and an upload with no feedback on a phone connection is one a
 * visitor abandons. **That field is hidden** (`SHOW_PROOF_FIELD` in
 * BookingForm.tsx) — payment proof is handled in the WhatsApp chat for now — so
 * the library was being paid for by a feature that does not render.
 *
 * WHAT FORCED THE MEASUREMENT. `check:budget` could not size `/booking` at all
 * until this same day: the route reads `?date=&time=`, so it is dynamic, emits
 * no prerendered HTML, and the check failed loudly rather than reporting green
 * over a route it had never examined. Once it could, `/booking` came in at
 * **264.2KB against a 240KB ceiling** — a breach that had been invisible for as
 * long as the route has existed. Dropping axios is the first cut.
 *
 * IF THE PROOF UPLOAD COMES BACK, THIS DECISION COMES BACK WITH IT. Restoring
 * progress reporting means either re-adding axios and re-running the budget, or
 * an `XMLHttpRequest` upload path here — which is what axios wraps anyway.
 *
 * THE SHAPE IS DELIBERATELY THE SAME as the axios instance it replaces: one
 * `baseURL`, a timeout, and **no throw below 500**. 409, 429 and 400 are
 * EXPECTED answers with different UI, and turning them into exceptions loses the
 * response body holding `fields`.
 */

/**
 * Same constant name and same rule as `BASE_URL` in
 * src/modules/home/home.service.ts — every transport in this repo resolves its
 * origin the same way. Empty in the browser (same-origin), absolute wherever
 * there is no document to resolve against: Node tests, and any server-side call
 * Phase 4 adds.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/**
 * The proof upload was the slow request here, and 2MB over mobile data is
 * routinely more than ten seconds. Kept at 30s so restoring that field needs no
 * second decision.
 */
const TIMEOUT_MS = 30_000;

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

async function request<T>(
  path: string,
  init: RequestInit & { params?: Record<string, string> } = {},
): Promise<ApiResponse<T>> {
  const { params, signal, ...rest } = init;
  const query = params ? `?${new URLSearchParams(params)}` : "";

  // ONE TIMEOUT, COMPOSED WITH THE CALLER'S SIGNAL. TanStack Query aborts a
  // superseded query through its own signal; the timeout is ours. `AbortSignal.any`
  // is what lets both cancel the same request without either owning the other.
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout;

  const response = await fetch(`${BASE_URL}/api${path}${query}`, { ...rest, signal: composed });

  // A 5xx is the only status that throws, matching `validateStatus: s => s < 500`
  // — the rule the mutation layer's error handling is written against.
  if (response.status >= 500) {
    throw new Error(`request failed: ${response.status}`);
  }

  // A body that is not JSON is an infrastructure failure — a proxy's HTML error
  // page, most likely. Surfacing it as `null` keeps the status readable instead
  // of replacing it with a SyntaxError that says nothing about what happened.
  const data = (await response.json().catch(() => null)) as T;

  return { status: response.status, data };
}

export const apiClient = {
  get: <T>(path: string, init?: { params?: Record<string, string>; signal?: AbortSignal }) =>
    request<T>(path, init),

  post: <T>(path: string, body: FormData) => request<T>(path, { method: "POST", body }),
};
