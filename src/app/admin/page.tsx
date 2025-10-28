// src/app/admin/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

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
  images?: string[]; // uploaded image urls
  body_data?: any;
};

export default function AdminPage() {
  const [list, setList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);

  // form
  const [clientName, setClientName] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogBody, setBlogBody] = useState("");
  const [ctaText, setCtaText] = useState("Read full blog");

  // multiple file inputs (1-4)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // single legacy images (URLs returned from server after upload)
  const [logoUrl, setLogoUrl] = useState("");
  const [featureImageUrl, setFeatureImageUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFeature, setUploadingFeature] = useState(false);

  // editing modal upload state
  const [editingLogoUploading, setEditingLogoUploading] = useState(false);
  const [editingFeatureUploading, setEditingFeatureUploading] = useState(false);
  const [editingLogoPreview, setEditingLogoPreview] = useState<string | null>(null);
  const [editingFeaturePreview, setEditingFeaturePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
  setLoading(true);
  setStatus(null);
  try {
    const res = await fetch("/api/clients");
    // helpful debug: log status if things look off
    console.debug("[admin fetchList] /api/clients status:", res.status);
    const json = await res.json().catch(() => ({}));
    console.debug("[admin fetchList] /api/clients json:", json);
    setList(Array.isArray(json) ? json : []);
    if (!Array.isArray(json)) setStatus("Unexpected response from /api/clients — check server logs");
  } catch (err) {
    console.error("Error fetching clients (admin):", err);
    setStatus("Failed to load clients (see console)");
    setList([]);
  } finally {
    setLoading(false);
  }
}

  // ---------- robust response reader ----------
  async function readResponse(res: Response) {
    const text = await res.text().catch(() => "");
    let json: any = null;
    try {
      if (text) json = JSON.parse(text);
    } catch (e) {
      json = null;
    }
    return { ok: res.ok, status: res.status, json, text };
  }

  // ---------- helpers to parse server upload responses ----------
  function pickUrlFromResponse(json: any): string | null {
    if (!json) return null;
    if (typeof json === "string") return json;
    if (json.url) return String(json.url);
    if (json.publicUrl) return String(json.publicUrl);
    if (json.public_url) return String(json.public_url);
    if (json.data && (json.data.publicUrl || json.data.public_url)) return String(json.data.publicUrl || json.data.public_url);
    if (Array.isArray(json.urls) && json.urls.length > 0) return String(json.urls[0]);
    return null;
  }

  // ---------- single file upload (returns a single url string) ----------
  async function uploadFileToServer(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    console.debug("[uploadFileToServer] uploading:", file.name, file.size);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const { ok, status, json, text } = await readResponse(res);
    console.debug("[uploadFileToServer] response:", { ok, status, json, text });
    if (!ok) {
      const msg = (json && (json.error || json.message)) || text || `Upload failed (${status})`;
      throw new Error(msg);
    }
    const url = pickUrlFromResponse(json ?? text);
    if (!url) {
      console.error("uploadFileToServer no url in response:", { json, text });
      throw new Error("Upload did not return a usable url; check server response in console.");
    }
    return url;
  }

  // ---------- multi-file upload (returns array of urls)
  // NOTE: your /api/uploads only supports single-file per request, so we loop.
  async function uploadFilesToServer(files: File[]) {
    if (!files || files.length === 0) return [] as string[];
    const limited = files.slice(0, 4);
    const urls: string[] = [];
    for (const f of limited) {
      const u = await uploadFileToServer(f); // reuses single-upload endpoint
      urls.push(u);
    }
    return urls;
  }

  // ---------- delete ----------
  async function handleDelete(item: Client) {
    if (!confirm(`Delete "${item.blog_title || item.client_name}"? This will remove images.`)) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`/api/admin/clients/${item.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json && (json.error || json.message)) || `Server returned ${res.status}`);
      setStatus("Deleted ✅");
      await fetchList();
    } catch (err: any) {
      console.error("handleDelete error:", err);
      setStatus("Delete failed: " + (err.message || "unknown"));
    }
  }

  // ---------- edit uploads ----------
  async function handleEditFileInput(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "feature") {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    try {
      if (type === "logo") setEditingLogoUploading(true);
      else setEditingFeatureUploading(true);
      setStatus(null);
      const url = await uploadFileToServer(file);
      if (type === "logo") {
        setEditingLogoPreview(url);
        setEditing({ ...editing, logo_url: url });
      } else {
        setEditingFeaturePreview(url);
        setEditing({ ...editing, blog_feature_image: url });
      }
      setStatus(`Uploaded ${type}`);
    } catch (err: any) {
      console.error("handleEditFileInput error:", err);
      setStatus("Upload failed: " + (err.message || "unknown"));
    } finally {
      if (type === "logo") setEditingLogoUploading(false);
      else setEditingFeatureUploading(false);
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
        images: updated.images || undefined,
        body_data: updated.body_data || undefined,
        // IMPORTANT: use `blog_feature_image` (this matches your DB column)
        blog_feature_image: featureImageUrl || undefined,
      };
      if (updated.logo_url) payload.logo_url = updated.logo_url;
      if (updated.blog_feature_image) payload.blog_feature_image = updated.blog_feature_image;

      console.debug("[saveEdit] payload:", payload);
      const res = await fetch(`/api/admin/clients/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      console.debug("[saveEdit] response:", json, "status:", res.status);
      if (!res.ok) throw new Error((json && (json.error || json.message)) || `Server returned ${res.status}`);
      setEditing(null);
      setEditingLogoPreview(null);
      setEditingFeaturePreview(null);
      setStatus("Saved ✅");
      await fetchList();
    } catch (err: any) {
      console.error("saveEdit error:", err);
      setStatus("Save failed: " + (err.message || "unknown"));
    }
  }

  // ---------- file select ----------
  function onFilesChange(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4);
    setSelectedFiles(arr);

    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch {}
      });
      return urls;
    });

    setStatus(arr.length ? `${arr.length} image(s) selected (max 4)` : null);
  }

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\-_\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  // ---------- create ----------
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim() || !blogTitle.trim()) {
      setStatus("Please fill required fields (client name & blog title).");
      return;
    }

    // allow either a previously uploaded logo URL or selectedFiles to supply images
    if (!logoUrl && selectedFiles.length === 0) {
      setStatus("Please upload a logo (required) or select files to include.");
      return;
    }

    setStatus("Creating...");
    setUploadingFiles(true);

    try {
      // upload selectedFiles first (if any)
      let uploadedImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadFilesToServer(selectedFiles);
        console.debug("[handleCreate] uploadedImageUrls:", uploadedImageUrls);
      }

      // local logo selection: prefer explicitly uploaded logoUrl, otherwise use first uploaded image
      let logoUrlLocal = logoUrl || "";
      if (!logoUrlLocal && uploadedImageUrls.length > 0) {
        logoUrlLocal = uploadedImageUrls[0];
      }

      // build payload in snake_case (matches your DB columns)
      const payload: any = {
        client_name: clientName.trim(),
        logo_url: logoUrlLocal || undefined,
        blog_title: blogTitle.trim(),
        blog_slug: slugify(blogTitle),
        cta_text: ctaText || undefined,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        body_data: undefined, // we don't use editor JSON here; keeping as undefined
        blog_body_html: blogBody || undefined,
        // IMPORTANT: use `blog_feature_image` (matches your DB)
        blog_feature_image: featureImageUrl || (uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : undefined),
      };

      console.debug("[handleCreate] sending payload:", payload);

      // POST JSON (server sees snake_case)
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { ok, status: resStatus, json, text } = await readResponse(res);
      console.debug("[handleCreate] response:", { ok, resStatus, json, text });

      if (!ok) {
        const serverMsg = (json && (json.error || json.message)) || text || `Server returned ${resStatus}`;
        // surface the server message (helps identify missing column names, etc.)
        throw new Error(serverMsg);
      }

      setStatus("✅ Created new blog");
      setClientName("");
      setBlogTitle("");
      setBlogBody("");
      setCtaText("Read full blog");
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLogoUrl("");
      setFeatureImageUrl("");
      await fetchList();
    } catch (err: any) {
      console.error("Create failed (final):", err);
      setStatus("Create failed: " + (err?.message || "unknown"));
    } finally {
      setUploadingFiles(false);
    }
  }

  // ---------- render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Admin — Manage Clients & Blogs</h1>

        <form onSubmit={handleCreate} className="bg-white shadow p-6 rounded space-y-4">
          <h2 className="font-semibold text-lg">Add New Client + Blog</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Client Name *</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Blog Title *</label>
              <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Blog Body *</label>
            <textarea value={blogBody} onChange={(e) => setBlogBody(e.target.value)} rows={8} className="w-full border rounded px-2 py-2" />
            <p className="text-xs text-gray-500 mt-1">Plain HTML/text saved to <code>blog_body_html</code>.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Images (1–4) — optional</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => onFilesChange(e.target.files)} />
            <div className="mt-3 flex gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="w-28 h-28 relative border overflow-hidden rounded">
                  <Image src={src} alt={`preview-${idx}`} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{selectedFiles.length} image(s) selected (max 4).</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Logo (required)</label>
              {logoUrl ? (
                <div className="relative w-28 h-20 bg-gray-50 border rounded flex items-center justify-center">
                  <Image src={logoUrl} alt="logo" fill style={{ objectFit: "contain" }} sizes="112px" />
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingLogo(true);
                  try {
                    const url = await uploadFileToServer(file);
                    setLogoUrl(url);
                    setStatus("Logo uploaded");
                  } catch (err: any) {
                    console.error("Logo upload error:", err);
                    setStatus("Upload failed: " + (err?.message || err));
                  } finally {
                    setUploadingLogo(false);
                  }
                }} />
              )}
              {uploadingLogo && <div className="text-xs text-gray-500">Uploading...</div>}
            </div>

            <div>
              <label className="block text-sm font-medium">Feature Image (optional)</label>
              {featureImageUrl ? (
                <div className="relative w-28 h-20 bg-gray-50 border rounded flex items-center justify-center">
                  <Image src={featureImageUrl} alt="feature" fill style={{ objectFit: "contain" }} sizes="112px" />
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingFeature(true);
                  try {
                    const url = await uploadFileToServer(file);
                    setFeatureImageUrl(url);
                    setStatus("Feature image uploaded");
                  } catch (err: any) {
                    console.error("Feature upload error:", err);
                    setStatus("Upload failed: " + (err?.message || err));
                  } finally {
                    setUploadingFeature(false);
                  }
                }} />
              )}
              {uploadingFeature && <div className="text-xs text-gray-500">Uploading...</div>}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={uploadingFiles} className="px-4 py-2 bg-orange-500 text-white rounded">
              {uploadingFiles ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        {/* Existing clients */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Existing Clients</h2>
          {loading ? <div>Loading…</div> : list.length === 0 ? <div>No clients found.</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((c) => (
                <div key={c.id} className="bg-white p-4 rounded shadow flex gap-4">
                  <div className="w-28 h-20 relative flex-shrink-0">
                    {c.logo_url ? <Image src={c.logo_url} alt={c.client_name || "logo"} fill style={{ objectFit: "contain" }} sizes="112px" /> : <div className="bg-gray-100 w-full h-full flex items-center justify-center text-xs text-gray-400">No logo</div>}
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
        </div>

        {status && <div className="text-sm mt-4 text-gray-700">{status}</div>

        }

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded max-w-2xl w-full space-y-3">
              <h3 className="font-bold mb-2">Edit — {editing.blog_title}</h3>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Client Name</label>
                <input value={editing.client_name || ""} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} className="w-full border rounded px-2 py-1" />
                <label className="block text-sm font-medium">Blog Title</label>
                <input value={editing.blog_title || ""} onChange={(e) => setEditing({ ...editing, blog_title: e.target.value })} className="w-full border rounded px-2 py-1" />
                <label className="block text-sm font-medium">Blog Body (HTML/text)</label>
                <textarea value={editing.blog_body_html || ""} onChange={(e) => setEditing({ ...editing, blog_body_html: e.target.value })} rows={6} className="w-full border rounded px-2 py-1" />
                <label className="block text-sm font-medium">Logo (upload to replace)</label>
                <div className="flex items-center gap-3">
                  {editingLogoPreview || editing.logo_url ? <div className="relative w-28 h-20 bg-gray-50 border rounded flex items-center justify-center"><Image src={editingLogoPreview || editing.logo_url!} alt="logo" fill style={{ objectFit: "contain" }} sizes="112px" /></div> : null}
                  <input type="file" accept="image/*" onChange={(e) => handleEditFileInput(e, "logo")} />
                  {editingLogoUploading && <div className="text-xs text-gray-500">Uploading...</div>}
                </div>
                <label className="block text-sm font-medium">Feature Image (upload to replace)</label>
                <div className="flex items-center gap-3">
                  {editingFeaturePreview || editing.blog_feature_image ? <div className="relative w-28 h-20 bg-gray-50 border rounded flex items-center justify-center"><Image src={editingFeaturePreview || editing.blog_feature_image!} alt="feature" fill style={{ objectFit: "contain" }} sizes="112px" /></div> : null}
                  <input type="file" accept="image/*" onChange={(e) => handleEditFileInput(e, "feature")} />
                  {editingFeatureUploading && <div className="text-xs text-gray-500">Uploading...</div>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button onClick={() => saveEdit(editing)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}