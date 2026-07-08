import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { Category } from '@/types';

type DB = SupabaseClient<Database>;

/** Danh mục đang hoạt động (public), sắp theo sort_order. */
export async function getActiveCategories(supabase: DB): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(
  supabase: DB,
  slug: string,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Toàn bộ danh mục (admin). */
export async function getAdminCategories(supabase: DB): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryById(
  supabase: DB,
  id: string,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function categorySlugExists(
  supabase: DB,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase.from('categories').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function getCategorySlugByName(
  supabase: DB,
  name: string,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', name)
    .maybeSingle();
  if (error) throw error;
  return data;
}
