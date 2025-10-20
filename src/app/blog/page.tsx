"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { readPosts } from "@/lib/storage";
import { Post } from "@/types/post";
import Header from "@/components/Header";

/**
 * Behavior:
 * - Show first 9 posts by default (3 columns layout on lg).
 * - Clicking "Load More" shows the remaining posts.
 * - Remaining posts are styled as "taller + appear narrower" (portrait/rectangular).
 */

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setPosts(readPosts());
  }, []);

  // configuration
  const INITIAL_COUNT = 9;
  const initialPosts = posts.slice(0, INITIAL_COUNT);
  const remainingPosts = posts.slice(INITIAL_COUNT);

  return (
    <main
      className="relative min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/Blogpagebg.png')" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-16">
        <Header />

        <section className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-white">Our Blog</h1>
          <p className="text-gray-200 max-w-xl mx-auto">
            Insights, updates, and stories from the Medigital team.
          </p>
        </section>

        {/* Primary grid: show first 9 posts (or fewer if not available) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialPosts.length === 0 ? (
            <p className="col-span-full text-center text-white">No blog posts available.</p>
          ) : (
            initialPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white shadow-sm rounded overflow-hidden hover:shadow-md transition"
              >
                <Link href={`/blog/${post.id}`} className="block">
                  <div className="h-48 w-full overflow-hidden bg-gray-100">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-xs text-indigo-600 mb-1">{post.category}</div>
                    <h2 className="font-semibold text-lg mb-2">{post.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </section>

        {/* Remaining posts — hidden until Load More is clicked */}
        {remainingPosts.length > 0 && (
          <div
            className={`mt-10 transition-all duration-300 ${
              showAll ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              {showAll ? "More posts" : "More posts hidden"}
            </h3>

            {/* Grid for remaining posts — using same column layout,
                but each card uses taller image and a constrained center container
                so it visually appears narrower and taller (portrait rectangle). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white shadow-sm rounded overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  <Link href={`/blog/${post.id}`} className="block">
                    {/* Taller image to create portrait/rectangular card */}
                    <div className="h-64 w-full overflow-hidden bg-gray-100">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="text-xs text-indigo-600 mb-1">{post.category}</div>
                      <h2 className="font-semibold text-lg mb-2">{post.title}</h2>
                      {/* longer excerpt allowed for taller card */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-6">{post.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.author}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Load More / Show Less button */}
        {remainingPosts.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white text-black rounded hover:bg-[#C4C6C8] transition"
            >
              {showAll ? "Show less" : `Load more (${remainingPosts.length})`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}