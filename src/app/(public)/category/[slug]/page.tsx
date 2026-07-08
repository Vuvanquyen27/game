import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/product-grid';
import { EmptyState } from '@/components/shared/empty-state';
import { AffiliateNotice } from '@/components/shared/affiliate-notice';
import { safeQuery } from '@/lib/database/safe';
import { getPublishedProducts } from '@/lib/database/products';
import { getCategoryBySlug } from '@/lib/database/categories';
import { getSiteUrl } from '@/lib/site';
import { truncate } from '@/lib/security/sanitize';
import type { Category } from '@/types';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await safeQuery<Category | null>(
    (s) => getCategoryBySlug(s, slug),
    null,
  );

  if (!category) return { title: 'Không tìm thấy danh mục' };

  const description = category.description
    ? truncate(category.description, 160)
    : `Tổng hợp sản phẩm & ưu đãi thuộc danh mục ${category.name}.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `${getSiteUrl()}/category/${slug}` },
    openGraph: {
      title: category.name,
      description,
      type: 'website',
      url: `${getSiteUrl()}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await safeQuery<Category | null>(
    (s) => getCategoryBySlug(s, slug),
    null,
  );

  if (!category) notFound();

  const result = await safeQuery(
    (s) => getPublishedProducts(s, { categorySlug: slug, pageSize: 24 }),
    { items: [], total: 0, page: 1, pageSize: 24, totalPages: 1 },
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <nav
        aria-label="Đường dẫn"
        className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">
          Sản phẩm
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        )}
        {result.total > 0 && (
          <p className="text-sm text-muted-foreground">
            {result.total} sản phẩm trong danh mục.
          </p>
        )}
      </header>

      {result.items.length > 0 ? (
        <ProductGrid products={result.items} priorityCount={8} />
      ) : (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description="Danh mục này hiện chưa có sản phẩm. Hãy quay lại sau nhé!"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          }
        />
      )}

      <AffiliateNotice />
    </div>
  );
}
