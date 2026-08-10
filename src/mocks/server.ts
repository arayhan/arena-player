/**
 * The Node interceptor, for Vitest only.
 *
 * The handlers have to be tested somewhere, and the browser worker cannot be:
 * it is a service worker, so it intercepts nothing outside a real browser —
 * which is also why `curl localhost:3000/api/availability` can never work
 * against this mock, whatever the step file's acceptance block said.
 *
 * Same `handlers` array as the browser. If these two ever import different
 * handler sets, the tests stop proving anything about what the app serves.
 */
import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
