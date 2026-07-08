import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

/**
 * robots.txt cho SEO.
 * Cho phép crawl toàn site public, chặn các vùng riêng tư / kỹ thuật:
 * /admin (trang quản trị), /go/ (redirect affiliate), /api/ (route handler).
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/go/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
