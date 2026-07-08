import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { SearchBar } from '@/components/shared/search-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { AffiliateNotice } from '@/components/shared/affiliate-notice';
import { safeQuery } from '@/lib/database/safe';
import { getPublishedProducts, type ProductSort } from '@/lib/database/products';
import { getActiveCategories } from '@/lib/database/categories';
import { PLATFORMS, type Platform } from '@/lib/constants';
import type { Paginated, ProductCardData } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description:
    'Khám phá toàn bộ sản phẩm và ưu đãi được tuyển chọn từ Shopee, Lazada, TikTok Shop và nhiều nền tảng khác. Lọc theo danh mục, nền tảng, giá và sắp xếp theo ý bạn.',
};

const PAGE_SIZE = 24;
const SORTS: ProductSort[] = ['newest', 'price_asc', 'price_desc', 'featured'];

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const sp = await searchParams;

  const q = first(sp.q)?.trim() || undefined;
  const categorySlug = first(sp.category) || undefined;

  const platformRaw = first(sp.platform);
  const platform =
    platformRaw && PLATFORMS.includes(platformRaw as Platform)
      ? (platformRaw as Platform)
      : undefined;

  const sortRaw = first(sp.sort);
  const sort =
    sortRaw && SORTS.includes(sortRaw as ProductSort)
      ? (sortRaw as ProductSort)
      : undefined;

  const minPrice = positiveNumber(first(sp.min));
  const maxPrice = positiveNumber(first(sp.max));

  const pageRaw = Number(first(sp.page));
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const [result, categories] = await Promise.all([
    safeQuery<Paginated<ProductCardData>>(
      (s) =>
        getPublishedProducts(s, {
          page,
          pageSize: PAGE_SIZE,
          search: q,
          categorySlug,
          platform,
          minPrice,
          maxPrice,
          sort,
        }),
      { items: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 },
    ),
    safeQuery((s) => getActiveCategories(s), []),
  ]);

  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  const buildQuery = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categorySlug) params.set('category', categorySlug);
    if (platform) params.set('platform', platform);
    if (sort) params.set('sort', sort);
    if (minPrice !== undefined) params.set('min', String(minPrice));
    if (maxPrice !== undefined) params.set('max', String(maxPrice));
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          Tất cả sản phẩm
        </h1>
        <p className="text-sm text-muted-foreground">
          {result.total > 0
            ? `Tìm thấy ${result.total} sản phẩm${q ? ` cho “${q}”` : ''}.`
            : 'Duyệt và lọc các ưu đãi được tuyển chọn.'}
        </p>
        <SearchBar defaultValue={q ?? ''} className="max-w-xl" />
      </header>

      <ProductFilters categories={navCategories} />

      {result.items.length > 0 ? (
        <>
          <ProductGrid products={result.items} priorityCount={8} />

          {result.totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-3 pt-4"
              aria-label="Phân trang"
            >
              {page > 1 ? (
                <Button variant="outline" asChild>
                  <Link href={buildQuery(page - 1)} rel="prev">
                    Trang trước
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Trang trước
                </Button>
              )}

              <span className="text-sm font-medium text-muted-foreground">
                Trang {page} / {result.totalPages}
              </span>

              {page < result.totalPages ? (
                <Button variant="outline" asChild>
                  <Link href={buildQuery(page + 1)} rel="next">
                    Trang sau
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Trang sau
                </Button>
              )}
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="Không tìm thấy sản phẩm phù hợp"
          description="Thử điều chỉnh từ khóa hoặc xóa bớt bộ lọc để xem thêm kết quả."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Xóa bộ lọc</Link>
            </Button>
          }
        />
      )}

      <AffiliateNotice />
    </div>
  );
}
