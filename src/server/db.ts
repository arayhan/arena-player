import "server-only";

import postgres from "postgres";

/**
 * The single Postgres connection, server-only.
 *
 * SUPABASE, NOT NEON — `docs/database.md` still documents Neon end to end;
 * the client's actual database is a Supabase project provisioned by whoever
 * built the admin side (schema verified 2026-08-17 against `TIME_SLOTS` and
 * `BOOKING_STATUSES`, byte for byte). `DATABASE_URL` keeps the name
 * `.env.local.example` already gave it — only the value moved vendors.
 *
 * MUST BE THE TRANSACTION-MODE POOLER STRING (port 6543, host
 * `...pooler.supabase.com`), never the direct `db.<ref>.supabase.co:5432`
 * string. The direct host is IPv6-only on a new Supabase project without the
 * IPv4 add-on, and even where it resolves it exhausts connections fast under
 * concurrent serverless route invocations — the same physics `docs/database.md`
 * already documents for Neon's direct connection, unrelated vendor, identical
 * failure mode.
 *
 * `prepare: false` IS NOT OPTIONAL IN TRANSACTION-POOLER MODE. pgbouncer in
 * transaction mode does not support prepared statements — postgres.js uses
 * them by default, and every query would fail with a cryptic protocol error
 * without this flag.
 *
 * NO DATE-TYPE PARSER OVERRIDE HERE, unlike the Neon client `docs/database.md`
 * documents. postgres.js parses `date`/`timestamptz` into JS `Date` by
 * default too — the same silent day-shift risk — but this project's only
 * touch point is `availability.ts`'s single query, which casts
 * `booking_date::text` at the SQL level instead. That sidesteps the parser
 * entirely for the one column that matters and is easier to verify by
 * reading the query than a global driver option would be. If a second
 * caller ever needs a date column, it must cast the same way — do not add a
 * type-parser override "to fix it once" without re-reading this comment.
 */
const sql = postgres(process.env.DATABASE_URL ?? "", { prepare: false });

export default sql;
