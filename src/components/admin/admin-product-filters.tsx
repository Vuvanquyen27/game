'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import {
  PLATFORMS,
  PLATFORM_LABELS,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
} from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL = '__all__';

export function AdminProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = React.useState(searchParams.get('q') ?? '');

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/admin/products?${params.toString()}`);
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam('q', q.trim());
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <form onSubmit={onSearch} className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      <Select
        defaultValue={searchParams.get('status') ?? ALL}
        onValueChange={(v) => setParam('status', v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
          {PRODUCT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {PRODUCT_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('platform') ?? ALL}
        onValueChange={(v) => setParam('platform', v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Nền tảng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Mọi nền tảng</SelectItem>
          {PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
