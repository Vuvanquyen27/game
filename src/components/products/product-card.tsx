import Link from 'next/link';
import type { ProductCardData } from '@/types';
import type { ClickSource } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { discountPercent } from '@/lib/format';
import { SmartImage } from '@/components/shared/smart-image';
import { PlatformBadge } from '@/components/shared/platform-badge';
import { Price } from '@/components/shared/price';
import { BuyConfirmButton } from '@/components/products/buy-confirm-button';

interface ProductCardProps {
  product: ProductCardData;
  source?: ClickSource;
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  source = 'website',
  priority,
  className,
}: ProductCardProps) {
  const pct = discountPercent(product.price, product.original_price);
  const cta = product.cta_text?.trim() || 'Xem ưu đãi';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <SmartImage
          src={product.image_url}
          alt={product.title}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          <PlatformBadge platform={product.platform} />
          {product.is_featured && (
            <span className="w-fit rounded-full bg-brand-gold/90 px-2 py-0.5 text-[11px] font-bold text-brand-ink shadow-sm">
              Nổi bật
            </span>
          )}
        </div>
        {pct !== null && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
            -{pct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <Price
          price={product.price}
          originalPrice={product.original_price}
          currency={product.currency}
          size="sm"
        />

        <BuyConfirmButton slug={product.slug} source={source} cta={cta} />
      </div>
    </article>
  );
}
