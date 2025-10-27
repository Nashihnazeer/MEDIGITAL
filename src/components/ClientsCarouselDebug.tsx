// src/components/ClientsCarouselDebug.tsx
"use client";

import React, { useEffect, useState } from "react";

type Props = { apiUrl?: string };

export default function ClientsCarouselDebug({ apiUrl = "/api/clients" }: Props) {
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const res = await fetch(apiUrl, { cache: "no-store" });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          json = text;
        }
        if (!mounted) return;
        setRaw({ status: res.status, ok: res.ok, body: json });
      } catch (e: any) {
        if (!mounted) return;
        setErr(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-black rounded shadow">
      <h2 className="text-lg font-semibold mb-3">ClientsCarousel Debug</h2>
      <p className="text-sm mb-3">Fetching: <code>{apiUrl}</code></p>

      {loading && <p>Loading…</p>}

      {err && (
        <div className="p-3 mb-3 bg-red-50 text-red-700 rounded">
          <strong>Fetch error:</strong> {err}
        </div>
      )}

      {raw && (
        <div className="space-y-2">
          <div>
            <strong>HTTP:</strong> {raw.status} — ok: {String(raw.ok)}
          </div>
          <div>
            <strong>Body (preview):</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded max-h-72 overflow-auto text-xs">
              {typeof raw.body === "string" ? raw.body : JSON.stringify(raw.body, null, 2)}
            </pre>
          </div>
          <div>
            <strong>First item (if array):</strong>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs">
              {Array.isArray(raw.body) && raw.body.length > 0 ? JSON.stringify(raw.body[0], null, 2) : "n/a"}
            </pre>
          </div>
        </div>
      )}
      {!loading && !raw && !err && <div>No response</div>}
    </div>
  );
}