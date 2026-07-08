import type { ClickSource } from '@/lib/constants';

/** URL gốc của site (bỏ dấu / cuối). Fallback localhost khi dev. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

/** Đường dẫn tương đối tới trang redirect có gắn nguồn. */
export function goPath(slug: string, source: ClickSource): string {
  return `/go/${encodeURIComponent(slug)}?source=${source}`;
}

/** URL tuyệt đối tới trang redirect (dùng trong caption social). */
export function goUrl(slug: string, source: ClickSource): string {
  return `${getSiteUrl()}${goPath(slug, source)}`;
}

/** URL tuyệt đối tới link-in-bio. */
export function bioUrl(): string {
  return `${getSiteUrl()}/links`;
}
