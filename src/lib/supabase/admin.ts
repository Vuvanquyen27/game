import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getServiceRoleKey, getSupabaseUrl } from './env';

/**
 * Supabase client với SERVICE ROLE — bypass RLS.
 * CHỈ dùng trong server route/cron cho các thao tác đặc quyền có kiểm soát:
 * ghi click_events, publish social, admin tasks.
 * KHÔNG BAO GIỜ import file này vào Client Component.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
