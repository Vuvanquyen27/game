import { MAX_PUBLISH_ATTEMPTS } from '@/lib/constants';

/** Bài đã tới hạn đăng chưa (scheduled_at <= now). */
export function isPostDue(
  scheduledAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!scheduledAt) return false;
  const t = Date.parse(scheduledAt);
  if (Number.isNaN(t)) return false;
  return t <= now.getTime();
}

/** Còn được thử lại không (chưa vượt số lần tối đa). */
export function shouldRetry(
  attempts: number,
  max: number = MAX_PUBLISH_ATTEMPTS,
): boolean {
  return attempts < max;
}

/** Trạng thái tiếp theo sau một lần publish thất bại. */
export function nextStatusAfterFailure(
  attempts: number,
  max: number = MAX_PUBLISH_ATTEMPTS,
): 'scheduled' | 'failed' {
  return shouldRetry(attempts, max) ? 'scheduled' : 'failed';
}
