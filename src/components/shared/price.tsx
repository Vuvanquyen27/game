import { cn } from '@/lib/utils';
import { discountPercent, formatPrice } from '@/lib/format';

interface PriceProps {
  price: number | string | null | undefined;
  originalPrice?: number | string | null | undefined;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { now: 'text-base', was: 'text-xs' },
  md: { now: 'text-xl', was: 'text-sm' },
  lg: { now: 'text-3xl', was: 'text-base' },
};

/** Hiển thị giá hiện tại + giá cũ gạch ngang + % giảm. */
export function Price({
  price,
  originalPrice,
  currency = 'VND',
  size = 'md',
  className,
}: PriceProps) {
  const pct = discountPercent(price, originalPrice);
  const s = sizeMap[size];

  if (price === null || price === undefined || price === '') {
    return (
      <span className={cn('font-semibold text-muted-foreground', s.now, className)}>
        Xem giá
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-display font-bold tabular-nums text-primary', s.now)}>
        {formatPrice(price, currency)}
      </span>
      {pct !== null && (
        <>
          <span
            className={cn(
              'tabular-nums text-muted-foreground line-through',
              s.was,
            )}
          >
            {formatPrice(originalPrice, currency)}
          </span>
          <span
            className={cn(
              'rounded-full bg-primary/12 px-1.5 py-0.5 text-[11px] font-bold text-primary',
            )}
          >
            -{pct}%
          </span>
        </>
      )}
    </div>
  );
}
