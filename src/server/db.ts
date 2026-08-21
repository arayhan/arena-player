import "server-only";

import postgres from "postgres";

const DATE_OID = 1082;
const TIMESTAMPTZ_OID = 1184;

export const customTypes = {
  date: {
    to: TIMESTAMPTZ_OID,
    from: [DATE_OID, TIMESTAMPTZ_OID],
    serialize: (value: string) => value,
    parse: (value: string) => value,
  },
};

function requireDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return url;
}

let client: postgres.Sql | undefined;

function getClient(): postgres.Sql {
  if (!client) {
    client = postgres(requireDatabaseUrl(), {
      prepare: false,
      types: customTypes,
      ssl: "require",
      connect_timeout: 10,
    });
  }
  return client;
}

export const sql = new Proxy(function sql() {} as unknown as postgres.Sql, {
  apply(_target, _thisArg, args) {
    return Reflect.apply(getClient() as unknown as (...a: unknown[]) => unknown, undefined, args);
  },
  get(_target, prop, receiver) {
    return Reflect.get(getClient() as object, prop, receiver);
  },
}) as postgres.Sql;

export default sql;
