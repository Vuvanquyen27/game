'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireEditor, requireAdmin } from '@/lib/auth/session';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/validation/category';
import { slugify, slugWithSuffix } from '@/lib/slug';
import { categorySlugExists } from '@/lib/database/categories';
import type { ActionResult } from '@/types';

async function ensureUniqueCategorySlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  desired: string,
  fallback: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired) || slugify(fallback) || 'danh-muc';
  if (!(await categorySlugExists(supabase, base, excludeId))) return base;
  for (let i = 2; i < 50; i++) {
    const candidate = slugWithSuffix(base, i);
    if (!(await categorySlugExists(supabase, candidate, excludeId)))
      return candidate;
  }
  return slugWithSuffix(base, Date.now().toString(36));
}

export async function createCategory(
  values: CategoryFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireEditor();
  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueCategorySlug(supabase, v.slug || '', v.name);

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: v.name,
      slug,
      description: v.description || null,
      image_url: v.image_url || null,
      status: v.status,
      sort_order: v.sort_order,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không tạo được danh mục' };
  }
  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { ok: true, data: { id: data.id } };
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<ActionResult> {
  await requireEditor();
  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();
  const slug = await ensureUniqueCategorySlug(supabase, v.slug || '', v.name, id);
  const { error } = await supabase
    .from('categories')
    .update({
      name: v.name,
      slug,
      description: v.description || null,
      image_url: v.image_url || null,
      status: v.status,
      sort_order: v.sort_order,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath(`/category/${slug}`);
  revalidatePath('/');
  return { ok: true, data: undefined };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/');
  return { ok: true, data: undefined };
}
