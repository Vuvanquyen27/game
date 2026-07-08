import { cn } from '@/lib/utils';
import { PLATFORM_BADGE, PLATFORM_LABELS, type Platform } from '@/lib/constants';

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        PLATFORM_BADGE[platform],
        className,
      )}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
