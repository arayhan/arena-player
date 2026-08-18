import "server-only";

import postgres from "postgres";

/**
 * The live database is Supabase Postgres, not Neon — see docs/database.md's
 * top notice. `DATABASE_URL` must be the **transaction-pooler** connection
 * string (Supabase Dashboard → Project Settings → Database → Connection
 * string → Transaction pooler), port `6543`, host ending
 * `...pooler.supabase.com`. The direct string (`db.<ref>.supabase.co:5432`)
 * is IPv6-only on new Supabase projects and exhausts connections the same
 * way docs/database.md's Neon section already warns about for a serverless
 * caller — same physics, different vendor.
 *
 * `prepare: false` IS REQUIRED. pgbouncer in transaction-pooling mode does
 * not support prepared statements, and postgres.js defaults to using them.
 *
 * THE DATE-PARSING GOTCHA REPEATS WITH A NEW VENDOR. postgres.js parses
 * `date`/`timestamptz` columns into a JS `Date` by default — the same class
 * of silent day-shift docs/database.md documents for Neon's driver. Rather
 * than a global type-parser override, callers cast a date/timestamptz column
 * to `::text` in the query itself — sidesteps the parser entirely for the
 * one column that matters and is easier to verify by inspection than a
 * driver option.
 */
const sql = postgres(process.env.DATABASE_URL ?? "", { prepare: false });

export default sql;
