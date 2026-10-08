import type { NextConfig } from 'next';
// turbopackFileSystemCacheForBuild off: on October 8, 2026 Vercel restored a
// Turbopack build cache for Todo and Markdown and shipped the previous CSS.
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { turbopackFileSystemCacheForBuild: false },
};
export default config;
