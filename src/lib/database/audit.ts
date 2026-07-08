import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type DB = SupabaseClient<Database>;

/** Ghi audit log (không chặn luồng chính nếu lỗi). */
export async function writeAuditLog(
  supabase: DB,
  entry: {
    userId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: entry.userId ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    console.warn(
      '[audit] không ghi được log:',
      err instanceof Error ? err.message : 'unknown',
    );
  }
}
