// src/app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function getStoragePathFromPublicUrl(url: string, bucketName = "client-assets") {
  if (!url) return null;
  try {
    const u = new URL(url);
    // example pathname: /storage/v1/object/public/client-assets/uploads/123.png
    const parts = u.pathname.split("/").filter(Boolean);
    // find the index of the bucket name (client-assets)
    const bucketIdx = parts.findIndex((p) => p === bucketName);
    if (bucketIdx === -1) return null;
    const after = parts.slice(bucketIdx + 1);
    if (!after.length) return null;
    return after.join("/");
  } catch (e) {
    return null;
  }
}

export async function DELETE(req: Request, { params }: { params: { id?: string } }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

    // read row to find images to delete
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("fetchErr:", fetchErr);
      return NextResponse.json({ error: fetchErr.message || String(fetchErr) }, { status: 500 });
    }

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const bucketName = "client-assets"; // adjust if your bucket has different name
    const toRemove: string[] = [];

    const logoUrl = row.logo_url ?? row.logoUrl ?? null;
    const featureUrl = row.blog_feature_image ?? row.blogFeatureImage ?? null;

    const logoPath = logoUrl ? getStoragePathFromPublicUrl(logoUrl, bucketName) : null;
    const featPath = featureUrl ? getStoragePathFromPublicUrl(featureUrl, bucketName) : null;

    if (logoPath) toRemove.push(logoPath);
    if (featPath && featPath !== logoPath) toRemove.push(featPath);

    if (toRemove.length > 0) {
      try {
        const { data: delData, error: delError } = await supabaseAdmin
          .storage
          .from(bucketName)
          .remove(toRemove);

        if (delError) {
          console.error("Storage delete error:", delError);
          // don't fail the entire deletion because of storage deletion failure,
          // but inform the client in the response.
        } else {
          console.log("Removed storage objects:", delData);
        }
      } catch (err) {
        console.error("Exception deleting storage objects:", err);
      }
    }

    // delete DB row
    const { data: deletedRow, error: deleteErr } = await supabaseAdmin
      .from("clients")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (deleteErr) {
      console.error("Error deleting DB row:", deleteErr);
      return NextResponse.json({ error: deleteErr.message || String(deleteErr) }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: deletedRow }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/admin/clients/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id?: string } }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    // Only allow these updatable fields (map to DB column names)
    const allowed: Record<string, string> = {
      client_name: "client_name",
      blog_title: "blog_title",
      blog_slug: "blog_slug",
      blog_body_html: "blog_body_html",
      cta_text: "cta_text",
      logo_url: "logo_url",
      blog_feature_image: "blog_feature_image",
    };

    const payload: Record<string, any> = {};
    for (const key of Object.keys(allowed)) {
      if (body[key] !== undefined) payload[allowed[key]] = body[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("clients")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Update error:", updateErr);
      return NextResponse.json({ error: updateErr.message || String(updateErr) }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/admin/clients/[id] error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}