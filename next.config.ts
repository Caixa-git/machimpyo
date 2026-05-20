/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Turbopack workspace root ─────────────────────────────
  // Silence the "inferred workspace root" warning when
  // multiple lockfiles exist outside the project.
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },

  // ─── Security headers ─────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
