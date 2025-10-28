// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { readClientsData } from "@/lib/data";

export async function GET() {
  try {
    const clients = await readClientsData();
    return NextResponse.json(clients, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/clients] error:", err);
    return NextResponse.json({ error: err?.message || "failed to fetch clients" }, { status: 500 });
  }
}