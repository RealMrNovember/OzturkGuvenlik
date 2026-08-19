import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://og:og_dev_password@localhost:5432/ozturk",
    ssl: process.env.DATABASE_URL?.includes("supabase") ?? false,
  },
  strict: true,
  verbose: true,
});