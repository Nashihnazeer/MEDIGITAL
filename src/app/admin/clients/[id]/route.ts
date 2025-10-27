// src/app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const BUCKET = "client-assets";
const LOCAL_DATA = path.join(process.cwd(), "data", "clients.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");

/** Convert a Supabase public URL to the storage path inside the bucket.
 * Example public URL:
 * https://<proj>.supabase.co/storage/v1/object/public/client-assets/path/to/file.png
 * -> returns "path/to/file.png"
 */
function publicUrlToPath(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(String(url));
    const parts = u.pathname.split("/").filter(Boolean); // split path segments
    const publicIndex = parts.indexOf("public");
    // expected pattern: [..., 'public', '<bucket>', '<path', 'to', 'file>']
    if (publicIndex >= 0 && parts.length > publicIndex + 2) {
      // slice after bucket
      const pathParts = parts.slice(publicIndex + 2);
      return pathParts.join("/");
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function removeLocalFileByUrl(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) {
      const filename = url.replace(/^\/uploads\//, "");
      const filePath = path.join(LOCAL_UPLOADS, filename);
      await fs.unlink(filePath).catch(() => null);
    }
  } catch (err) {
    // ignore
    console.warn("removeLocalFileByUrl error:", err);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();

    const update: Record<string, any> = {};
    if ("client_name" in body) update.client_name = body.client_name;
    if ("logo_url" in body) update.logo_url = body.logo_url;
    if ("blog_title" in body) update.blog_title = body.blog_title;
    if ("blog_slug" in body) update.blog_slug = body.blog_slug;
    if ("blog_body_html" in body) update.blog_body_html = body.blog_body_html;
    if ("blog_feature_image" in body) update.blog_feature_image = body.blog_feature_image;
    if ("cta_text" in body) update.cta_text = body.cta_text;

    // Try server-side Supabase admin if available
    try {
      const mod = await import("@/lib/supabaseAdmin");
      const supabaseAdmin = mod?.supabaseAdmin;
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from("clients")
          .update(update)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("PATCH supabase error:", error);
          return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
        }
        return NextResponse.json({ success: true, client: data }, { status: 200 });
      }
    } catch (e) {
      // import failed or supabase not configured — fall back to local file
      // continue to local fallback below
    }

    // Local JSON fallback
    const raw = await fs.readFile(LOCAL_DATA, "utf8").catch(() => "[]");
    const arr = JSON.parse(raw);
    const idx = arr.findIndex((r: any) => String(r.id) === String(id));
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    arr[idx] = { ...arr[idx], ...update };
    await fs.writeFile(LOCAL_DATA, JSON.stringify(arr, null, 2), "utf8");
    return NextResponse.json({ success: true, client: arr[idx] }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Try Supabase admin first
    try {
      const mod = await import("@/lib/supabaseAdmin");
      const supabaseAdmin = mod?.supabaseAdmin;
      if (supabaseAdmin) {
        // fetch row first
        const { data: existing, error: fetchErr } = await supabaseAdmin
          .from("clients")
          .select("*")
          .eq("id", id)
          .limit(1)
          .maybeSingle();

        if (fetchErr) {
          console.error("Fetch before delete error (supabase):", fetchErr);
          return NextResponse.json({ error: fetchErr.message || "Not found" }, { status: 404 });
        }

        if (!existing) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // delete DB row
        const { error: delErr } = await supabaseAdmin.from("clients").delete().eq("id", id);
        if (delErr) {
          console.error("DB delete error:", delErr);
          return NextResponse.json({ error: delErr.message || "Delete failed" }, { status: 500 });
        }

        // attempt to delete storage objects from Supabase storage if present
        const toDeletePaths: string[] = [];
        const logoUrl = existing.logo_url ?? existing.logoUrl;
        const featUrl =
          existing.blog_feature_image ??
          existing.blogFeatureImageUrl ??
          existing.blogFeatureImage ??
          null;

        const lpath = publicUrlToPath(logoUrl);
        const fpath = publicUrlToPath(featUrl);
        if (lpath) toDeletePaths.push(lpath);
        if (fpath) toDeletePaths.push(fpath);

        if (toDeletePaths.length > 0) {
          try {
            const { error: removeErr } = await supabaseAdmin.storage.from(BUCKET).remove(toDeletePaths);
            if (removeErr) {
              console.error("Storage remove error:", removeErr);
            } else {
              console.log("Removed storage objects:", toDeletePaths);
            }
          } catch (remErr) {
            console.error("Storage remove exception:", remErr);
          }
        }

        return NextResponse.json({ success: true }, { status: 200 });
      }
    } catch (e) {
      // import failed — fall back to local JSON route below
    }

    // Local fallback: remove from data file and delete local uploads if present
    const raw = await fs.readFile(LOCAL_DATA, "utf8").catch(() => "[]");
    const arr = JSON.parse(raw);
    const idx = arr.findIndex((r: any) => String(r.id) === String(id));
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = arr[idx];
    arr.splice(idx, 1);
    await fs.writeFile(LOCAL_DATA, JSON.stringify(arr, null, 2), "utf8");

    // delete local files under public/uploads (if urls exist)
    const logoUrl = existing.logoUrl ?? existing.logo_url ?? null;
    const featUrl =
      existing.blogFeatureImageUrl ?? existing.blog_feature_image ?? existing.blogFeatureImage ?? null;

    await removeLocalFileByUrl(logoUrl);
    await removeLocalFileByUrl(featUrl);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}