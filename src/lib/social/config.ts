import 'server-only';

import type { SocialPlatform } from '@/lib/constants';

/**
 * Kiểm tra cấu hình token social — KHÔNG trả về token, chỉ trả boolean.
 * Dùng để quyết định chế độ tự động (API) hay thủ công (copy/paste).
 */
export function isInstagramConfigured(): boolean {
  return Boolean(
    process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN,
  );
}

export function isThreadsConfigured(): boolean {
  return Boolean(
    process.env.THREADS_USER_ID && process.env.THREADS_ACCESS_TOKEN,
  );
}

export function isSocialConfigured(platform: SocialPlatform): boolean {
  return platform === 'instagram'
    ? isInstagramConfigured()
    : isThreadsConfigured();
}

/** Trạng thái kết nối để hiển thị UI (an toàn để truyền ra client). */
export interface SocialConnectionStatus {
  instagram: boolean;
  threads: boolean;
}

export function getSocialConnectionStatus(): SocialConnectionStatus {
  return {
    instagram: isInstagramConfigured(),
    threads: isThreadsConfigured(),
  };
}
