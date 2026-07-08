import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

/**
 * Thông tin thương hiệu công khai. Link mạng xã hội đọc từ biến NEXT_PUBLIC_*
 * (an toàn để lộ client). Chỉnh trong .env.local hoặc trên Vercel.
 */
export const brand = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  description:
    'Tuyển chọn sản phẩm và ưu đãi tốt từ Shopee, Lazada, TikTok Shop và nhiều nền tảng khác. Mua sắm thông minh, tiết kiệm hơn mỗi ngày.',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com',
  threadsUrl: process.env.NEXT_PUBLIC_THREADS_URL || 'https://threads.net',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '@yourbrand',
};
