/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
      ],
    },
  ],

  //  Ignore ESLint during production build (for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },

  //  Ignore TypeScript type errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
