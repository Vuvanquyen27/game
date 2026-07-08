import type { ProductCardData } from '@/types';
import type { ClickSource } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

export function ProductGrid({
  products,
  source = 'website',
  className,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  source?: ClickSource;
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4',
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          source={source}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
