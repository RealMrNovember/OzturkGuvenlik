import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { ogPool?: Pool };

const rawConnectionString =
  process.env.DATABASE_URL ??
  "postgres://og:og_dev_password@localhost:5432/ozturk";

const isSupabase = rawConnectionString.includes("supabase");

// pg's own sslmode parsing (from a pasted Supabase connection string) fights
// with the explicit `ssl` option below and forces full chain verification,
// which fails against Supabase's pooler cert. Strip it so only the explicit
// option applies.
const connectionString = isSupabase
  ? rawConnectionString.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "")
  : rawConnectionString;

const pool =
  globalForDb.ogPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.ogPool = pool;

export const db = drizzle(pool, { schema });
export { schema };