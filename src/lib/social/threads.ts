import 'server-only';

import { isThreadsConfigured } from './config';
import { backoffDelay, sleep, type PublishInput, type PublishResult } from './types';

/**
 * Dịch vụ Threads (Threads API).
 * Quy trình: tạo media container → (chờ) → publish.
 * - Text post: media_type=TEXT + text
 * - Image post: media_type=IMAGE + image_url + text
 * - Link được đưa trực tiếp trong text (Threads tự tạo link preview).
 * - Chỉ chạy server-side; KHÔNG log access token.
 *
 * Endpoint (v1.0):
 *   POST /{threads-user-id}/threads          → tạo container
 *   POST /{threads-user-id}/threads_publish  → publish (creation_id)
 */

const THREADS_BASE = 'https://graph.threads.net/v1.0';
const MAX_STATUS_POLLS = 6;

function creds() {
  return {
    userId: process.env.THREADS_USER_ID as string,
    token: process.env.THREADS_ACCESS_TOKEN as string,
  };
}

function redactError(message: string, token: string): string {
  if (!token) return message;
  return message.split(token).join('***');
}

async function createContainer(
  input: PublishInput,
): Promise<{ id: string } | { error: string; retryable: boolean }> {
  const { userId, token } = creds();

  const isImage = input.postType === 'image' && Boolean(input.mediaUrl);
  const params = new URLSearchParams({
    media_type: isImage ? 'IMAGE' : 'TEXT',
    text: input.caption,
    access_token: token,
  });
  if (isImage && input.mediaUrl) params.set('image_url', input.mediaUrl);

  const res = await fetch(`${THREADS_BASE}/${userId}/threads`, {
    method: 'POST',
    body: params,
  });
  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    return {
      error: redactError(
        data.error?.message ?? `Tạo container thất bại (HTTP ${res.status})`,
        token,
      ),
      retryable: res.status >= 500,
    };
  }
  return { id: data.id };
}

async function publishContainer(
  containerId: string,
): Promise<{ id: string } | { error: string; retryable: boolean }> {
  const { userId, token } = creds();
  // Threads khuyến nghị chờ ~vài giây trước khi publish container ảnh.
  await sleep(backoffDelay(0));

  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });
  const res = await fetch(`${THREADS_BASE}/${userId}/threads_publish`, {
    method: 'POST',
    body: params,
  });
  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    return {
      error: redactError(
        data.error?.message ?? `Publish thất bại (HTTP ${res.status})`,
        token,
      ),
      retryable: res.status >= 500,
    };
  }
  return { id: data.id };
}

export const threadsService = {
  isConfigured: isThreadsConfigured,

  async publish(input: PublishInput): Promise<PublishResult> {
    if (!isThreadsConfigured()) {
      return {
        ok: false,
        notConfigured: true,
        error: 'Threads API chưa được kết nối.',
      };
    }

    try {
      const container = await createContainer(input);
      if ('error' in container) {
        return {
          ok: false,
          error: container.error,
          retryable: container.retryable,
        };
      }

      let lastErr = 'Không publish được container Threads.';
      for (let i = 0; i < MAX_STATUS_POLLS; i++) {
        const published = await publishContainer(container.id);
        if ('id' in published) {
          return { ok: true, externalPostId: published.id };
        }
        lastErr = published.error;
        if (!published.retryable) break;
        await sleep(backoffDelay(i));
      }
      return { ok: false, retryable: true, error: lastErr };
    } catch (err) {
      return {
        ok: false,
        retryable: true,
        error:
          err instanceof Error ? err.message : 'Lỗi mạng khi gọi Threads API',
      };
    }
  },
};
