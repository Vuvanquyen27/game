import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { TablesInsert } from '@/types/database.types';

type DB = SupabaseClient<Database>;

/**
 * Ghi một lượt click. LƯU Ý: bảng click_events không cho client ghi (RLS),
 * nên hàm này PHẢI được gọi với service-role client trong server route.
 */
export async function insertClickEvent(
  adminClient: DB,
  payload: TablesInsert<'click_events'>,
): Promise<void> {
  const { error } = await adminClient.from('click_events').insert(payload);
  if (error) throw error;
}
