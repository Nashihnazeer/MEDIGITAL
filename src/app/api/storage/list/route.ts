// src/app/api/storage/list/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .from("client-assets")
      .list("", { limit: 100 });

    if (error) {
      console.error("storage list error", error);
      return NextResponse.json({ error: error.message || error }, { status: 500 });
    }
    return NextResponse.json({ files: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error("server error listing storage", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}