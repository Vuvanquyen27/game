'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireEditor } from '@/lib/auth/session';
import { IMAGE_UPLOAD } from '@/lib/constants';
import { detectImageType, safeStoragePath } from '@/lib/security/file';
import type { ActionResult } from '@/types';

export interface UploadedImage {
  publicUrl: string;
  storagePath: string;
}

/**
 * Upload một ảnh sản phẩm lên Supabase Storage.
 * - Xác thực editor.
 * - Kiểm tra dung lượng + loại ảnh qua magic bytes (bỏ qua extension client).
 * - Tên file ngẫu nhiên an toàn.
 * - Dùng service-role client (đã xác thực editor) để ghi bucket.
 */
export async function uploadProductImage(
  formData: FormData,
): Promise<ActionResult<UploadedImage>> {
  await requireEditor();

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'Không nhận được file' };
  }
  if (file.size === 0) {
    return { ok: false, error: 'File rỗng' };
  }
  if (file.size > IMAGE_UPLOAD.maxBytes) {
    return {
      ok: false,
      error: `Ảnh quá lớn (tối đa ${Math.round(IMAGE_UPLOAD.maxBytes / 1024 / 1024)}MB)`,
    };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const mime = detectImageType(buffer);
  if (!mime) {
    return {
      ok: false,
      error: 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ',
    };
  }

  const path = safeStoragePath(mime);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.storage
    .from(IMAGE_UPLOAD.bucket)
    .upload(path, buffer, {
      contentType: mime,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    return {
      ok: false,
      error: `Upload thất bại: ${error.message}. Kiểm tra bucket "${IMAGE_UPLOAD.bucket}" đã tồn tại chưa.`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGE_UPLOAD.bucket).getPublicUrl(path);

  return { ok: true, data: { publicUrl, storagePath: path } };
}

/** Xóa ảnh khỏi Storage theo storage_path. */
export async function deleteStorageObject(
  storagePath: string,
): Promise<ActionResult> {
  await requireEditor();
  if (!storagePath) return { ok: true, data: undefined };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(IMAGE_UPLOAD.bucket)
    .remove([storagePath]);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}
