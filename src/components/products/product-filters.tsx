'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLATFORMS, PLATFORM_LABELS } from '@/lib/constants';
import type { ProductSort } from '@/lib/database/products';

const ALL = 'all';

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: thấp → cao' },
  { value: 'price_desc', label: 'Giá: cao → thấp' },
  { value: 'discount', label: 'Giảm giá nhiều nhất' },
  { value: 'featured', label: 'Nổi bật' },
];

const fieldLabel = 'mb-1.5 block text-xs font-semibold text-muted-foreground';
const numberInput =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

interface ProductFiltersProps {
  categories: { name: string; slug: string }[];
  className?: string;
}

/**
 * Bộ lọc sản phẩm (client). Cập nhật URL query bằng router, giữ nguyên các
 * tham số khác (ví dụ q) và luôn về trang 1 khi đổi bộ lọc.
 */
export function ProductFilters({ categories, className }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') ?? ALL;
  const platform = searchParams.get('platform') ?? ALL;
  const sort = (searchParams.get('sort') as ProductSort | null) ?? 'newest';

  const [minPrice, setMinPrice] = React.useState(searchParams.get('min') ?? '');
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('max') ?? '');

  React.useEffect(() => {
    setMinPrice(searchParams.get('min') ?? '');
    setMaxPrice(searchParams.get('max') ?? '');
  }, [searchParams]);

  const pushWith = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page'); // đổi bộ lọc → về trang 1
      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : '/products');
    },
    [router, searchParams],
  );

  const setParam = (key: string, value: string) =>
    pushWith((params) => {
      if (value && value !== ALL) params.set(key, value);
      else params.delete(key);
    });

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    pushWith((params) => {
      const min = minPrice.trim();
      const max = maxPrice.trim();
      if (min && Number.isFinite(Number(min)) && Number(min) >= 0)
        params.set('min', String(Math.floor(Number(min))));
      else params.delete('min');
      if (max && Number.isFinite(Number(max)) && Number(max) >= 0)
        params.set('max', String(Math.floor(Number(max))));
      else params.delete('max');
    });
  };

  const hasFilters =
    category !== ALL ||
    platform !== ALL ||
    sort !== 'newest' ||
    !!searchParams.get('min') ||
    !!searchParams.get('max') ||
    !!searchParams.get('q');

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Danh mục */}
        <div>
          <label className={fieldLabel}>Danh mục</label>
          <Select
            value={category}
            onValueChange={(v) => setParam('category', v)}
          >
            <SelectTrigger aria-label="Lọc theo danh mục">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả danh mục</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nền tảng */}
        <div>
          <label className={fieldLabel}>Nền tảng</label>
          <Select
            value={platform}
            onValueChange={(v) => setParam('platform', v)}
          >
            <SelectTrigger aria-label="Lọc theo nền tảng">
              <SelectValue placeholder="Tất cả nền tảng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả nền tảng</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sắp xếp */}
        <div>
          <label className={fieldLabel}>Sắp xếp</label>
          <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
            <SelectTrigger aria-label="Sắp xếp sản phẩm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Khoảng giá */}
        <div>
          <label className={fieldLabel}>Khoảng giá (₫)</label>
          <form onSubmit={applyPrice} className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Từ"
              aria-label="Giá tối thiểu"
              className={numberInput}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Đến"
              aria-label="Giá tối đa"
              className={numberInput}
            />
            <Button type="submit" variant="secondary" size="sm">
              Lọc
            </Button>
          </form>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/products')}
          >
            <RotateCcw className="size-4" />
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
