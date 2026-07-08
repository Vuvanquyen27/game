import 'server-only';

import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Chạy một truy vấn đọc public một cách an toàn:
 * - Nếu chưa cấu hình Supabase → trả fallback (không crash trang).
 * - Nếu truy vấn ném lỗi → log & trả fallback.
 * Dùng cho các trang public để giữ site sống khi thiếu cấu hình.
 */
export async function safeQuery<T>(
  fn: (
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createSupabaseServerClient();
    return await fn(supabase);
  } catch (err) {
    console.warn(
      '[safeQuery] lỗi truy vấn, dùng fallback:',
      err instanceof Error ? err.message : 'unknown',
    );
    return fallback;
  }
}
