import React, { useEffect, useState } from "react";

import { Post } from "../types/post";
import { readPosts } from "../lib/storage";
import Link from "next/link";

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    setPosts(readPosts());
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.summary.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-4">Lorem ipsum dolor</h1>
        <div className="flex justify-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for our Blogs..."
            className="w-full md:w-96 px-4 py-2 rounded bg-white border"
          />
          <button className="px-4 py-2 bg-black text-white rounded">Search</button>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.slice(0, visibleCount).map((p) => (
            <article key={p.id} className="bg-white rounded shadow overflow-hidden">
              <Link href={`/post/${p.id}`} className="block">
                <div className="h-44 w-full overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-xs text-indigo-600 font-medium mb-2">{p.category}</div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.summary}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      {p.author ? p.author.split(" ").map(s=>s[0]).slice(0,2).join("") : "P"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>{p.author}</div>
                      <div>{p.date}</div>
                    </div>
                    <div className="ml-auto text-sm text-gray-400">↗</div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          {visibleCount < filtered.length ? (
            <button onClick={() => setVisibleCount((v) => v + 6)} className="px-6 py-2 bg-black text-white rounded">
              ⬇ Load more
            </button>
          ) : (
            <div className="text-gray-500">No more posts</div>
          )}
        </div>
      </section>
    </main>
  );
}