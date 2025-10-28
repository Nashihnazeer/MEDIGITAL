// src/app/blog/[slug]/page.tsx
import Image from "next/image";
import Header from "@/components/Header";
import { readClientsData } from "@/lib/data"; // adjust if your helper is located elsewhere

export const metadata = {
  title: "Blog",
};

function normalizeImagesField(raw: any): string[] {
  // Accept array, JSON-stringified array, or null/undefined
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch (e) {
      // not JSON — treat as single-image string
      return [raw];
    }
  }
  // unknown shape
  return [];
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Load clients (or fetch blog by slug if you have an API)
  const clients = await readClientsData();
  const client = (clients || []).find(
    (c: any) =>
      (c.blog_slug ?? c.blogSlug ?? "").toString().trim() === slug.toString().trim()
  );

  if (!client) {
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

  // normalize images field coming from DB (could be jsonb array or string)
  const images: string[] = normalizeImagesField(client.images ?? client.images_json ?? client.imagesArray);

  // figure out the feature image (try the DB column first, then other names, then fallback to first gallery image)
  const feature =
    client.blog_feature_image ??
    client.blogFeatureImage ??
    client.blogFeatureImageUrl ??
    (images.length > 0 ? images[0] : null);

  return (
    <main
      className="relative min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/Blogpagebg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-16">
        <Header />

        <article className="bg-white rounded-lg shadow overflow-hidden">
          {feature ? (
            <div className="relative w-full h-64">
              <Image src={feature} alt={title} fill style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>

            {/* gallery: prefer `images` array; show up to 4 */}
            {images.length > 0 && (
              <section className="mb-6">
                <h3 className="text-sm text-gray-600 mb-2">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {images.slice(0, 4).map((src: string, idx: number) => (
                    <div key={idx} className="relative w-full h-36 rounded overflow-hidden bg-gray-100">
                      <Image src={src} alt={`${title} - image ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div
              className="prose max-w-none"
              // you're storing HTML — sanitize it on the server or install a client sanitizer (dompurify) if needed
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}