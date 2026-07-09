import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  Category,
  Paginated,
  Product,
  ProductCardData,
  ProductImage,
  ProductWithRelations,
} from '@/types';
import type { Platform, ProductStatus } from '@/lib/constants';

type DB = SupabaseClient<Database>;

const CARD_FIELDS =
  'id,title,slug,image_url,price,original_price,currency,platform,is_featured,short_description,cta_text';

export type ProductSort =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'featured'
  | 'discount';

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  platform?: Platform;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

type OrderSpec = {
  column: string;
  options: { ascending: boolean; nullsFirst?: boolean };
};

/** Danh sách cột sắp xếp tương ứng với kiểu sort. */
function orderSpecs(sort: ProductSort): OrderSpec[] {
  switch (sort) {
    case 'price_asc':
      return [{ column: 'price', options: { ascending: true, nullsFirst: false } }];
    case 'price_desc':
      return [
        { column: 'price', options: { ascending: false, nullsFirst: false } },
      ];
    case 'featured':
      return [
        { column: 'is_featured', options: { ascending: false } },
        {
          column: 'published_at',
          options: { ascending: false, nullsFirst: false },
        },
      ];
    case 'newest':
    default:
      return [
        {
          column: 'published_at',
          options: { ascending: false, nullsFirst: false },
        },
      ];
  }
}

