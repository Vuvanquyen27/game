import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { CLICK_SOURCES, type ClickSource } from '@/lib/constants';

type DB = SupabaseClient<Database>;

export interface ClickTotals {
  total: number;
  today: number;
  last7Days: number;
}

function startOfTodayISO(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d.toISOString();
}

function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Tổng click, click hôm nay, click 7 ngày. */
export async function getClickTotals(supabase: DB): Promise<ClickTotals> {
  const [totalRes, todayRes, weekRes] = await Promise.all([
    supabase.from('click_events').select('id', { count: 'exact', head: true }),
    supabase
      .from('click_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfTodayISO()),
    supabase
      .from('click_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', daysAgoISO(7)),
  ]);

  return {
    total: totalRes.count ?? 0,
    today: todayRes.count ?? 0,
    last7Days: weekRes.count ?? 0,
  };
}

/** Click theo nguồn trong N ngày gần đây. */
export async function getClicksBySource(
  supabase: DB,
  days = 30,
): Promise<{ source: ClickSource; count: number }[]> {
  const { data, error } = await supabase
    .from('click_events')
    .select('source')
    .gte('created_at', daysAgoISO(days));
  if (error) throw error;

  const counts = new Map<ClickSource, number>();
  for (const source of CLICK_SOURCES) counts.set(source, 0);
  for (const row of data ?? []) {
    const s = row.source as ClickSource;
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return CLICK_SOURCES.map((source) => ({
    source,
    count: counts.get(source) ?? 0,
  }));
}

/** Click theo từng ngày trong N ngày gần đây (điền đủ mọi ngày). */
export async function getClicksByDay(
  supabase: DB,
  days = 14,
): Promise<{ date: string; count: number }[]> {
  const { data, error } = await supabase
    .from('click_events')
    .select('created_at')
    .gte('created_at', daysAgoISO(days));
  if (error) throw error;

  const counts = new Map<string, number>();
  // khởi tạo đủ ngày
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    counts.set(key, 0);
  }
  for (const row of data ?? []) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

/** Top sản phẩm được click nhiều nhất. */
export async function getTopProducts(
  supabase: DB,
  limit = 10,
  days = 30,
): Promise<{ productId: string; title: string; slug: string; count: number }[]> {
  const { data, error } = await supabase
    .from('click_events')
    .select('product_id')
    .not('product_id', 'is', null)
    .gte('created_at', daysAgoISO(days));
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.product_id) continue;
    counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1);
  }

  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (topIds.length === 0) return [];

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id,title,slug')
    .in(
      'id',
      topIds.map(([id]) => id),
    );
  if (pErr) throw pErr;

  const titleMap = new Map(
    (products ?? []).map((p) => [p.id, { title: p.title, slug: p.slug }]),
  );

  return topIds.map(([productId, count]) => ({
    productId,
    title: titleMap.get(productId)?.title ?? '(đã xóa)',
    slug: titleMap.get(productId)?.slug ?? '',
    count,
  }));
}

/** Click theo nền tảng sản phẩm. */
export async function getClicksByPlatform(
  supabase: DB,
  days = 30,
): Promise<{ platform: string; count: number }[]> {
  const { data, error } = await supabase
    .from('click_events')
    .select('products(platform)')
    .not('product_id', 'is', null)
    .gte('created_at', daysAgoISO(days));
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as {
    products: { platform: string } | null;
  }[]) {
    const platform = row.products?.platform;
    if (!platform) continue;
    counts.set(platform, (counts.get(platform) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([platform, count]) => ({
    platform,
    count,
  }));
}
