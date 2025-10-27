// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

type Client = {
  id: string;
  client_name?: string;
  logo_url?: string;
  blog_title?: string;
  blog_slug?: string;
  blog_body_html?: string;
  blog_feature_image?: string;
  cta_text?: string;
  created_at?: string;
};

export default function AdminPage() {
  const [list, setList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      const json = await res.json();
      setList(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleDelete(item: Client) {
    if (!confirm(`Delete "${item.blog_title || item.client_name}"? This will remove images.`)) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`/api/admin/clients/${item.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Server returned ${res.status}`);
      setStatus("Deleted ✅");
      await fetchList();
    } catch (err: any) {
      console.error(err);
      setStatus("Delete failed: " + (err.message || "unknown"));
    }
  }

  async function saveEdit(updated: Client) {
    if (!updated?.id) return;
    setStatus("Saving...");
    try {
      const payload: any = {
        client_name: updated.client_name,
        blog_title: updated.blog_title,
        blog_slug: updated.blog_slug,
        blog_body_html: updated.blog_body_html,
        cta_text: updated.cta_text,
        // don't change image URLs here — uploading handled elsewhere
      };
      const res = await fetch(`/api/admin/clients/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Server returned ${res.status}`);
      setEditing(null);
      setStatus("Saved ✅");
      await fetchList();
    } catch (err: any) {
      console.error(err);
      setStatus("Save failed: " + (err.message || "unknown"));
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Clients & Blogs</h1>

      <div className="mb-4">
        <button onClick={fetchList} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
        <span className="ml-4 text-sm text-gray-600">{status}</span>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : list.length === 0 ? (
        <div>No clients found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded shadow flex gap-4">
              <div className="w-28 h-20 relative flex-shrink-0">
                {c.logo_url ? (
                  <Image src={c.logo_url} alt={c.client_name || "logo"} fill style={{ objectFit: "contain" }} sizes="112px" />
                ) : (
                  <div className="bg-gray-100 w-full h-full flex items-center justify-center text-xs text-gray-400">No logo</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-600">{c.client_name}</div>
                    <div className="font-semibold">{c.blog_title}</div>
                    <div className="text-xs text-gray-500">{c.blog_slug}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setEditing(c)} className="px-2 py-1 bg-blue-500 text-white text-sm rounded">Edit</button>
                    <button onClick={() => handleDelete(c)} className="px-2 py-1 bg-red-500 text-white text-sm rounded">Delete</button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: c.blog_body_html || "" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Edit area */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <h3 className="font-bold mb-2">Edit — {editing.blog_title}</h3>

            <label className="block text-xs">Client name</label>
            <input value={editing.client_name || ""} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} className="w-full border px-2 py-1 rounded mb-2" />

            <label className="block text-xs">Blog title</label>
            <input value={editing.blog_title || ""} onChange={(e) => setEditing({ ...editing, blog_title: e.target.value })} className="w-full border px-2 py-1 rounded mb-2" />

            <label className="block text-xs">Blog slug</label>
            <input value={editing.blog_slug || ""} onChange={(e) => setEditing({ ...editing, blog_slug: e.target.value })} className="w-full border px-2 py-1 rounded mb-2" />

            <label className="block text-xs">CTA text</label>
            <input value={editing.cta_text || ""} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} className="w-full border px-2 py-1 rounded mb-2" />

            <label className="block text-xs">Blog body (HTML allowed)</label>
            <textarea value={editing.blog_body_html || ""} onChange={(e) => setEditing({ ...editing, blog_body_html: e.target.value })} rows={6} className="w-full border px-2 py-1 rounded mb-3" />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
              <button onClick={() => saveEdit(editing)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}