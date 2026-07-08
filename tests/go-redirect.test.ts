import { describe, it, expect } from 'vitest';
import { isSafeRedirectUrl } from '@/lib/security/url';

/**
 * Kiểm thử logic an toàn của route /go/[slug]: chỉ được phép redirect tới
 * HTTPS tuyệt đối, chặn scheme lạ, localhost và host nội bộ (chống open
 * redirect / SSRF). Không mock route thật — chỉ test hàm quyết định.
 */
describe('an toàn redirect /go/[slug]', () => {
  const allowed = [
    'https://shopee.vn/aff-abc',
    'https://www.lazada.vn/product/xyz',
    'https://tiktok.com/@shop/video/1',
  ];

  const blocked = [
    'http://shopee.vn/x', // không phải https
    'javascript:alert(1)', // scheme nguy hiểm
    'data:text/html,<script>x</script>',
    'ftp://files.example.com',
    'https://localhost/admin',
    'https://127.0.0.1/x',
    'https://0.0.0.0/x',
    'https://intranet.local/secret',
    '/relative/path', // relative → không phải URL tuyệt đối
    '', // rỗng
  ];

  it.each(allowed)('cho phép redirect tới %s', (url) => {
    expect(isSafeRedirectUrl(url)).toBe(true);
  });

  it.each(blocked)('chặn redirect tới %s', (url) => {
    expect(isSafeRedirectUrl(url)).toBe(false);
  });
});
