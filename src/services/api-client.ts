/**
 * The configured axios instance. `/booking` ONLY.
 *
 * axios measured 17.5KB gzip and is kept off the landing bundle entirely —
 * `/` makes one GET that native fetch handles in 0KB, from
 * src/modules/home/home.service.ts. ESLint enforces the split; this file and
 * src/modules/booking-form/** are the only places allowed to import axios.
 *
 * What buys the 17.5KB: `onUploadProgress` on the 2MB proof upload. fetch
 * cannot report request progress, and an upload with no feedback on a phone
 * connection is one a visitor abandons.
 */
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",

  // The proof upload is the slow request here, and 2MB over mobile data is
  // routinely more than ten seconds. Failing at the default would abort
  // uploads that were going to succeed.
  timeout: 30_000,

  // Never throw on a 4xx: 409, 429 and 400 are all EXPECTED answers with
  // different UI, and turning them into exceptions loses the response body
  // holding `fields`. Only a transport failure should reject.
  validateStatus: (status) => status < 500,
});
