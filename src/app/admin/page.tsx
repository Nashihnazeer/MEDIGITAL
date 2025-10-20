// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/post";
import { readPosts, writePosts } from "@/lib/storage";
import { JSX } from "react/jsx-runtime";
import Image from "next/image";

/**
 * Admin page — Next.js App Router client component
 * Place as app/admin/page.tsx
 *
 * Note: adjust import paths (alias @) per your tsconfig; if you don't have @, use relative imports.
 */

export default function AdminPage(): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPosts(readPosts());
  }, []);

  function startEdit(id: string) {
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm(JSON.parse(JSON.stringify(p)));
    setTimeout(() => {
      const el = document.getElementById("admin-editor");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function createNew() {
    const id = `post-${Date.now()}`;
    const newPost: Post = {
      id,
      title: "New post",
      image: "",
      summary: "Short summary ...",
      content: "<h2>New Post</h2><p>Edit content here...</p>",
      author: "Author Name",
      date: new Date().toLocaleDateString(),
      category: "Uncategorized",
    };
    const next = [newPost, ...posts];
    writePosts(next);
    setPosts(next);
    startEdit(id);
  }

  function saveForm() {
    if (!form) return;
    setBusy(true);
    try {
      const next = posts.map((p) => (p.id === form.id ? form : p));
      writePosts(next);
      setPosts(next);
      alert("Saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setBusy(false);
    }
  }

  function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const next = posts.filter((p) => p.id !== id);
    writePosts(next);
    setPosts(next);
    if (editingId === id) {
      setEditingId(null);
      setForm(null);
    }
  }

  function resetToSeed() {
    if (!confirm("Reset to seed data?")) return;
    const seed: Post[] = [
      {
        id: "post-1",
        title: "Lorem ipsum dolor",
        image: "https://placehold.co/1200x800?text=Post+1",
        summary:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Short summary shows on card.",
        content:
          "<h2>Intro</h2><p>This is the full HTML content for Post 1. Edit via admin panel.</p><h2>More</h2><p>More content.</p>",
        author: "Phoenix Baker",
        date: "19 Jan 2022",
        category: "Product",
      },
      {
        id: "post-2",
        title: "Designing the admin UX",
        image: "https://placehold.co/1200x800?text=Post+2",
        summary: "A quick overview of admin UX patterns used to manage cards & full posts.",
        content: "<h2>Why UX</h2><p>Details about admin UX.</p>",
        author: "Phoenix Baker",
        date: "19 Jan 2022",
        category: "Product",
      },
    ];
    writePosts(seed);
    setPosts(seed);
    setEditingId(null);
    setForm(null);
    alert("Reset complete");
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, image: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  function setImageUrlPreview(url: string) {
    if (!form) return;
    if (!url) return alert("Paste an image URL first");
    setForm({ ...form, image: url });
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin — Manage Posts</h1>
        <div className="flex gap-2">
          <button onClick={createNew} className="px-3 py-1 bg-green-600 text-white rounded">
            + New post
          </button>
          <button onClick={resetToSeed} className="px-3 py-1 bg-gray-200 rounded">
            Reset
          </button>
          <button onClick={() => router.push("/")} className="px-3 py-1 bg-black text-white rounded">
            View site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <section className="lg:col-span-2 space-y-4">
          {posts.length === 0 ? (
            <div className="p-4 bg-white rounded shadow text-gray-500">No posts yet.</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-white p-3 rounded shadow">
                <div className="relative w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.category} • {p.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p.id)} className="px-2 py-1 rounded bg-yellow-400">Edit</button>
                      <button onClick={() => deletePost(p.id)} className="px-2 py-1 rounded bg-red-500 text-white">Delete</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.summary}</p>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Editor */}
        <aside id="admin-editor" className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Editor</h2>

          {!editingId || !form ? (
            <div className="text-sm text-gray-500">Select a post to edit or create a new one.</div>
          ) : (
            <>
              <label className="block text-xs text-gray-600">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded mb-2" />

              <label className="block text-xs text-gray-600">Author</label>
              <input value={form.author ?? ""} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full p-2 border rounded mb-2" />

              <label className="block text-xs text-gray-600">Date</label>
              <input value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded mb-2" placeholder="e.g. 19 Jan 2022" />

              <label className="block text-xs text-gray-600">Category</label>
              <input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-2 border rounded mb-2" />

              <label className="block text-xs text-gray-600">Image (URL)</label>
              <div className="flex gap-2 mb-2">
                <input value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="flex-1 p-2 border rounded" placeholder="Paste image URL or upload below" />
                <button type="button" onClick={() => setImageUrlPreview(form.image ?? "")} className="px-3 py-1 bg-gray-100 rounded">Preview</button>
              </div>

              <label className="block text-xs text-gray-600">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageFile} className="block mb-3" />

              <label className="block text-xs text-gray-600">Summary (card)</label>
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full p-2 border rounded mb-2" rows={3} />

              <label className="block text-xs text-gray-600">Full content (HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full p-2 border rounded mb-2" rows={8} />

              <div className="flex gap-2 mt-2">
                <button onClick={saveForm} disabled={busy} className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-60">Save</button>
                <button onClick={() => { setEditingId(null); setForm(null); }} className="px-3 py-1 bg-gray-200 rounded">Close</button>
                <button onClick={() => { writePosts(posts); alert("Saved"); }} className="px-3 py-1 bg-gray-100 rounded">Sync</button>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Preview */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        {form ? (
          <div className="bg-white rounded shadow p-4">
            <div className="md:flex gap-6">
              <div className="md:flex-1">
                <div className="h-48 w-full overflow-hidden rounded mb-4 bg-gray-100 relative">
                  {form.image ? (
                    <Image
                      src={form.image}
                      alt={form.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <h4 className="font-bold text-xl mb-2">{form.title}</h4>
                <div className="text-sm text-gray-500 mb-3">{form.category} • {form.date} • {form.author}</div>
                <p className="text-gray-700 mb-4">{form.summary}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.content }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No preview — select a post to see it here</div>
        )}
      </section>
    </main>
  );
}