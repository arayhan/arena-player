-- Arena Player — time_slot_canonical: 1-hour slots replace 2-hour slots
-- (schema contract from docs/PRD.md, do not drift).
-- Run manually in the Neon SQL editor. Never auto-applied.
--
-- TIME_SLOTS went from nine 2-hour slots to eighteen 1-hour slots on
-- 2026-08-15 (src/domain/slots.ts), so a visitor can book a single hour
-- instead of being forced into a 2-hour block. This migration replaces the
-- time_slot_canonical CHECK from db/migrations/20260809_create_bookings.sql,
-- which enforced the old nine-string list, with the new eighteen — see that
-- file for the base table this one assumes already exists.
--
-- EXISTING ROWS ARE LEFT ALONE. A booking already stored under a 2-hour slot
-- string ('06.00 - 08.00', etc) is not rewritten here — deciding what happens
-- to it (honour it as booked, contact the customer, cancel it) is the admin's
-- call, not a migration's, and this project has taken no bookings yet under
-- the old strings. NOT VALID skips validating existing rows against the new
-- list, so this migration cannot fail on data that predates it; the new
-- constraint still applies to every INSERT and UPDATE from this point on.
--
-- Wrapped in a transaction on purpose, same reasoning as the original
-- migration: a paste that fails halfway must not leave the constraint dropped
-- and never replaced, which would silently accept ANY string as a time_slot.
begin;

alter table bookings drop constraint time_slot_canonical;

alter table bookings add constraint time_slot_canonical check (time_slot in (
  '06.00 - 07.00','07.00 - 08.00','08.00 - 09.00','09.00 - 10.00','10.00 - 11.00','11.00 - 12.00',
  '12.00 - 13.00','13.00 - 14.00','14.00 - 15.00','15.00 - 16.00','16.00 - 17.00','17.00 - 18.00',
  '18.00 - 19.00','19.00 - 20.00','20.00 - 21.00','21.00 - 22.00','22.00 - 23.00','23.00 - 24.00'
)) not valid;

commit;
