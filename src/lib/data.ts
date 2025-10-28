// src/lib/data.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import fs from "fs/promises";
import path from "path";

export type ClientRow = Record<string, any>;

function parseImagesField(raw: any): string[] {
  try {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
    if (typeof raw === "string") {
      const s = raw.trim();
      if (!s) return [];
      // try parse JSON string (common when storing as text/json)
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        // not JSON — allow comma separated fallback
        return s.split(",").map((x) => x.trim()).filter(Boolean);
      }
    }
    // if raw is object (maybe jsonb with nested) try common keys
    if (typeof raw === "object") {
      if (Array.isArray(raw.urls)) return raw.urls.filter(Boolean).map(String);
      // flatten values
      return Object.values(raw)
        .flat()
        .filter(Boolean)
        .map(String);
    }
  } catch (e) {
    // ignore parsing errors
  }
  return [];
}

function normalizeRow(row: Record<string, any>) {
  const images = parseImagesField(row.images ?? row.image_urls ?? row.imageUrls ?? row.images_json ?? null);
  return {
    id: String(row.id ?? row.client_name ?? Math.random()),
    clientName: row.client_name ?? row.clientName ?? row.name ?? "",
    logoUrl: row.logo_url ?? row.logoUrl ?? row.logo ?? "",
    blogTitle: row.blog_title ?? row.blogTitle ?? row.title ?? "",
    blogSlug: row.blog_slug ?? row.blogSlug ?? row.slug ?? "",
    blogBodyHtml: row.blog_body_html ?? row.blogBodyHtml ?? row.body ?? "",
    blogFeatureImageUrl:
      row.blog_feature_image??
      row.blog_feature_image ??
      row.blogFeatureImageUrl ??
      row.feature_image ??
      row.featureImage ??
      null,
    ctaText: row.cta_text ?? row.ctaText ?? "Read full blog",
    createdAt: row.created_at ?? row.createdAt ?? null,
    images,
    bodyData: row.body_data ?? row.bodyData ?? null,
    raw: row,
  };
}

/**
 * readClientsData
 * - First tries to fetch from Supabase (server/service role).
 * - If that fails (e.g. no DB during local dev), falls back to reading data/clients.json.
 * - Returns normalized rows (camelCase, images array, bodyData).
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
        return data.map(normalizeRow);
      } else {
        console.warn("readClientsData: Supabase returned error, falling back:", error);
      }
    }
  } catch (err) {
    console.warn("readClientsData: Supabase fetch failed, falling back to local file.", err);
  }

  // Fallback: read local JSON file (data/clients.json)
  try {
    const filePath = path.join(process.cwd(), "data", "clients.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(normalizeRow);
    return [];
  } catch (err) {
    console.warn("readClientsData: failed to read local data file:", err);
    return [];
  }
}