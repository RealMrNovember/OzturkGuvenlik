import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { ogPool?: Pool };

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://og:og_dev_password@localhost:5432/ozturk";

const pool =
  globalForDb.ogPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: connectionString.includes("supabase")
      ? { rejectUnauthorized: false }
      : false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.ogPool = pool;

export const db = drizzle(pool, { schema });
export { schema };