/**
 * Kiểu dữ liệu Supabase (hand-authored, khớp với supabase/migrations).
 * Định nghĩa từng bảng ĐỘC LẬP (không tự tham chiếu Database[...]) để tránh
 * vòng lặp type — nếu vòng lặp, supabase-js sẽ suy ra Schema = never và mọi
 * thao tác insert/update trở thành never.
 *
 * Khi có Supabase CLI, có thể thay bằng:
 *   supabase gen types typescript --project-id <id> > src/types/database.types.ts
 */
import type {
  CategoryStatus,
  ClickSource,
  Platform,
  ProductStatus,
  SocialPlatform,
  SocialPostStatus,
  SocialPostType,
  UserRole,
} from '@/lib/constants';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- profiles ---------------------------------------------------------------
type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};
type ProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
};

// --- products ---------------------------------------------------------------
type ProductRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  platform: Platform;
  original_url: string | null;
  affiliate_url: string;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  currency: string;
  seller_name: string | null;
  commission_note: string | null;
  copywriting: string | null;
  cta_text: string | null;
  status: ProductStatus;
  is_featured: boolean;
  show_on_bio: boolean;
  bio_order: number;
  published_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
type ProductInsert = {
  id?: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  platform: Platform;
  original_url?: string | null;
  affiliate_url: string;
  image_url?: string | null;
  price?: number | null;
  original_price?: number | null;
  currency?: string;
  seller_name?: string | null;
  commission_note?: string | null;
  copywriting?: string | null;
  cta_text?: string | null;
  status?: ProductStatus;
  is_featured?: boolean;
  show_on_bio?: boolean;
  bio_order?: number;
  published_at?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

// --- product_images ---------------------------------------------------------
type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};
type ProductImageInsert = {
  id?: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text?: string | null;
  sort_order?: number;
  created_at?: string;
};

// --- categories -------------------------------------------------------------
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: CategoryStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  status?: CategoryStatus;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

// --- product_categories -----------------------------------------------------
type ProductCategoryRow = {
  product_id: string;
  category_id: string;
};

// --- click_events -----------------------------------------------------------
type ClickEventRow = {
  id: string;
  product_id: string | null;
  source: ClickSource;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};
type ClickEventInsert = {
  id?: string;
  product_id?: string | null;
  source?: ClickSource;
  referrer?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
};

// --- social_posts -----------------------------------------------------------
type SocialPostRow = {
  id: string;
  product_id: string | null;
  platform: SocialPlatform;
  post_type: SocialPostType;
  caption: string;
  media_url: string | null;
  target_url: string | null;
  status: SocialPostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  external_post_id: string | null;
  publish_attempts: number;
  last_error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
type SocialPostInsert = {
  id?: string;
  product_id?: string | null;
  platform: SocialPlatform;
  post_type?: SocialPostType;
  caption: string;
  media_url?: string | null;
  target_url?: string | null;
  status?: SocialPostStatus;
  scheduled_at?: string | null;
  published_at?: string | null;
  external_post_id?: string | null;
  publish_attempts?: number;
  last_error?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

// --- site_settings ----------------------------------------------------------
type SiteSettingRow = {
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
};
type SiteSettingInsert = {
  key: string;
  value: Record<string, unknown>;
  updated_by?: string | null;
  updated_at?: string;
};

// --- audit_logs -------------------------------------------------------------
type AuditLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
type AuditLogInsert = {
  id?: string;
  user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

// --- rate_limits ------------------------------------------------------------
type RateLimitRow = {
  id: string;
  bucket: string;
  identifier: string;
  window_start: string;
  count: number;
};
type RateLimitInsert = {
  id?: string;
  bucket: string;
  identifier: string;
  window_start: string;
  count?: number;
};

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, ProfileInsert>;
      products: TableDef<ProductRow, ProductInsert>;
      product_images: TableDef<ProductImageRow, ProductImageInsert>;
      categories: TableDef<CategoryRow, CategoryInsert>;
      product_categories: TableDef<ProductCategoryRow, ProductCategoryRow>;
      click_events: TableDef<ClickEventRow, ClickEventInsert>;
      social_posts: TableDef<SocialPostRow, SocialPostInsert>;
      site_settings: TableDef<SiteSettingRow, SiteSettingInsert>;
      audit_logs: TableDef<AuditLogRow, AuditLogInsert>;
      rate_limits: TableDef<RateLimitRow, RateLimitInsert>;
    };
    Views: Record<string, never>;
    Functions: {
      increment_rate_limit: {
        Args: {
          p_bucket: string;
          p_identifier: string;
          p_window_start: string;
        };
        Returns: number;
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_editor: { Args: Record<string, never>; Returns: boolean };
    };
  };
}

export type { Json };

// Alias tiện dụng
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
