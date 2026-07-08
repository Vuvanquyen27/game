'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireEditor, requireAdmin } from '@/lib/auth/session';
import {
  productFormSchema,
  type ProductFormValues,
} from '@/lib/validation/product';
import { slugify, slugWithSuffix } from '@/lib/slug';
import { slugExists, getAdminProductById } from '@/lib/database/products';
import { writeAuditLog } from '@/lib/database/audit';
import type { ActionResult } from '@/types';
import type { ProductStatus } from '@/lib/constants';

function toIsoOrNull(value?: string): string | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** Đảm bảo slug duy nhất, tự thêm hậu tố khi trùng. */
async function ensureUniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  desired: string,
  fallbackTitle: string,
  excludeId?: string,
): Promise<string> {
  let base = slugify(desired) || slugify(fallbackTitle) || 'san-pham';
  if (!(await slugExists(supabase, base, excludeId))) return base;
  for (let i = 2; i < 50; i++) {
    const candidate = slugWithSuffix(base, i);
    if (!(await slugExists(supabase, candidate, excludeId))) return candidate;
  }
  // fallback cực hiếm: gắn timestamp
  base = slugWithSuffix(base, Date.now().toString(36));
  return base;
}

/** Đồng bộ danh mục của sản phẩm. */
async function syncCategories(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  productId: string,
  categoryIds: string[],
): Promise<void> {
  await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', productId);
  if (categoryIds.length > 0) {
    await supabase.from('product_categories').insert(
      categoryIds.map((category_id) => ({
        product_id: productId,
        category_id,
      })),
    );
  }
}

/** Đồng bộ ảnh phụ (gallery) của sản phẩm. */
async function syncGallery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  productId: string,
  gallery: { storage_path: string; public_url: string; alt_text?: string }[],
): Promise<void> {
  await supabase.from('product_images').delete().eq('product_id', productId);
  if (gallery.length > 0) {
    await supabase.from('product_images').insert(
      gallery.map((img, idx) => ({
        product_id: productId,
        storage_path: img.storage_path || img.public_url,
        public_url: img.public_url,
        alt_text: img.alt_text || null,
        sort_order: idx,
      })),
    );
  }
}

export async function createProduct(
  values: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const profile = await requireEditor();
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();

  const slug = await ensureUniqueSlug(supabase, v.slug || '', v.title);
  const status = v.status;
  const published_at =
    status === 'published'
      ? toIsoOrNull(v.published_at) ?? new Date().toISOString()
      : toIsoOrNull(v.published_at);

  const { data, error } = await supabase
    .from('products')
    .insert({
      title: v.title,
      slug,
      short_description: v.short_description || null,
      description: v.description || null,
      platform: v.platform,
      original_url: v.original_url || null,
      affiliate_url: v.affiliate_url,
      image_url: v.image_url || null,
      price: v.price ?? null,
      original_price: v.original_price ?? null,
      currency: v.currency,
      seller_name: v.seller_name || null,
      commission_note: v.commission_note || null,
      copywriting: v.copywriting || null,
      cta_text: v.cta_text || null,
      status,
      is_featured: v.is_featured,
      show_on_bio: v.show_on_bio,
      bio_order: v.bio_order,
      published_at,
      created_by: profile.id,
    })
    .select('id,slug')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không tạo được sản phẩm' };
  }

  await syncCategories(supabase, data.id, v.category_ids);
  await syncGallery(supabase, data.id, v.gallery);
  await writeAuditLog(supabase, {
    userId: profile.id,
    action: 'product.create',
    entityType: 'product',
    entityId: data.id,
    metadata: { title: v.title },
  });

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { ok: true, data: { id: data.id, slug: data.slug } };
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const profile = await requireEditor();
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();

  const existing = await getAdminProductById(supabase, id);
  if (!existing) return { ok: false, error: 'Không tìm thấy sản phẩm' };

  const slug = await ensureUniqueSlug(supabase, v.slug || '', v.title, id);
  const published_at =
    v.status === 'published'
      ? toIsoOrNull(v.published_at) ??
        existing.published_at ??
        new Date().toISOString()
      : toIsoOrNull(v.published_at);

  const { error } = await supabase
    .from('products')
    .update({
      title: v.title,
      slug,
      short_description: v.short_description || null,
      description: v.description || null,
      platform: v.platform,
      original_url: v.original_url || null,
      affiliate_url: v.affiliate_url,
      image_url: v.image_url || null,
      price: v.price ?? null,
      original_price: v.original_price ?? null,
      currency: v.currency,
      seller_name: v.seller_name || null,
      commission_note: v.commission_note || null,
      copywriting: v.copywriting || null,
      cta_text: v.cta_text || null,
      status: v.status,
      is_featured: v.is_featured,
      show_on_bio: v.show_on_bio,
      bio_order: v.bio_order,
      published_at,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };

  await syncCategories(supabase, id, v.category_ids);
  await syncGallery(supabase, id, v.gallery);
  await writeAuditLog(supabase, {
    userId: profile.id,
    action: 'product.update',
    entityType: 'product',
    entityId: id,
  });

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/');
  revalidatePath(`/products/${slug}`);
  return { ok: true, data: { id, slug } };
}

