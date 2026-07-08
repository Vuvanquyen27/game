import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Supabase client cho RSC / Server Action / Route Handler.
 * Dùng anon key + cookie phiên → tôn trọng RLS theo user đang đăng nhập.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll bị gọi trong RSC (không set được cookie) — an toàn bỏ qua,
          // middleware sẽ chịu trách nhiệm refresh session.
        }
      },
    },
  });
}
