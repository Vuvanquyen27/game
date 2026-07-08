import 'server-only';

import { isInstagramConfigured } from './config';
import { backoffDelay, sleep, type PublishInput, type PublishResult } from './types';

/**
 * Dịch vụ Instagram (Graph API — Instagram Content Publishing).
 * Quy trình: tạo media container → chờ container READY → publish.
 * - Chỉ chạy server-side.
 * - KHÔNG BAO GIỜ log access token.
 * - Thiếu cấu hình → trả notConfigured (không crash).
 *
 * Tham khảo endpoint (v21.0):
 *   POST /{ig-user-id}/media           → tạo container (image_url, caption)
 *   GET  /{container-id}?fields=status_code
 *   POST /{ig-user-id}/media_publish   → publish (creation_id)
 */

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';
const MAX_STATUS_POLLS = 8;

function creds() {
  return {
    userId: process.env.INSTAGRAM_USER_ID as string,
    token: process.env.INSTAGRAM_ACCESS_TOKEN as string,
  };
}

/** Che token khi log (chỉ hiện 4 ký tự đầu). */
function redactError(message: string, token: string): string {
  if (!token) return message;
  return message.split(token).join('***');
}

async function createContainer(
  input: PublishInput,
): Promise<{ id: string } | { error: string; retryable: boolean }> {
  const { userId, token } = creds();
  if (!input.mediaUrl) {
    return {
      error:
        'Instagram yêu cầu ảnh (image_url). Hãy chọn ảnh sản phẩm cho bài đăng.',
      retryable: false,
    };
  }

  const params = new URLSearchParams({
    image_url: input.mediaUrl,
    caption: input.caption,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_BASE}/${userId}/media`, {
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

async function waitForContainer(containerId: string): Promise<boolean> {
  const { token } = creds();
  for (let i = 0; i < MAX_STATUS_POLLS; i++) {
    const res = await fetch(
      `${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${token}`,
    );
    const data = (await res.json()) as { status_code?: string };
    if (data.status_code === 'FINISHED') return true;
    if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
      return false;
    }
    await sleep(backoffDelay(i));
  }
  return false;
}

async function publishContainer(
  containerId: string,
): Promise<{ id: string } | { error: string; retryable: boolean }> {
  const { userId, token } = creds();
  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });
  const res = await fetch(`${GRAPH_BASE}/${userId}/media_publish`, {
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

export const instagramService = {
  isConfigured: isInstagramConfigured,

  async publish(input: PublishInput): Promise<PublishResult> {
    if (!isInstagramConfigured()) {
      return {
        ok: false,
        notConfigured: true,
        error: 'Instagram API chưa được kết nối.',
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

      const ready = await waitForContainer(container.id);
      if (!ready) {
        return {
          ok: false,
          retryable: true,
          error: 'Container Instagram chưa sẵn sàng sau nhiều lần kiểm tra.',
        };
      }

      const published = await publishContainer(container.id);
      if ('error' in published) {
        return {
          ok: false,
          error: published.error,
          retryable: published.retryable,
        };
      }

      return { ok: true, externalPostId: published.id };
    } catch (err) {
      return {
        ok: false,
        retryable: true,
        error:
          err instanceof Error ? err.message : 'Lỗi mạng khi gọi Instagram API',
      };
    }
  },
};
