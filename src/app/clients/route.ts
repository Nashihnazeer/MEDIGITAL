// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");

export async function GET() {
  try {
    const raw = await fs.readFile(CLIENTS_FILE, "utf-8");
    const clients = JSON.parse(raw || "[]");
    return NextResponse.json(clients);
  } catch (err) {
    // If file missing or invalid, return empty array
    return NextResponse.json([]);
  }
}