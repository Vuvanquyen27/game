import type { Tables } from './database.types';

export type Profile = Tables<'profiles'>;
export type Product = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type Category = Tables<'categories'>;
export type ClickEvent = Tables<'click_events'>;
export type SocialPost = Tables<'social_posts'>;
export type SiteSetting = Tables<'site_settings'>;
export type AuditLog = Tables<'audit_logs'>;

/** Sản phẩm kèm danh mục + ảnh phụ (dùng cho trang chi tiết / admin). */
export interface ProductWithRelations extends Product {
  categories: Category[];
  images: ProductImage[];
}

/** Sản phẩm rút gọn cho card danh sách. */
export type ProductCardData = Pick<
  Product,
  | 'id'
  | 'title'
  | 'slug'
  | 'image_url'
  | 'price'
  | 'original_price'
  | 'currency'
  | 'platform'
  | 'is_featured'
  | 'short_description'
  | 'cta_text'
>;

/** Bài social kèm thông tin sản phẩm. */
export interface SocialPostWithProduct extends SocialPost {
  product: Pick<Product, 'id' | 'title' | 'slug' | 'image_url'> | null;
}

/** Kết quả phân trang chung. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Kết quả của một Server Action. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
