// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeRow(row: Record<string, any>) {
  return {
    id: row.id ?? row.client_name ?? String(row.id ?? Math.random()),
    clientName: row.client_name ?? row.clientName ?? row.name ?? "",
    logoUrl: row.logo_url ?? row.logoUrl ?? row.logo ?? "",
    blogTitle: row.blog_title ?? row.blogTitle ?? row.title ?? "",
    blogSlug: row.blog_slug ?? row.blogSlug ?? row.slug ?? "",
    blogBodyHtml: row.blog_body_html ?? row.blogBodyHtml ?? row.body ?? "",
    blogFeatureImageUrl:
      row.blog_feature_image ?? row.blogFeatureImage ?? row.feature_image ?? row.featureImage ?? null,
    ctaText: row.cta_text ?? row.ctaText ?? "Read full blog",
    createdAt: row.created_at ?? row.createdAt ?? null,
    raw: row,
  };
}

export async function GET() {
  try {
    // fetch from Supabase (server-side, service role)
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false }); // adjust column if different

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json([], { status: 200 });
    }

    const rows = Array.isArray(data) ? data.map(normalizeRow) : [];
    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("Server error in GET /api/clients:", err);
    return NextResponse.json([], { status: 500 });
  }
}