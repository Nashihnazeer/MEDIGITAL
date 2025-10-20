"use client"; // <-- Add this line at the very top

import { Post } from "@/types/post"; // Use alias path since you're using src/

const STORAGE_KEY = "medigital_blogs_v1";

const SEED: Post[] = [
  {
    id: "post-1",
    title: "Lorem ipsum dolor",
    image: "https://placehold.co/1200x800?text=Post+1",
    summary: "Lorem ipsum dolor sit amet...",
    content: "<p>Sample content.</p>",
    author: "Phoenix Baker",
    date: "19 Jan 2022",
    category: "Product",
  },
];

export function readPosts(): Post[] {
  if (typeof window === "undefined") return SEED.slice();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writePosts(SEED);
      return SEED.slice();
    }
    return JSON.parse(raw) as Post[];
  } catch {
    writePosts(SEED);
    return SEED.slice();
  }
}

export function writePosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}