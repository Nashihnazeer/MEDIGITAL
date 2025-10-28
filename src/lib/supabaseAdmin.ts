// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * IMPORTANT:
 * - NEXT_PUBLIC_SUPABASE_URL must be set (your Supabase project URL).
 * - SUPABASE_SERVICE_ROLE_KEY must be set (the service_role key from Supabase).
 *
 * Put these in .env.local for local dev:
 * NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
 *
 * After adding env vars, restart the Next.js server.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "supabaseAdmin: Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});