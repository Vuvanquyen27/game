import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Công bố liên kết tiếp thị — dùng ở trang chi tiết & chân trang. */
export function AffiliateNotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-brand-pine/25 bg-brand-pine/5 p-3 text-xs text-muted-foreground',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-brand-pine" />
      <p className={cn(compact ? 'leading-snug' : 'leading-relaxed')}>
        Website có chứa liên kết tiếp thị (affiliate). Chúng tôi có thể nhận
        được hoa hồng khi bạn mua hàng qua các liên kết này, nhưng{' '}
        <strong className="font-semibold text-foreground">
          giá bạn trả không thay đổi
        </strong>
        .
      </p>
    </div>
  );
}
