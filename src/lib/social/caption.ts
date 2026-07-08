import type { SocialPlatform } from '@/lib/constants';
import { discountPercent, formatPrice } from '@/lib/format';

/** Disclosure tiếp thị bắt buộc trong mọi caption mặc định. */
export const AFFILIATE_DISCLOSURE =
  'Bài viết có chứa liên kết tiếp thị. Mình có thể nhận được hoa hồng nếu bạn mua hàng qua liên kết, nhưng giá sản phẩm không thay đổi.';

export interface CaptionInput {
  title: string;
  price?: number | null;
  originalPrice?: number | null;
  currency?: string;
  shortDescription?: string | null;
  copywriting?: string | null;
  ctaText?: string | null;
  targetUrl: string;
  platform: SocialPlatform;
  hashtags?: string[];
}

const DEFAULT_HASHTAGS = [
  'sanphamhot',
  'deal',
  'muasamonline',
  'uudai',
  'reviewsanpham',
];

function normalizeHashtag(tag: string): string {
  const clean = tag
    .replace(/^#/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '');
  return clean ? `#${clean.toLowerCase()}` : '';
}

/**
 * Sinh caption mặc định cho Instagram/Threads.
 * Cấu trúc: hook → mô tả/copywriting → giá & giảm giá → CTA + link →
 * disclosure → hashtags.
 * Link dùng URL website /go/[slug] (KHÔNG dùng affiliate URL dài trực tiếp).
 */
export function buildCaption(input: CaptionInput): string {
  const {
    title,
    price,
    originalPrice,
    currency = 'VND',
    shortDescription,
    copywriting,
    ctaText,
    targetUrl,
    hashtags = DEFAULT_HASHTAGS,
  } = input;

  const lines: string[] = [];

  lines.push(`✨ ${title}`);

  const body = (copywriting || shortDescription || '').trim();
  if (body) lines.push('', body);

  const pct = discountPercent(price, originalPrice);
  if (price !== null && price !== undefined) {
    const priceLine =
      pct !== null && originalPrice
        ? `💰 Giá chỉ ${formatPrice(price, currency)} (giảm ${pct}% từ ${formatPrice(originalPrice, currency)})`
        : `💰 Giá: ${formatPrice(price, currency)}`;
    lines.push('', priceLine);
  }

  const cta = (ctaText || 'Xem ưu đãi ngay').trim();
  lines.push('', `👉 ${cta}: ${targetUrl}`);

  lines.push('', AFFILIATE_DISCLOSURE);

  const tags = hashtags
    .map(normalizeHashtag)
    .filter(Boolean)
    .join(' ');
  if (tags) lines.push('', tags);

  return lines.join('\n').trim();
}
