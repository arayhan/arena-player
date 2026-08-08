# Database setup

`.env.local.example` and [../docs/database.md](../docs/database.md) both point here. This file is the setup runbook; the schema and every gotcha live in `database.md`.

## Migrations are run by hand. Always.

Files in `migrations/` are **never auto-applied** — not by a script, not by an agent, not on deploy. You paste them into the Neon SQL editor yourself.

That is not caution for its own sake. The migration creates `bookings` *and* the partial unique index `uniq_active_slot` in one transaction, and that index is the **only** thing preventing two people booking the same slot. A table created without it looks completely healthy: inserts succeed, the API returns 200, the site works. It just double-books, silently, with no error anywhere.

The transaction wrapper exists so a paste that fails halfway cannot leave the table without its index. Do not run the statements individually.

This is also why Neon's MCP server is not wired up before Phase 4 — it exists to let an agent apply migrations, which is the one thing this rule forbids. See the reasoning in `database.md`.

## Steps

1. **Create a Neon project.**

2. **Run the migration.** Open the Neon SQL editor, paste the whole of `migrations/<timestamp>_create_bookings.sql`, run it as one statement. Confirm afterwards:

   ```sql
   select indexname from pg_indexes where tablename = 'bookings';
   -- must list uniq_active_slot. If it does not, the migration did not finish.
   ```

3. **Copy the pooled connection string** into `DATABASE_URL` in `.env.local`. It contains `-pooler` in the host. The direct string exhausts connections quickly under concurrent serverless route invocations — this is not optional.

4. **Create the R2 bucket** `arena-player-proofs` with public access **disabled**. Payment proofs are private; the `proof_key` column stores an object key, never a URL, because there is no public URL to store.

## Verifying it worked

`pnpm check:setup` connects to both Neon and R2 and confirms the migration ran and the credentials work. It is **built in Phase 4** — there is no Neon project and no R2 bucket before then, so it would be a check that can only fail.

Until Phase 4, the app runs entirely against the MSW mock and needs none of the above.

## When the admin repo arrives

**This repo owns `migrations/`.** `arena-player-admin` reads the same schema and never alters it. Two repos migrating one database is a conflict with nobody assigned to resolve it.