/** Xóa mềm (đặt deleted_at). */
export async function softDeleteProduct(id: string): Promise<ActionResult> {
  const profile = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await writeAuditLog(supabase, {
    userId: profile.id,
    action: 'product.soft_delete',
    entityType: 'product',
    entityId: id,
  });
  revalidatePath('/admin/products');
  return { ok: true, data: undefined };
}

export async function duplicateProduct(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const source = await getAdminProductById(supabase, id);
  if (!source) return { ok: false, error: 'Không tìm thấy sản phẩm' };

  const slug = await ensureUniqueSlug(
    supabase,
    `${source.slug}-copy`,
    source.title,
  );

  const { data, error } = await supabase
    .from('products')
    .insert({
      title: `${source.title} (bản sao)`,
      slug,
      short_description: source.short_description,
      description: source.description,
      platform: source.platform,
      original_url: source.original_url,
      affiliate_url: source.affiliate_url,
      image_url: source.image_url,
      price: source.price,
      original_price: source.original_price,
      currency: source.currency,
      seller_name: source.seller_name,
      commission_note: source.commission_note,
      copywriting: source.copywriting,
      cta_text: source.cta_text,
      status: 'draft',
      is_featured: false,
      show_on_bio: false,
      bio_order: source.bio_order,
      created_by: profile.id,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không nhân bản được' };
  }

  await syncCategories(
    supabase,
    data.id,
    source.categories.map((c) => c.id),
  );
  revalidatePath('/admin/products');
  return { ok: true, data: { id: data.id } };
}

export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  const profile = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const patch: { status: ProductStatus; published_at?: string } = { status };
  if (status === 'published') patch.published_at = new Date().toISOString();
  const { error } = await supabase.from('products').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await writeAuditLog(supabase, {
    userId: profile.id,
    action: 'product.status',
    entityType: 'product',
    entityId: id,
    metadata: { status },
  });
  revalidatePath('/admin/products');
  revalidatePath('/');
  return { ok: true, data: undefined };
}

export async function toggleProductFlag(
  id: string,
  flag: 'is_featured' | 'show_on_bio',
  value: boolean,
): Promise<ActionResult> {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ [flag]: value })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/products');
  revalidatePath('/links');
  revalidatePath('/');
  return { ok: true, data: undefined };
}

/** Cập nhật thứ tự hiển thị trên link-in-bio. */
export async function updateBioOrder(
  orders: { id: string; bio_order: number }[],
): Promise<ActionResult> {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  for (const o of orders) {
    const { error } = await supabase
      .from('products')
      .update({ bio_order: o.bio_order })
      .eq('id', o.id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath('/links');
  revalidatePath('/admin/products');
  return { ok: true, data: undefined };
}

/** Xóa cứng — chỉ admin (dùng cho dọn dẹp). */
export async function hardDeleteProduct(id: string): Promise<ActionResult> {
  const profile = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await writeAuditLog(supabase, {
    userId: profile.id,
    action: 'product.hard_delete',
    entityType: 'product',
    entityId: id,
  });
  revalidatePath('/admin/products');
  return { ok: true, data: undefined };
}
