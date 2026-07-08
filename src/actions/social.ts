'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/session';
import {
  socialPostFormSchema,
  type SocialPostFormValues,
} from '@/lib/validation/social';
import { publishToSocial } from '@/lib/social/publish';
import { getSocialPostById } from '@/lib/database/social';
import type { ActionResult } from '@/types';

function toIsoOrNull(value?: string): string | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export async function createSocialPost(
  values: SocialPostFormValues,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireEditor();
  const parsed = socialPostFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      product_id: v.product_id || null,
      platform: v.platform,
      post_type: v.post_type,
      caption: v.caption,
      media_url: v.media_url || null,
      target_url: v.target_url || null,
      status: v.status,
      scheduled_at:
        v.status === 'scheduled' ? toIsoOrNull(v.scheduled_at) : null,
      created_by: profile.id,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không lưu được bài viết' };
  }
  revalidatePath('/admin/social');
  return { ok: true, data: { id: data.id } };
}

export async function updateSocialPost(
  id: string,
  values: SocialPostFormValues,
): Promise<ActionResult> {
  await requireEditor();
  const parsed = socialPostFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dữ liệu không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('social_posts')
    .update({
      product_id: v.product_id || null,
      platform: v.platform,
      post_type: v.post_type,
      caption: v.caption,
      media_url: v.media_url || null,
      target_url: v.target_url || null,
      status: v.status,
      scheduled_at:
        v.status === 'scheduled' ? toIsoOrNull(v.scheduled_at) : null,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/social');
  return { ok: true, data: undefined };
}

export async function duplicateSocialPost(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const source = await getSocialPostById(supabase, id);
  if (!source) return { ok: false, error: 'Không tìm thấy bài viết' };
  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      product_id: source.product_id,
      platform: source.platform,
      post_type: source.post_type,
      caption: source.caption,
      media_url: source.media_url,
      target_url: source.target_url,
      status: 'draft',
      created_by: profile.id,
    })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Không nhân bản được' };
  }
  revalidatePath('/admin/social');
  return { ok: true, data: { id: data.id } };
}

export async function cancelSocialPost(id: string): Promise<ActionResult> {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('social_posts')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/social');
  return { ok: true, data: undefined };
}

export async function deleteSocialPost(id: string): Promise<ActionResult> {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('social_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/social');
  return { ok: true, data: undefined };
}

/**
 * Đăng ngay một bài social qua API (nếu đã cấu hình token).
 * Cập nhật trạng thái, external_post_id, publish_attempts, last_error.
 */
export async function publishSocialPostNow(
  id: string,
): Promise<ActionResult<{ status: string }>> {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const post = await getSocialPostById(supabase, id);
  if (!post) return { ok: false, error: 'Không tìm thấy bài viết' };

  await supabase
    .from('social_posts')
    .update({ status: 'publishing' })
    .eq('id', id);

  const result = await publishToSocial(post.platform, {
    caption: post.caption,
    postType: post.post_type,
    mediaUrl: post.media_url,
    targetUrl: post.target_url,
  });

  if (result.ok) {
    await supabase
      .from('social_posts')
      .update({
        status: 'published',
        external_post_id: result.externalPostId,
        published_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', id);
    revalidatePath('/admin/social');
    return { ok: true, data: { status: 'published' } };
  }

  const attempts = (post.publish_attempts ?? 0) + 1;
  await supabase
    .from('social_posts')
    .update({
      status: result.notConfigured ? 'draft' : 'failed',
      publish_attempts: attempts,
      last_error: result.error,
    })
    .eq('id', id);
  revalidatePath('/admin/social');

  if (result.notConfigured) {
    return {
      ok: false,
      error:
        'Chưa kết nối API. Hãy copy nội dung và đăng thủ công, hoặc cấu hình token.',
    };
  }
  return { ok: false, error: result.error };
}
