/**
 * Hằng số domain dùng chung cho toàn hệ thống (UI + validation + DB).
 * Mọi enum nghiệp vụ khai báo một chỗ duy nhất tại đây.
 */

export const SITE_NAME = 'Ezriso';
export const SITE_TAGLINE = 'Săn ưu đãi tốt — mua sắm thông minh';

/** Nền tảng affiliate được hỗ trợ. */
export const PLATFORMS = [
  'shopee',
  'lazada',
  'tiktok_shop',
  'amazon',
  'custom',
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  shopee: 'Shopee',
  lazada: 'Lazada',
  tiktok_shop: 'TikTok Shop',
  amazon: 'Amazon',
  custom: 'Khác',
};

/** Màu nhận diện nền tảng (dùng cho badge). */
export const PLATFORM_BADGE: Record<Platform, string> = {
  shopee: 'bg-[#ee4d2d]/12 text-[#ee4d2d] border-[#ee4d2d]/25',
  lazada: 'bg-[#0f146d]/10 text-[#0f146d] border-[#0f146d]/25',
  tiktok_shop: 'bg-foreground/8 text-foreground border-foreground/20',
  amazon: 'bg-[#ff9900]/14 text-[#b06f00] border-[#ff9900]/30',
  custom: 'bg-muted text-muted-foreground border-border',
};

/** Trạng thái sản phẩm. */
export const PRODUCT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đang xuất bản',
  archived: 'Đã lưu trữ',
};

/** Trạng thái danh mục. */
export const CATEGORY_STATUSES = ['active', 'inactive'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

/** Nguồn truy cập của một lượt click. */
export const CLICK_SOURCES = [
  'website',
  'instagram',
  'threads',
  'bio',
  'direct',
] as const;
export type ClickSource = (typeof CLICK_SOURCES)[number];

export const CLICK_SOURCE_LABELS: Record<ClickSource, string> = {
  website: 'Website',
  instagram: 'Instagram',
  threads: 'Threads',
  bio: 'Link-in-bio',
  direct: 'Trực tiếp',
};

/** Nền tảng mạng xã hội cho Social Content Manager. */
export const SOCIAL_PLATFORMS = ['instagram', 'threads'] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  threads: 'Threads',
};

/** Loại bài social. */
export const SOCIAL_POST_TYPES = ['text', 'image', 'link'] as const;
export type SocialPostType = (typeof SOCIAL_POST_TYPES)[number];

/** Trạng thái bài social. */
export const SOCIAL_POST_STATUSES = [
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled',
] as const;
export type SocialPostStatus = (typeof SOCIAL_POST_STATUSES)[number];

export const SOCIAL_POST_STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft: 'Bản nháp',
  scheduled: 'Đã lên lịch',
  publishing: 'Đang đăng',
  published: 'Đã đăng',
  failed: 'Lỗi',
  cancelled: 'Đã hủy',
};

/** Vai trò người dùng. */
export const USER_ROLES = ['admin', 'editor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Đơn vị tiền tệ hỗ trợ. */
export const CURRENCIES = ['VND', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Cấu hình upload ảnh. */
export const IMAGE_UPLOAD = {
  bucket: 'product-images',
  maxBytes: 5 * 1024 * 1024, // 5MB
  acceptedMime: ['image/jpeg', 'image/png', 'image/webp'] as const,
  acceptedExt: ['jpg', 'jpeg', 'png', 'webp'] as const,
};

/** Số lần thử lại tối đa khi đăng social. */
export const MAX_PUBLISH_ATTEMPTS = 3;

/** Rate limit mặc định (dùng cho adapter Postgres). */
export const RATE_LIMITS = {
  redirect: { limit: 30, windowSeconds: 60 }, // /go/[slug]
  login: { limit: 8, windowSeconds: 300 }, // đăng nhập admin
};
