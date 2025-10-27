/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // existing placeholder host
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },

      // supabase storage (your project)
      {
        protocol: "https",
        hostname: "pyukwgwdycseqyvypavm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // allow example.com for dev / placeholder images (remove in production)
      { protocol: "https", hostname: "example.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/horizontalscrollwebsite",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;