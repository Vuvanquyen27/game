import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Home, Instagram } from 'lucide-react';
import { SmartImage } from '@/components/shared/smart-image';
import { Price } from '@/components/shared/price';
import { EmptyState } from '@/components/shared/empty-state';
import { ThreadsIcon } from '@/components/shared/icons';
import { safeQuery } from '@/lib/database/safe';
import { getBioProducts } from '@/lib/database/products';
import { goPath } from '@/lib/site';
import { brand } from '@/lib/brand';
import type { ProductCardData } from '@/types';

export const revalidate = 120;

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
  robots: { index: true, follow: true },
};

/** Chữ cái đầu của thương hiệu cho avatar dự phòng. */
const initial = brand.name.trim().charAt(0).toUpperCase() || 'A';

export default async function LinksPage() {
  const products = await safeQuery<ProductCardData[]>(
    (s) => getBioProducts(s),
    [],
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-brand-pine/10 via-background to-primary/5">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10">
        {/* Header thương hiệu */}
        <header className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground shadow-lg ring-4 ring-background">
            {initial}
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            {brand.name}
          </h1>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
            {brand.tagline}
          </p>
        </header>

        {/* Nút mạng xã hội */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            <Instagram className="size-5" />
            Instagram
          </a>
          <a
            href={brand.threadsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            <ThreadsIcon className="size-5" />
            Threads
          </a>
        </div>

        {/* Danh sách sản phẩm bio */}
        <section className="mt-7 flex-1 space-y-3">
          {products.length > 0 ? (
            products.map((p) => (
              <article
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <SmartImage src={p.image_url} alt={p.title} sizes="64px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link href={`/products/${p.slug}`} className="min-w-0">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
                      {p.title}
                    </h2>
                  </Link>
                  <Price
                    price={p.price}
                    originalPrice={p.original_price}
                    currency={p.currency}
                    size="sm"
                  />
                </div>
                <a
                  href={goPath(p.slug, 'bio')}
                  rel="nofollow sponsored noopener"
                  target="_blank"
                  aria-label={`Xem ưu đãi ${p.title}`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                  <ArrowUpRight className="size-5" />
                </a>
              </article>
            ))
          ) : (
            <EmptyState
              title="Chưa có sản phẩm"
              description="Các ưu đãi được ghim sẽ hiển thị tại đây."
            />
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 space-y-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Trang chứa liên kết tiếp thị (affiliate). Chúng tôi có thể nhận hoa
            hồng khi bạn mua qua liên kết — giá bạn trả không thay đổi.
          </p>
        </footer>
      </div>
    </main>
  );
}
