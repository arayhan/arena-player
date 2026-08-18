-- Arena Player — rate_card, public_holidays, and hardening for the two
-- settings tables an out-of-band script created without them.
-- Requested by arena-player-admin (docs/schema-requests/003-site-settings.md,
-- amended 2026-08-17). Run manually in the Supabase SQL editor. Never
-- auto-applied.
--
-- ADDITIVE, EXCEPT FOR TWO ALTER STATEMENTS THAT RETROFIT MISSING
-- CONSTRAINTS ONTO ALREADY-LIVE TABLES. `site_settings` and `bank_accounts`
-- exist on this project already — created directly against the database by
-- a script in arena-player-admin (scripts/apply-migrations.mjs, now deleted)
-- that bypassed this repo's migrations folder entirely and, in doing so,
-- skipped every CHECK constraint 003 specifies. This migration is that
-- script's missing paper trail, written after the fact: it adds the
-- constraints that should have been here from the start, and the two new
-- tables the client's real pricelist made necessary.
--
-- The fabricated bank_accounts row that same script seeded (BCA /
-- 1234567890 / "Arena Futsal Lombok") is removed in a companion DELETE run
-- ahead of this migration, by exact value match so it cannot touch a real
-- account. The fabricated `address` value was checked the same way and
-- found ALREADY REPLACED with a real one by the time this landed — the
-- admin UI had already been used for its intended purpose in between the
-- finding and the fix, so no UPDATE to `address` was needed or run.
--
-- Wrapped in a transaction, same reasoning as the other two migrations in
-- this folder: a paste that fails halfway must not leave rate_card created
-- but unseeded, or one constraint added and its sibling missing.
begin;

-- --- Retrofit: site_settings ------------------------------------------------
-- The allow-list and length checks 003 always specified, added now that the
-- two fabricated values that would have violated them have been cleared.
alter table site_settings
  add constraint site_settings_key_known check (key in (
    'whatsapp_number',
    'address',
    'maps_embed_url',
    'dp_percent'
  ));

-- No lower bound: `maps_embed_url` is optional and the app writes an empty
-- string for "not configured yet" (the live row is '' right now). A
-- `between 1 and 2000` bound, as originally drafted, would reject that
-- legitimate state and fail this ALTER outright against real data.
alter table site_settings
  add constraint site_settings_value_length check (length(value) <= 2000);

-- --- Retrofit: bank_accounts -------------------------------------------------
alter table bank_accounts
  add constraint bank_accounts_bank_length check (length(bank) between 1 and 40);

alter table bank_accounts
  add constraint bank_accounts_number_length check (length(account_number) between 1 and 40);

alter table bank_accounts
  add constraint bank_accounts_holder_length check (length(account_holder) between 1 and 100);

-- Formalizes a column that was already live and already relied on by the
-- shipped settings UI's active/inactive toggle. `if not exists` so this is
-- harmless to re-run against a project where it is already present.
alter table bank_accounts
  add column if not exists is_active boolean not null default true;

-- --- New: rate_card -----------------------------------------------------------
-- Keyed by slot AND day type, one price per combination. Peak/off-peak is not
-- a column — it is a property of the slot, so the price rows themselves are
-- the peak boundary. See docs/schema-requests/003-site-settings.md for the
-- full reasoning and the three rejected alternatives.
create table rate_card (
  id           uuid primary key default gen_random_uuid(),
  time_slot    text not null,
  day_type     text not null,

  -- Rupiah, whole. No fractional rupiah in this business.
  price_rupiah integer not null,

  updated_at   timestamptz not null default now(),

  -- The same eighteen literals as bookings.time_slot_canonical and
  -- src/domain/slots.ts. Deliberately duplicated rather than factored into a
  -- DOMAIN — see 001-slot-blocks.md for why. Drift is caught by
  -- arena-player-admin's `pnpm check:schema`.
  constraint rate_card_time_slot_canonical check (time_slot in (
    '06.00 - 07.00','07.00 - 08.00','08.00 - 09.00','09.00 - 10.00','10.00 - 11.00','11.00 - 12.00',
    '12.00 - 13.00','13.00 - 14.00','14.00 - 15.00','15.00 - 16.00','16.00 - 17.00','17.00 - 18.00',
    '18.00 - 19.00','19.00 - 20.00','20.00 - 21.00','21.00 - 22.00','22.00 - 23.00','23.00 - 24.00'
  )),

  -- Which calendar days are 'weekend' is resolved in
  -- arena-player-admin's src/server/pricing.ts: Saturday/Sunday, or any date
  -- listed in public_holidays below.
  constraint rate_card_day_type_valid check (day_type in ('weekday','weekend')),

  -- A zero or negative price is a data-entry accident, never an offer.
  constraint rate_card_price_positive check (price_rupiah > 0)
);

