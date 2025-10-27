// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase client (uses anon/public key)
 *
 * Requirements (in .env.local)
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Usage:
 *  import { supabase } from "@/lib/supabaseClient";
 *  const { data, error } = await supabase.storage.from('client-assets').upload(...);
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !anonKey) {
  // In dev it helps to throw loudly; in production Next will fail fast if env is missing.
  // Remove the throw if you prefer a silent fallback.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment"
  );
}

export const supabase = createClient(url, anonKey, {
  // optional: set global fetch options here
  // fetch: customFetch,
  auth: {
    // optional: persist session in localStorage (default)
    persistSession: true,
    // You can set detectSessionInUrl false for SPA-style routing
    detectSessionInUrl: false,
  },
});