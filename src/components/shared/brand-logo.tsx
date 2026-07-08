import Link from 'next/link';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

export function BrandLogo({
  className,
  href = '/',
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn('group flex items-center gap-2', className)}
      aria-label={SITE_NAME}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
        <Tag className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight">
          Ezriso
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Săn ưu đãi tốt
        </span>
      </span>
    </Link>
  );
}
