import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/shared/price';
import { PlatformBadge } from '@/components/shared/platform-badge';
import { AffiliateNotice } from '@/components/shared/affiliate-notice';
import { SectionHeading } from '@/components/shared/section-heading';
import { ProductGrid } from '@/components/products/product-grid';
import {
  ProductGallery,
  type GalleryImage,
} from '@/components/products/product-gallery';
import { safeQuery } from '@/lib/database/safe';
import {
  getPublishedProductBySlug,
  getRelatedProducts,
} from '@/lib/database/products';
import { goPath, getSiteUrl } from '@/lib/site';
import { sanitizeHtml, truncate } from '@/lib/security/sanitize';
import { toNumber } from '@/lib/format';
import { PLATFORM_LABELS } from '@/lib/constants';
import type { ProductWithRelations } from '@/types';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Chống chèn `</script>` khi nhúng JSON-LD. */
function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function buildGallery(product: ProductWithRelations): GalleryImage[] {
  const images: GalleryImage[] = [];
  if (product.image_url)
    images.push({ url: product.image_url, alt: product.title });
  for (const img of product.images) {
    images.push({ url: img.public_url, alt: img.alt_text || product.title });
  }
  return images;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeQuery<ProductWithRelations | null>(
    (s) => getPublishedProductBySlug(s, slug),
    null,
  );

  if (!product) {
    return { title: 'Không tìm thấy sản phẩm' };
  }

  const description = truncate(
    product.short_description || product.description || product.title,
    160,
  );
  const url = `${getSiteUrl()}/products/${slug}`;
  const images = product.image_url ? [product.image_url] : undefined;

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await safeQuery<ProductWithRelations | null>(
    (s) => getPublishedProductBySlug(s, slug),
    null,
  );

  if (!product) notFound();

  const related = await safeQuery(
    (s) => getRelatedProducts(s, { id: product.id, platform: product.platform }, 4),
    [],
  );

  const gallery = buildGallery(product);
  const priceNum = toNumber(product.price);
  const cta = product.cta_text?.trim() || 'Xem ưu đãi';
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/products/${slug}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url ? [product.image_url] : undefined,
    description:
      product.short_description ||
      truncate(product.description || product.title, 300),
    ...(priceNum !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: priceNum,
            priceCurrency: product.currency,
            availability: 'https://schema.org/InStock',
            url: canonical,
          },
        }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sản phẩm',
        item: `${siteUrl}/products`,
      },
      { '@type': 'ListItem', position: 3, name: product.title, item: canonical },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Đường dẫn"
        className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">
          Sản phẩm
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Cột trái: ảnh */}
        <ProductGallery images={gallery} priority />

        {/* Cột phải: thông tin */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={product.platform} />
            {product.is_featured && (
              <span className="rounded-full bg-brand-gold/90 px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                Nổi bật
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {product.title}
          </h1>

          {product.seller_name && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Store className="size-4" />
              Bán bởi{' '}
              <span className="font-medium text-foreground">
                {product.seller_name}
              </span>
            </p>
          )}

          <Price
            price={product.price}
            originalPrice={product.original_price}
            currency={product.currency}
            size="lg"
          />

          {product.short_description && (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {product.short_description}
            </p>
          )}

          <div className="space-y-3 pt-1">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <a
                href={goPath(product.slug, 'website')}
                rel="nofollow sponsored noopener"
                target="_blank"
              >
                {cta}
                <ArrowUpRight className="size-5" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Bạn sẽ được chuyển tới {PLATFORM_LABELS[product.platform]} để hoàn
              tất mua hàng.
            </p>
          </div>

          <AffiliateNotice compact />
        </div>
      </div>

      {/* Mô tả chi tiết */}
      {product.description && (
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
            Mô tả sản phẩm
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-3 [&_h3]:font-semibold [&_h3]:text-foreground [&_h4]:font-semibold [&_h4]:text-foreground [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product.description),
            }}
          />
        </section>
      )}

      {/* Ghi chú hoa hồng (nếu có) */}
      {product.commission_note && (
        <p className="mt-6 max-w-3xl rounded-lg border border-brand-pine/25 bg-brand-pine/5 p-3 text-xs leading-relaxed text-muted-foreground">
          {product.commission_note}
        </p>
      )}

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            title="Sản phẩm liên quan"
            subtitle="Có thể bạn cũng quan tâm"
          />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
