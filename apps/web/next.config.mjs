/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const templateUrl = process.env.TEMPLATE_INTERNAL_URL
    if (!templateUrl) return { beforeFiles: [], afterFiles: [], fallback: [] }
    return {
      // /d/:slug  — explicit demo prefix (new demos)
      beforeFiles: [
        {
          source: '/d/:slug',
          destination: `${templateUrl}/:slug`,
        },
      ],
      // /:slug — catch-all for any path that doesn't match a real page
      // (old demo URLs without /d/ prefix, and direct subdomain-style URLs)
      afterFiles: [
        {
          source: '/:slug((?!admin|dashboard|api|login|d|_next|favicon\\.ico).*)',
          destination: `${templateUrl}/:slug`,
        },
      ],
      fallback: [],
    }
  },
}
export default nextConfig
