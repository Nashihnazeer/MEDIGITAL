// src/app/api/storage/list/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Lists files from the Supabase storage bucket `client-assets`.
 *
 * Optional query params:
 *   ?prefix=uploads/   → list files in a subfolder
 *   ?limit=50          → number of results (default: 100)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const prefix = url.searchParams.get("prefix") || "";
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);

    console.log(`[storage/list] Listing from prefix="${prefix}" limit=${limit}`);

    const { data, error } = await supabaseAdmin.storage
      .from("client-assets")
      .list(prefix, { limit });

    if (error) {
      console.error("[storage/list] Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to list storage files." },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn("[storage/list] No data returned from Supabase.");
      return NextResponse.json({ files: [] }, { status: 200 });
    }

    // Normalize file objects
    const normalized = data.map((item: any) => ({
      name: item.name,
      id: item.id ?? item.name,
      createdAt: item.created_at ?? null,
      updatedAt: item.updated_at ?? null,
      size: item.metadata?.size ?? 0,
      contentType: item.metadata?.mimetype ?? "unknown",
      type: item.metadata ? "file" : "folder",
      path: prefix ? `${prefix}${item.name}` : item.name,
    }));

    return NextResponse.json({ files: normalized }, { status: 200 });
  } catch (err: any) {
    console.error("[storage/list] Server exception:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}