/** Danh sách sản phẩm đã xuất bản (public) — có filter, sort, phân trang. */
export async function getPublishedProducts(
  supabase: DB,
  params: ProductListParams = {},
): Promise<Paginated<ProductCardData>> {
  const {
    page = 1,
    pageSize = 12,
    search,
    categorySlug,
    platform,
    minPrice,
    maxPrice,
    sort = 'newest',
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Lọc theo danh mục: cần join product_categories → dùng inner filter.
  let query = supabase
    .from('products')
    .select(
      categorySlug
        ? `${CARD_FIELDS},product_categories!inner(category_id,categories!inner(slug))`
        : CARD_FIELDS,
      { count: 'exact' },
    )
    .eq('status', 'published')
    .is('deleted_at', null);

  if (search) query = query.ilike('title', `%${search}%`);
  if (platform) query = query.eq('platform', platform);
  if (typeof minPrice === 'number') query = query.gte('price', minPrice);
  if (typeof maxPrice === 'number') query = query.lte('price', maxPrice);
  if (categorySlug) {
    query = query.eq('product_categories.categories.slug', categorySlug);
  }

  // Sắp theo % giảm giá: đây là giá trị TÍNH TOÁN (không phải cột) nên PostgREST
  // .order() không làm được → lấy toàn bộ bản ghi khớp filter rồi sắp trong bộ
  // nhớ. Store nhỏ nên an toàn; sản phẩm giảm nhiều lên đầu, không ẩn cái nào.
  if (sort === 'discount') {
    query = query.order('published_at', { ascending: false, nullsFirst: false });
    const { data, count, error } = await query;
    if (error) throw error;
    const all = (data ?? []) as unknown as ProductCardData[];
    const pct = (p: ProductCardData) => {
      const price = Number(p.price);
      const orig = Number(p.original_price);
      return Number.isFinite(price) && Number.isFinite(orig) && orig > price && orig > 0
        ? (orig - price) / orig
        : -1; // không có giảm giá → xếp cuối
    };
    const sorted = all.slice().sort((a, b) => pct(b) - pct(a)); // V8 sort ổn định → giữ mới nhất khi bằng nhau
    const total = count ?? all.length;
    return {
      items: sorted.slice(from, from + pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  for (const spec of orderSpecs(sort)) {
    query = query.order(spec.column, spec.options);
  }
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const items = (data ?? []) as unknown as ProductCardData[];
  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Sản phẩm nổi bật (public). */
export async function getFeaturedProducts(
  supabase: DB,
  limit = 8,
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('is_featured', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductCardData[];
}

/** Sản phẩm mới nhất (public). */
export async function getNewProducts(
  supabase: DB,
  limit = 8,
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductCardData[];
}

/** Sản phẩm đang giảm giá (có original_price > price). */
export async function getDiscountedProducts(
  supabase: DB,
  limit = 8,
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .is('deleted_at', null)
    .not('original_price', 'is', null)
    .not('price', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit * 2);
  if (error) throw error;
  const rows = (data ?? []) as unknown as ProductCardData[];
  // lọc thực sự có giảm giá (numeric trả string → so sánh number)
  return rows
    .filter((p) => {
      const price = Number(p.price);
      const orig = Number(p.original_price);
      return Number.isFinite(price) && Number.isFinite(orig) && orig > price;
    })
    .slice(0, limit);
}

/** Sản phẩm hiển thị trên link-in-bio, sắp theo bio_order. */
export async function getBioProducts(
  supabase: DB,
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('show_on_bio', true)
    .order('bio_order', { ascending: true })
    .order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProductCardData[];
}

/** Chi tiết sản phẩm public theo slug (kèm ảnh phụ + danh mục). */
export async function getPublishedProductBySlug(
  supabase: DB,
  slug: string,
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      '*,product_images(*),product_categories(categories(*))',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProductWithRelations(data as unknown as RawProductRelations);
}

/** Sản phẩm liên quan: cùng danh mục hoặc cùng nền tảng. */
export async function getRelatedProducts(
  supabase: DB,
  product: Pick<Product, 'id' | 'platform'>,
  limit = 4,
): Promise<ProductCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .is('deleted_at', null)
    .eq('platform', product.platform)
    .neq('id', product.id)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductCardData[];
}

/** Lấy tất cả slug đã xuất bản (cho sitemap). */
export async function getAllPublishedSlugs(
  supabase: DB,
): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug,updated_at')
    .eq('status', 'published')
    .is('deleted_at', null);
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin queries (yêu cầu session editor/admin — RLS cho phép xem tất cả)
// ---------------------------------------------------------------------------

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProductStatus;
  platform?: Platform;
  categoryId?: string;
}

export async function getAdminProducts(
  supabase: DB,
  params: AdminProductListParams = {},
): Promise<Paginated<Product>> {
  const { page = 1, pageSize = 20, search, status, platform } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (search) query = query.ilike('title', `%${search}%`);
  if (status) query = query.eq('status', status);
  if (platform) query = query.eq('platform', platform);

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;
  return {
    items: (data ?? []) as Product[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getAdminProductById(
  supabase: DB,
  id: string,
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*,product_images(*),product_categories(categories(*))')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProductWithRelations(data as unknown as RawProductRelations);
}

/** Kiểm tra slug đã tồn tại chưa (loại trừ 1 id khi chỉnh sửa). */
export async function slugExists(
  supabase: DB,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from('products').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

/** Đếm số sản phẩm theo trạng thái (cho dashboard). */
export async function countProductsByStatus(
  supabase: DB,
): Promise<Record<ProductStatus | 'total', number>> {
  const { data, error } = await supabase
    .from('products')
    .select('status')
    .is('deleted_at', null);
  if (error) throw error;
  const rows = data ?? [];
  const result = {
    total: rows.length,
    draft: 0,
    published: 0,
    archived: 0,
  } as Record<ProductStatus | 'total', number>;
  for (const row of rows) {
    result[row.status as ProductStatus] += 1;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RawProductRelations extends Product {
  // Vì Database khai báo Relationships: [] nên postgrest suy ra embed
  // dạng mảng — chấp nhận cả object lẫn array rồi chuẩn hóa lúc runtime.
  product_images?: ProductImage[] | null;
  product_categories?:
    | { categories: Category | Category[] | null }[]
    | null;
}

function mapProductWithRelations(
  raw: RawProductRelations,
): ProductWithRelations {
  const images = (raw.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const categories = (raw.product_categories ?? []).flatMap((pc) => {
    const c = pc.categories;
    if (!c) return [];
    return Array.isArray(c) ? c : [c];
  });

  const {
    product_images: _pi,
    product_categories: _pc,
    ...product
  } = raw;
  void _pi;
  void _pc;

  return { ...(product as Product), images, categories };
}