-- One price per slot per day type.
create unique index uniq_rate_card_slot on rate_card (time_slot, day_type);

-- Seeded with the client's real pricelist (supplied 2026-08-17), not a
-- placeholder — 003's "no seed rows, no example prices" caution was about
-- figures nobody had actually supplied.
insert into rate_card (time_slot, day_type, price_rupiah) values
  ('06.00 - 07.00', 'weekday', 200000), ('06.00 - 07.00', 'weekend', 200000),
  ('07.00 - 08.00', 'weekday', 200000), ('07.00 - 08.00', 'weekend', 200000),
  ('08.00 - 09.00', 'weekday', 200000), ('08.00 - 09.00', 'weekend', 200000),
  ('09.00 - 10.00', 'weekday', 200000), ('09.00 - 10.00', 'weekend', 200000),
  ('10.00 - 11.00', 'weekday', 200000), ('10.00 - 11.00', 'weekend', 200000),
  ('11.00 - 12.00', 'weekday', 200000), ('11.00 - 12.00', 'weekend', 200000),
  ('12.00 - 13.00', 'weekday', 200000), ('12.00 - 13.00', 'weekend', 200000),
  ('13.00 - 14.00', 'weekday', 200000), ('13.00 - 14.00', 'weekend', 200000),
  ('14.00 - 15.00', 'weekday', 200000), ('14.00 - 15.00', 'weekend', 200000),
  ('15.00 - 16.00', 'weekday', 200000), ('15.00 - 16.00', 'weekend', 200000),
  ('16.00 - 17.00', 'weekday', 300000), ('16.00 - 17.00', 'weekend', 350000),
  ('17.00 - 18.00', 'weekday', 300000), ('17.00 - 18.00', 'weekend', 350000),
  ('18.00 - 19.00', 'weekday', 400000), ('18.00 - 19.00', 'weekend', 450000),
  ('19.00 - 20.00', 'weekday', 400000), ('19.00 - 20.00', 'weekend', 450000),
  ('20.00 - 21.00', 'weekday', 400000), ('20.00 - 21.00', 'weekend', 450000),
  ('21.00 - 22.00', 'weekday', 400000), ('21.00 - 22.00', 'weekend', 450000),
  ('22.00 - 23.00', 'weekday', 400000), ('22.00 - 23.00', 'weekend', 450000),
  ('23.00 - 24.00', 'weekday', 400000), ('23.00 - 24.00', 'weekend', 450000);

-- --- New: public_holidays ------------------------------------------------------
-- Admin-managed, not a hardcoded yearly calendar — Indonesian national
-- holidays are gazetted yearly and shift (Idul Fitri, Idul Adha), so a
-- constant here would go stale exactly the way the WhatsApp number and the
-- Ketentuan used to before this same request moved them into the database.
-- Any date in this table prices as 'weekend' in rate_card, same as Sat/Sun.
create table public_holidays (
  id           uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  label        text not null,
  created_at   timestamptz not null default now(),

  constraint public_holidays_label_length check (length(label) between 1 and 100)
);

-- No seed rows: which dates count is the client's to supply through the
-- admin UI, the same reasoning 003 gives for leaving rate_card unseeded
-- with placeholder figures — except here there is no "obvious" default at
-- all, not even a plausible-looking one.

commit;
