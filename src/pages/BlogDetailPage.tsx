import React, { useEffect, useState } from "react";
import { Post } from "../types/post";
import { readPosts } from "../lib/storage";
import Link from "next/link";
import { useParams } from "next/navigation";

function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function extractTOC(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.querySelectorAll("h2, h3"));
    return nodes.map((n, i) => {
      if (!n.id) n.id = `heading-${i}-${n.textContent?.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g,"")}`;
      return { id: n.id, text: n.textContent || "", tag: n.tagName.toLowerCase() };
    });
  } catch {
    return [];
  }
}

export default function BlogDetailPage() {
  // no generic on useParams()
const params = useParams(); // type: Record<string, string | string[] | undefined> | undefined

// normalize id to a string | undefined
const id =
  params && typeof params.id === "string"
    ? params.id
    : params && Array.isArray(params.id)
    ? params.id[0]
    : undefined;
  const [post, setPost] = useState<Post | null>(null);
  const [toc, setToc] = useState<{ id: string; text: string; tag: string }[]>([]);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);

  useEffect(() => {
    const items = readPosts();
    const found = items.find((p) => p.id === id) ?? null;
    setPost(found);
    setOtherPosts(items.filter((p) => p.id !== id).slice(0, 6));
    if (found?.content) setToc(extractTOC(found.content));
  }, [id]);

  if (!post) {
    return (
      <main className="max-w-screen-xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold">Post not found</h2>
        <p className="mt-4">This post may be removed or the ID is wrong.</p>
        <Link href="/" className="inline-block mt-6 px-4 py-2 bg-black text-white rounded">Back to blog</Link>
      </main>
    );
  }

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="relative rounded overflow-hidden mb-8">
        <img src={post.image} alt={post.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent flex items-end p-8">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold">{post.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-8 py-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">{post.author} • {post.date}</div>
              <div className="text-xs text-gray-400">{estimateReadingTime(post.content)}</div>
            </div>
            <div>
              <button className="px-4 py-2 bg-black text-white rounded">Read Full Blog ↓</button>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="flex gap-3 justify-end">
            <div className="px-3 py-2 rounded-full bg-white shadow text-sm">❤️ 24.5k</div>
            <div className="px-3 py-2 rounded-full bg-white shadow text-sm">👁 50k</div>
            <div className="px-3 py-2 rounded-full bg-white shadow text-sm">🔗 206</div>
          </div>

          <div className="p-4 border rounded">
            <div className="text-sm text-gray-500">Publication Date</div>
            <div className="mb-3 font-medium">{post.date}</div>

            <div className="text-sm text-gray-500">Category</div>
            <div className="mb-3 font-medium">{post.category}</div>

            <div className="text-sm text-gray-500">Reading Time</div>
            <div className="mb-3 font-medium">{estimateReadingTime(post.content)}</div>

            <div className="text-sm text-gray-500">Author Name</div>
            <div className="mb-3 font-medium">{post.author}</div>
          </div>

          <div className="p-4 rounded bg-gray-50">
            <h4 className="font-semibold mb-3">Table of Contents</h4>
            {toc.length === 0 ? (
              <div className="text-sm text-gray-400">No sections</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {toc.map((t) => (
                  <li key={t.id} className={t.tag === "h2" ? "font-medium" : "pl-3"}>
                    <a className="text-gray-700 hover:underline" href={`#${t.id}`}>{t.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <h3 className="text-xl font-semibold mb-6">Similar News</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {otherPosts.map((p) => (
            <article key={p.id} className="rounded overflow-hidden shadow-sm bg-white">
              <Link href={`/post/${p.id}`} className="block">
                <div className="h-36 w-full overflow-hidden">
                  <img src={p.image} alt={p.title} className="object-cover w-full h-full" />
                </div>
                <div className="p-4">
                  <div className="text-xs text-indigo-600 mb-2">{p.category}</div>
                  <h4 className="font-semibold">{p.title}</h4>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="text-xs text-gray-500">{p.author}</div>
                    <div className="ml-auto text-xs text-gray-400">❤️ 2.2k • 👁 60</div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 text-right">
          <Link href="/" className="inline-block px-4 py-2 bg-black text-white rounded">View All News →</Link>
        </div>
      </section>
    </main>
  );
}