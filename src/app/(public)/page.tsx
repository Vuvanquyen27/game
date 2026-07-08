import Link from 'next/link';
import { ArrowRight, Link2, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/product-grid';
import { SectionHeading } from '@/components/shared/section-heading';
import { EmptyState } from '@/components/shared/empty-state';
import { AffiliateNotice } from '@/components/shared/affiliate-notice';
import { safeQuery } from '@/lib/database/safe';
import {
  getDiscountedProducts,
  getFeaturedProducts,
  getNewProducts,
} from '@/lib/database/products';
import { getActiveCategories } from '@/lib/database/categories';
import { brand } from '@/lib/brand';

export const revalidate = 120;

export default async function HomePage() {
  const [featured, newest, discounted, categories] = await Promise.all([
    safeQuery((s) => getFeaturedProducts(s, 8), []),
    safeQuery((s) => getNewProducts(s, 8), []),
    safeQuery((s) => getDiscountedProducts(s, 4), []),
    safeQuery((s) => getActiveCategories(s), []),
  ]);

  const hasAnyProducts =
    featured.length + newest.length + discounted.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-primary" />
              Tuyển chọn ưu đãi mỗi ngày
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Săn <span className="text-primary">ưu đãi tốt</span>,<br />
              mua sắm thông minh
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              {brand.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="size-4" />
                  Khám phá sản phẩm
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/links">
                  <Link2 className="size-4" />
                  Trang link-in-bio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 pb-16">
        {!hasAnyProducts && (
          <EmptyState
            icon={ShoppingBag}
            title="Chưa có sản phẩm nào"
            description="Kết nối Supabase và thêm sản phẩm trong trang quản trị để hiển thị tại đây."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">Tới trang quản trị</Link>
              </Button>
            }
          />
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <SectionHeading
              title="Danh mục nổi bật"
              subtitle="Duyệt theo nhóm sản phẩm bạn quan tâm"
            />
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-all hover:border-primary hover:text-primary"
                >
                  <Tag className="size-4 text-muted-foreground group-hover:text-primary" />
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <SectionHeading
              title="Sản phẩm nổi bật"
              subtitle="Những deal được chúng tôi tuyển chọn"
              href="/products?featured=1"
            />
            <ProductGrid products={featured} priorityCount={4} />
          </section>
        )}

        {/* Discounted */}
        {discounted.length > 0 && (
          <section className="rounded-2xl border bg-card p-5 sm:p-7">
            <SectionHeading
              title="Đang giảm giá 🔥"
              subtitle="Ưu đãi tốt nhất, số lượng có hạn"
              href="/products?sort=featured"
            />
            <ProductGrid products={discounted} />
          </section>
        )}

        {/* New */}
        {newest.length > 0 && (
          <section>
            <SectionHeading
              title="Sản phẩm mới"
              subtitle="Vừa được thêm gần đây"
              href="/products"
            />
            <ProductGrid products={newest} />
          </section>
        )}

        {/* CTA link-in-bio */}
        <section className="overflow-hidden rounded-2xl bg-brand-pine px-6 py-10 text-center text-white sm:px-10 sm:py-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Theo dõi chúng tôi trên Instagram & Threads
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/80">
            Xem tất cả ưu đãi mới nhất gọn gàng trong một trang link-in-bio,
            tối ưu cho điện thoại.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="mt-6 bg-white text-brand-pine hover:bg-white/90"
          >
            <Link href="/links">
              Mở trang link-in-bio
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>

        <AffiliateNotice />
      </div>
    </>
  );
}
