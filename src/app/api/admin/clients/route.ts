// src/app/api/admin/clients/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Admin POST: insert a new client+blog into Supabase (server-side, service role).
 * Also implements a GET to list clients (useful for testing via same route).
 */

function makeSlug(s: string) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch (err: any) {
    console.error("Server error GET /api/admin/clients:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientName,
      logoUrl,
      blogTitle,
      blogSlug,
      blogBodyHtml,
      ctaText,
      blogFeatureImageUrl,
    } = body;

    if (!clientName || !logoUrl || !blogTitle || !blogBodyHtml) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // make slug, ensure uniqueness by checking existing rows
    let slug = blogSlug && String(blogSlug).trim().length ? String(blogSlug).trim() : makeSlug(blogTitle);
    slug = makeSlug(slug);

    const { data: existing, error: checkErr } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("blog_slug", slug)
      .limit(1);

    if (checkErr) {
      console.error("Error checking slug:", checkErr);
    }

    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const insertPayload: Record<string, any> = {
      client_name: clientName,
      logo_url: logoUrl,
      blog_title: blogTitle,
      blog_slug: slug,
      blog_body_html: blogBodyHtml,
      blog_feature_image: blogFeatureImageUrl || null,
      cta_text: ctaText || null,
    };

    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message || "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, client: data }, { status: 201 });
  } catch (err: any) {
    console.error("Server error POST /api/admin/clients:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}