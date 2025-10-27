// src/app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // ensure Node environment

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // basic size check (optional) - protect dev server from huge uploads
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    // ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // create unique filename
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // save the file
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filepath, buffer);

    // return URL accessible via /uploads/filename
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl }, { status: 201 });
  } catch (err: any) {
    console.error("File upload error:", err);
    // return the error message (but don't leak secrets)
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}