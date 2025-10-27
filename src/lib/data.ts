// src/lib/data.ts
import { supabaseAdmin } from "./supabaseAdmin";
import fs from "fs/promises";
import path from "path";

export type ClientRow = Record<string, any>;

/**
 * readClientsData
 * - First tries to fetch from Supabase (server/service role).
 * - If that fails (e.g. no DB during local dev), falls back to reading data/clients.json.
 */
export async function readClientsData(): Promise<ClientRow[]> {
  // Try Supabase first (server-side)
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      } else {
        // Log and fall back
        console.warn("readClientsData: Supabase returned error, falling back:", error);
      }
    }
  } catch (err) {
    // If supabaseAdmin import or call fails, fallback to file below
    console.warn("readClientsData: Supabase fetch failed, falling back to local file.", err);
  }

  // Fallback: read local JSON file (data/clients.json)
  try {
    const filePath = path.join(process.cwd(), "data", "clients.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    console.warn("readClientsData: failed to read local data file:", err);
    return [];
  }
}