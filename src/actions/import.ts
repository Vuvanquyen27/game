'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/session';
import {
  csvToRecords,
  validateImportRecords,
  type ParsedImportRow,
} from '@/lib/import/csv';
import { getCategorySlugByName } from '@/lib/database/categories';
import { slugify, slugWithSuffix } from '@/lib/slug';
import type { ActionResult } from '@/types';

export interface ImportSummary {
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  rowErrors: { line: number; errors: string[] }[];
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  title: string,
): Promise<string> {
  const base = slugify(title) || 'san-pham';
  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('slug', base)
    .limit(1);
  if (!data || data.length === 0) return base;
  return slugWithSuffix(base, Date.now().toString(36));
}

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  name: string | null,
): Promise<string | null> {
  if (!name) return null;
  const existing = await getCategorySlugByName(supabase, name);
  if (existing) return existing.id;
  const { data } = await supabase
    .from('categories')
    .insert({ name, slug: slugify(name) || slugWithSuffix('danh-muc', 1) })
    .select('id')
    .single();
  return data?.id ?? null;
}

async function importRow(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  row: ParsedImportRow,
  userId: string,
  updateExisting: boolean,
): Promise<'inserted' | 'updated' | 'skipped' | 'failed'> {
  // dedupe theo affiliate_url
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('affiliate_url', row.affiliate_url)
    .limit(1);

  const categoryId = await resolveCategoryId(supabase, row.category);
  const basePayload = {
    title: row.title,
    platform: row.platform,
    original_url: row.original_url,
    affiliate_url: row.affiliate_url,
    image_url: row.image_url,
    price: row.price,
    original_price: row.original_price,
    seller_name: row.seller_name,
    short_description: row.short_description,
    description: row.description,
    status: row.status,
    published_at: row.status === 'published' ? new Date().toISOString() : null,
  };

  if (existing && existing.length > 0) {
    if (!updateExisting) return 'skipped';
    const productId = existing[0]!.id;
    const { error } = await supabase
      .from('products')
      .update(basePayload)
      .eq('id', productId);
    if (error) return 'failed';
    if (categoryId) {
      await supabase
        .from('product_categories')
        .upsert(
          { product_id: productId, category_id: categoryId },
          { onConflict: 'product_id,category_id' },
        );
    }
    return 'updated';
  }

  const slug = await uniqueSlug(supabase, row.title);
  const { data: created, error } = await supabase
    .from('products')
    .insert({ ...basePayload, slug, created_by: userId })
    .select('id')
    .single();
  if (error || !created) return 'failed';
  if (categoryId) {
    await supabase
      .from('product_categories')
      .insert({ product_id: created.id, category_id: categoryId });
  }
  return 'inserted';
}

export async function importProducts(
  csvText: string,
  updateExisting: boolean,
): Promise<ActionResult<ImportSummary>> {
  const profile = await requireEditor();
  const { records } = csvToRecords(csvText);
  if (records.length === 0) {
    return { ok: false, error: 'File CSV rỗng hoặc không đọc được' };
  }

  const validated = validateImportRecords(records);
  const supabase = await createSupabaseServerClient();

  const summary: ImportSummary = {
    totalRows: validated.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    rowErrors: [],
  };

  for (const result of validated) {
    if (!result.valid || !result.data) {
      summary.failed += 1;
      summary.rowErrors.push({ line: result.line, errors: result.errors });
      continue;
    }
    try {
      const outcome = await importRow(
        supabase,
        result.data,
        profile.id,
        updateExisting,
      );
      summary[outcome] += 1;
    } catch (err) {
      summary.failed += 1;
      summary.rowErrors.push({
        line: result.line,
        errors: [err instanceof Error ? err.message : 'Lỗi không xác định'],
      });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { ok: true, data: summary };
}
