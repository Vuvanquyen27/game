import 'server-only';

import { createHash } from 'node:crypto';

/**
 * Hash IP với salt phía server. KHÔNG lưu IP thô.
 * Dùng SHA-256(salt + ip). Nếu thiếu salt → trả về null (không lưu gì).
 */
export function hashIp(ip: string | null | undefined): string | null {
  const salt = process.env.IP_HASH_SALT;
  if (!ip || !salt) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * Lấy IP client từ headers (Vercel/Proxy). Chỉ dùng để hash, không lưu thô.
 */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip');
}
