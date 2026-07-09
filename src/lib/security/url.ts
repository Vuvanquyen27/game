/**
 * Kiểm tra & làm sạch URL affiliate.
 * Nguyên tắc: chỉ chấp nhận http(s) hợp lệ; với redirect chỉ cho phép HTTPS
 * tuyệt đối để chống open redirect (không cho scheme lạ, không cho relative).
 */

const BLOCKED_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
]);

/** URL có phải absolute http/https hợp lệ không. */
export function isValidHttpUrl(raw: string): boolean {
  if (!raw || typeof raw !== 'string') return false;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return false;
  }
  if (BLOCKED_PROTOCOLS.has(url.protocol)) return false;
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * URL an toàn để REDIRECT tới (dùng cho /go/[slug]).
 * Bắt buộc HTTPS + có hostname → chặn open redirect & scheme nguy hiểm.
 */
export function isSafeRedirectUrl(raw: string): boolean {
  if (!raw || typeof raw !== 'string') return false;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (!url.hostname || url.hostname.length < 3) return false;
  // chặn localhost / IP nội bộ để tránh SSRF-ish redirect
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  ) {
    return false;
  }
  return true;
}

/**
 * Chuẩn hóa URL affiliate khi lưu.
 * - Trim khoảng trắng.
 * - Nếu THIẾU scheme (vd dán "s.shopee.vn/xxx") → tự thêm "https://".
 * - Ép phải là http/https hợp lệ; trả về null nếu không hợp lệ.
 *
 * Lưu ý: hàm này KHÔNG khóa riêng domain Shopee vì hệ thống hỗ trợ nhiều nền
 * tảng (Shopee, Lazada, TikTok Shop, Amazon, ...). Việc chặn scheme nguy hiểm
 * đã do isValidHttpUrl/isSafeRedirectUrl đảm nhiệm.
 */
export function normalizeAffiliateUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Có scheme lạ (javascript:, data:, ...) sẽ bị isValidHttpUrl loại ở dưới.
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  if (!isValidHttpUrl(withScheme)) return null;
  return withScheme;
}
