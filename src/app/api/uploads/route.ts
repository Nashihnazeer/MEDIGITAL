// src/app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // ensure Node environment

const BUCKET = "client-assets";
const FOLDER = "uploads";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB soft limit (adjustable)

function getExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() || "png").toLowerCase() : "png";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Accept either single 'file' or multiple 'files' keys
    const singleFile = formData.get("file") as File | null;
    const multiFiles = formData.getAll("files").filter(Boolean) as File[];

    const filesToProcess: File[] = [];
    if (singleFile) filesToProcess.push(singleFile);
    if (multiFiles && multiFiles.length > 0) filesToProcess.push(...multiFiles);

    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of filesToProcess) {
      if (!(file instanceof File)) continue;

      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_BYTES) {
        return NextResponse.json(
          { error: `File too large (max ${Math.round(MAX_BYTES / 1024 / 1024)}MB)` },
          { status: 413 }
        );
      }

      const ext = getExt(file.name || "upload.png");
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const filePath = `${FOLDER}/${filename}`;
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type || `image/${ext}`,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[uploads] single file upload error:", uploadError);
        return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 });
      }

      if (!uploadData?.path) {
        console.error("[uploads] upload returned no path for file:", file.name);
        return NextResponse.json({ error: "Upload succeeded but no path returned" }, { status: 500 });
      }

      // NOTE: getPublicUrl returns { data: { publicUrl: string } }
      // it does not return an `error` property, so do not destructure `error`.
      const publicUrlResult = supabaseAdmin.storage.from(BUCKET).getPublicUrl(uploadData.path);

      // safe access:
      const publicUrl = (publicUrlResult && (publicUrlResult as any).data && (publicUrlResult as any).data.publicUrl)
        ? (publicUrlResult as any).data.publicUrl
        : null;

      if (!publicUrl) {
        console.error("[uploads] publicUrl missing for path:", uploadData.path, "raw:", publicUrlResult);
        return NextResponse.json({ error: "Failed to retrieve public URL" }, { status: 500 });
      }

      uploadedUrls.push(publicUrl);
    }

    // respond with single url for single upload, or array for multi
    if (uploadedUrls.length === 1) {
      return NextResponse.json({ url: uploadedUrls[0] }, { status: 201 });
    }
    return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
  } catch (err: any) {
    console.error("[uploads] Exception:", err);
    return NextResponse.json({ error: (err && err.message) || "Upload failed" }, { status: 500 });
  }
}