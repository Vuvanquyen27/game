import type { MetadataRoute } from 'next';
import { getActiveCategories } from '@/lib/database/categories';
import { getAllPublishedSlugs } from '@/lib/database/products';
import { safeQuery } from '@/lib/database/safe';
import { getSiteUrl } from '@/lib/site';

/**
 * Sitemap XML cho SEO.
 * Gồm: trang tĩnh public + sản phẩm đã xuất bản + danh mục đang hoạt động.
 * KHÔNG bao gồm /admin, /go, /api (không muốn Google index).
 * Dùng safeQuery để site vẫn build được khi thiếu cấu hình Supabase.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/links`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${base}/affiliate-disclosure`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const slugs = await safeQuery((s) => getAllPublishedSlugs(s), []);
  const productRoutes: MetadataRoute.Sitemap = slugs.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categories = await safeQuery((s) => getActiveCategories(s), []);
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
