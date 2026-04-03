/**
 * Run this script ONCE to apply the database fixes via Supabase REST API.
 * Usage:  node scripts/apply-db-fix.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read from .env.local
const envPath = path.join(__dirname, "../.env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, "fix-db.sql"), "utf-8");

// Split into individual statements (skip empty lines / comments)
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`🔧  Running ${statements.length} SQL statements against ${SUPABASE_URL} ...\n`);

let ok = 0;
let fail = 0;

for (const stmt of statements) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: stmt + ";" }),
  });

  // Supabase doesn't expose a generic SQL endpoint via REST;
  // we'll use the pg-meta endpoint that ship with the project.
  const pgRes = await fetch(`${SUPABASE_URL.replace(".supabase.co", ".supabase.co")}/pg-meta/v1/query`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: stmt + ";" }),
  });

  if (pgRes.ok) {
    console.log(`  ✅  OK: ${stmt.slice(0, 70).replace(/\n/g, " ")}...`);
    ok++;
  } else {
    const body = await pgRes.text();
    console.error(`  ❌  FAIL (${pgRes.status}): ${stmt.slice(0, 70).replace(/\n/g, " ")}...\n     ${body}`);
    fail++;
  }
}

console.log(`\n🏁  Done — ${ok} succeeded, ${fail} failed.`);
if (fail > 0) {
  console.log("\n👉  If pg-meta is unavailable, run the SQL manually in Supabase Dashboard → SQL Editor.");
}
