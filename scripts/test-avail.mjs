import { availabilityFor } from "../src/server/availability.ts";

async function test() {
  process.env.DATABASE_URL =
    "postgresql://postgres.lrelwuikjiuqvlduxzdy:4DcebvWK4LjC0FlJ@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";
  process.env.NODE_ENV = "development";
  const res = await availabilityFor("2026-08-20");
  console.log("Availability for 2026-08-20:");
  console.log(res.slice(0, 3));
}

test();
