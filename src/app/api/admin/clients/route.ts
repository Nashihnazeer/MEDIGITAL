// src/app/api/admin/clients/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // ensure node runtime

// NOTE: adjust table name if different
const TABLE = "clients";

/**
 * POST: create a client/blog
 * Accepts JSON body with snake_case keys (or camelCase) such as:
 * {
 *   client_name: "Acme",
 *   logo_url: "https://...",
 *   blog_title: "My blog",
 *   blog_slug: "my-blog",
 *   cta_text: "Read more",
 *   images: ["https://..","..."],         // optional array of image URLs
 *   body_data: {...}                      // optional Editor.js JSON (will be inserted as jsonb)
 *   blog_body_html: "<p>fallback html</p>" // optional
 *   blog_feature_image_url: "https://..." // optional
 * }
 */
export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, any>;

    // Basic validation
    const client_name = (payload.client_name ?? payload.clientName ?? "").toString().trim();
    const blog_title = (payload.blog_title ?? payload.blogTitle ?? "").toString().trim();
    const logo_url = (payload.logo_url ?? payload.logoUrl ?? "").toString().trim();

    if (!client_name || !blog_title) {
      return NextResponse.json({ error: "Missing required fields: client_name and blog_title are required." }, { status: 400 });
    }
    if (!logo_url) {
      // keep behaviour consistent with your UI which required logo
      return NextResponse.json({ error: "Missing required field: logo_url is required." }, { status: 400 });
    }

    // Prepare row — prefer snake_case columns to match DB naming
    const row: Record<string, any> = {
      client_name,
      logo_url,
      blog_title,
      blog_slug: payload.blog_slug ?? payload.blogSlug ?? (payload.blog_slug ? payload.blog_slug : blog_title.toLowerCase().replace(/\s+/g, "-")),
      cta_text: payload.cta_text ?? payload.ctaText ?? null,
      blog_body_html: payload.blog_body_html ?? payload.blogBodyHtml ?? null,
      blog_feature_image_url: payload.blog_feature_image_url ?? payload.blogFeatureImageUrl ?? payload.blog_feature_image ?? payload.blogFeatureImage ?? null,
      // images: ensure it's an array (store JSONB)
      images: Array.isArray(payload.images) ? payload.images : ([] as string[]),
      // body_data is expected to be an object (Editor.js JSON); store as jsonb
      body_data: payload.body_data ?? payload.bodyData ?? null,
      created_at: new Date().toISOString(),
    };

    // Insert
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert([row])
      .select("*")
      .single();

    if (error) {
      console.error("[POST /api/admin/clients] insert error:", error);
      return NextResponse.json({ error: error.message ?? "Insert failed" }, { status: 500 });
    }

    // normalize minimal response back
    return NextResponse.json({ success: true, row: data }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/clients] exception:", err);
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 });
  }
}

/**
 * PATCH: update an existing client/blog by id
 * PATCH expects JSON with keys to update. Example:
 * { client_name: "New", images: ["..."], body_data: {...} }
 */
export async function PATCH(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, any>;
    const id = payload.id ?? payload.rowId ?? null;
    if (!id) return NextResponse.json({ error: "Missing id for PATCH" }, { status: 400 });

    // build update object — only include provided keys
    const update: Record<string, any> = {};
    if (payload.client_name ?? payload.clientName) update.client_name = payload.client_name ?? payload.clientName;
    if (payload.logo_url ?? payload.logoUrl) update.logo_url = payload.logo_url ?? payload.logoUrl;
    if (payload.blog_title ?? payload.blogTitle) update.blog_title = payload.blog_title ?? payload.blogTitle;
    if (payload.blog_slug ?? payload.blogSlug) update.blog_slug = payload.blog_slug ?? payload.blogSlug;
    if (payload.cta_text ?? payload.ctaText) update.cta_text = payload.cta_text ?? payload.ctaText;
    if (payload.blog_body_html ?? payload.blogBodyHtml) update.blog_body_html = payload.blog_body_html ?? payload.blogBodyHtml;
    if (payload.blog_feature_image_url ?? payload.blogFeatureImageUrl) update.blog_feature_image_url = payload.blog_feature_image_url ?? payload.blogFeatureImageUrl;
    if (payload.images !== undefined) update.images = Array.isArray(payload.images) ? payload.images : [];
    if (payload.body_data !== undefined) update.body_data = payload.body_data;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[PATCH /api/admin/clients] update error:", error);
      return NextResponse.json({ error: error.message ?? "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, row: data }, { status: 200 });
  } catch (err: any) {
    console.error("[PATCH /api/admin/clients] exception:", err);
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 });
  }
}