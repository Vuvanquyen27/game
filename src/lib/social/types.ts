import type { SocialPostType } from '@/lib/constants';

/** Dữ liệu đầu vào để publish một bài social. */
export interface PublishInput {
  caption: string;
  postType: SocialPostType;
  /** URL ảnh public (bắt buộc với post_type = image trên Instagram). */
  mediaUrl?: string | null;
  /** Link đích (thường là URL /go/[slug]); dùng cho Threads link post. */
  targetUrl?: string | null;
}

/** Kết quả publish thống nhất giữa các nền tảng. */
export type PublishResult =
  | {
      ok: true;
      externalPostId: string;
    }
  | {
      ok: false;
      /** true nếu do CHƯA cấu hình token → UI chuyển chế độ thủ công. */
      notConfigured?: boolean;
      /** true nếu lỗi tạm thời, có thể retry. */
      retryable?: boolean;
      error: string;
    };

/** Ngủ ngắn giữa các lần retry (ms). */
export function backoffDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
