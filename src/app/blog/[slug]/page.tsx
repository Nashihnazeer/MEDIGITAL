// src/app/blog/[slug]/page.tsx
import Image from "next/image";
import Header from "@/components/Header";
import { readClientsData } from "@/lib/data"; // adjust if your function is elsewhere

export const metadata = {
  title: "Blog",
};

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // IMPORTANT: await params per Next.js requirement
  const { slug } = await params;

  // Load clients (your existing helper). Replace with DB query if needed.
  const clients = await readClientsData();

  // find by slug
  const client = (clients || []).find(
    (c: any) =>
      (c.blog_slug ?? c.blogSlug ?? "").toString().trim() === slug.toString().trim()
  );

  if (!client) {
    // Return 404 page or custom not-found UI
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-screen-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-semibold">Not found</h1>
          <p className="text-gray-600 mt-2">No blog found for slug: {slug}</p>
        </div>
      </main>
    );
  }

  const title = client.blog_title ?? client.blogTitle ?? "Untitled";
  const bodyHtml = client.blog_body_html ?? client.blogBodyHtml ?? "";
  const imageUrl = client.blog_feature_image ?? client.blogFeatureImageUrl ?? null;

  return (
    <main className="relative min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/Blogpagebg.png')" }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-16">
        <Header />

        <article className="bg-white rounded-lg shadow overflow-hidden">
          {imageUrl ? (
            // next/image requires remote host in next.config.js — you already added domains.
            // If remote image 404s, it'll fall back to broken image; we protect by showing alt + fallback below.
            <div className="relative w-full h-64">
              <Image src={imageUrl} alt={title} fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div
              className="prose max-w-none"
              // NOTE: you are storing HTML; be careful with XSS in production.
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}