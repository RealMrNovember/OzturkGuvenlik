import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString) {
    throw new Error("Set DATABASE_URL to the production connection string before running this script.");
  }
  const isSupabase = rawConnectionString.includes("supabase");
  const connectionString = isSupabase
    ? rawConnectionString.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "")
    : rawConnectionString;

  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);
  console.log("Applying pending migrations to production DB...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
