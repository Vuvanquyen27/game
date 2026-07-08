import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Interface adapter để sau dễ thay bằng Upstash Redis mà không đổi call-site.
 */
export interface RateLimiter {
  check(
    bucket: string,
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult>;
}

/**
 * Rate limiter dựa trên Postgres (fixed window).
 * Gọi RPC increment_rate_limit → atomic upsert + trả count hiện tại.
 * Fail-open (cho phép) nếu chưa cấu hình Supabase hoặc RPC lỗi, kèm cảnh báo.
 */
export const postgresRateLimiter: RateLimiter = {
  async check(bucket, identifier, limit, windowSeconds) {
    if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { allowed: true, remaining: limit, limit };
    }

    // Cửa sổ cố định: mốc bắt đầu = floor(now / window) * window
    const nowSec = Math.floor(Date.now() / 1000);
    const windowStartSec = Math.floor(nowSec / windowSeconds) * windowSeconds;
    const windowStart = new Date(windowStartSec * 1000).toISOString();

    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.rpc('increment_rate_limit', {
        p_bucket: bucket,
        p_identifier: identifier,
        p_window_start: windowStart,
      });

      if (error || typeof data !== 'number') {
        console.warn('[rate-limit] RPC lỗi, fail-open:', error?.message);
        return { allowed: true, remaining: limit, limit };
      }

      const count = data;
      const remaining = Math.max(0, limit - count);
      return { allowed: count <= limit, remaining, limit };
    } catch (err) {
      console.warn(
        '[rate-limit] exception, fail-open:',
        err instanceof Error ? err.message : 'unknown',
      );
      return { allowed: true, remaining: limit, limit };
    }
  },
};

/** Rate limiter mặc định của hệ thống. */
export const rateLimiter: RateLimiter = postgresRateLimiter;
