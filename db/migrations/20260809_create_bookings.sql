-- Arena Player — bookings table (schema contract from docs/PRD.md, do not drift).
-- Run manually in the Neon SQL editor. Never auto-applied.
--
-- Wrapped in a transaction on purpose: a paste that fails halfway must not
-- leave the table created WITHOUT uniq_active_slot, which would silently turn
-- off anti-double-booking with no runtime error anywhere.
begin;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null,
  time_slot text not null,
  team_name text not null,
  phone text not null,          -- normalised to 628xxxxxxxxx, never as-typed
  notes text,
  proof_key text not null,      -- R2 object KEY in the private bucket, NOT a URL
  status text not null default 'pending',
  created_at timestamptz not null default now(),

  -- uniq_active_slot below compares time_slot as TEXT. Without this constraint
  -- '06.00 - 08.00' and '06.00-08.00' are different rows booking the same slot,
  -- and the race guard silently does nothing. src/domain/slots.ts canonicalises in app
  -- code; this enforces it in the database. Keep the two in lockstep.
  constraint time_slot_canonical check (time_slot in (
    '06.00 - 08.00','08.00 - 10.00','10.00 - 12.00','12.00 - 14.00','14.00 - 16.00',
    '16.00 - 18.00','18.00 - 20.00','20.00 - 22.00','22.00 - 24.00'
  )),
  constraint status_valid check (status in ('pending','confirmed','rejected','expired')),
  constraint notes_length check (notes is null or length(notes) <= 500)
);

-- Anti double-booking: only one ACTIVE booking per slot.
-- The API relies on this index (23505 -> HTTP 409). Never check-then-insert.
create unique index uniq_active_slot
  on bookings (booking_date, time_slot)
  where status in ('pending', 'confirmed');

-- Lazy expiry filters pending rows for one date by age; uniq_active_slot already
-- covers the availability read, so this is the only supporting index needed.
create index bookings_pending_expiry_idx
  on bookings (booking_date, created_at)
  where status = 'pending';

commit;
