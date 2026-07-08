import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { SocialPost, SocialPostWithProduct } from '@/types';
import type { SocialPostStatus } from '@/lib/constants';

type DB = SupabaseClient<Database>;

const WITH_PRODUCT =
  '*,product:products(id,title,slug,image_url)';

export async function getSocialPosts(
  supabase: DB,
  status?: SocialPostStatus,
): Promise<SocialPostWithProduct[]> {
  let query = supabase
    .from('social_posts')
    .select(WITH_PRODUCT)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SocialPostWithProduct[];
}

export async function getSocialPostById(
  supabase: DB,
  id: string,
): Promise<SocialPostWithProduct | null> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(WITH_PRODUCT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SocialPostWithProduct) ?? null;
}

/** Bài đến hạn đăng (scheduled & scheduled_at <= now). Dùng cho cron. */
export async function getDuePosts(
  adminClient: DB,
  limit = 10,
): Promise<SocialPost[]> {
  const { data, error } = await adminClient
    .from('social_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function countSocialByStatus(
  supabase: DB,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('social_posts')
    .select('status');
  if (error) throw error;
  const result: Record<string, number> = {};
  for (const row of data ?? []) {
    result[row.status] = (result[row.status] ?? 0) + 1;
  }
  return result;
}
