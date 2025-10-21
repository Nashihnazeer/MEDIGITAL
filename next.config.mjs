/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;

export async function redirects() {
  return [
    { source: "/", destination: "/horizontalscrollwebsite", permanent: false },
  ];
}