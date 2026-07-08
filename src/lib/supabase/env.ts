/**
 * Truy cập biến môi trường Supabase một cách an toàn.
 * - URL + anon key: public, được phép nhúng client.
 * - service role key: CHỈ server. Truy cập từ client sẽ throw.
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Thiếu NEXT_PUBLIC_SUPABASE_URL. Hãy cấu hình trong .env.local',
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY. Hãy cấu hình trong .env.local',
    );
  }
  return key;
}

/** CHỈ gọi trong môi trường server (route handler, server action, cron). */
export function getServiceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY không bao giờ được truy cập ở client.',
    );
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Thiếu SUPABASE_SERVICE_ROLE_KEY. Hãy cấu hình trong .env.local (server-only).',
    );
  }
  return key;
}

/** Kiểm tra Supabase đã cấu hình chưa (không throw) — dùng cho graceful UI. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
