import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminProducts } from '@/lib/database/products';
import {
  PLATFORMS,
  PRODUCT_STATUSES,
  type Platform,
  type ProductStatus,
} from '@/lib/constants';
import { PageHeader } from '@/components/admin/page-header';
import { AdminProductFilters } from '@/components/admin/admin-product-filters';
import { ProductTable } from '@/components/admin/product-table';
import { Button } from '@/components/ui/button';

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : undefined;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireEditor();
  const sp = await searchParams;

  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const status = pick<ProductStatus>(sp.status, PRODUCT_STATUSES);
  const platform = pick<Platform>(sp.platform, PLATFORMS);
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;

  const supabase = await createSupabaseServerClient();
  const { items, total, totalPages } = await getAdminProducts(supabase, {
    page,
    pageSize: 20,
    search: q,
    status,
    platform,
  });

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description={`${total} sản phẩm`}
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" /> Thêm sản phẩm
            </Link>
          </Button>
        }
      />

      <Suspense fallback={null}>
        <AdminProductFilters />
      </Suspense>

      <ProductTable products={items} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products?page=${page - 1}`}>Trước</Link>
            </Button>
          )}
          <span className="px-2 text-muted-foreground">
            Trang {page}/{totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products?page=${page + 1}`}>Sau</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
