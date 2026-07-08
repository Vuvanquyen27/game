'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/** Supabase client dùng ở Client Component (anon key, tôn trọng RLS). */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
