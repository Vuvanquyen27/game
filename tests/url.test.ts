import { describe, it, expect } from 'vitest';
import {
  isValidHttpUrl,
  isSafeRedirectUrl,
  normalizeAffiliateUrl,
} from '@/lib/security/url';

describe('isValidHttpUrl', () => {
  it('chấp nhận https và http hợp lệ', () => {
    expect(isValidHttpUrl('https://shopee.vn/x')).toBe(true);
    expect(isValidHttpUrl('http://x.com')).toBe(true);
  });

  it('từ chối scheme nguy hiểm', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('từ chối chuỗi không phải URL', () => {
    expect(isValidHttpUrl('not a url')).toBe(false);
  });
});

describe('isSafeRedirectUrl', () => {
  it('chỉ chấp nhận HTTPS tuyệt đối', () => {
    expect(isSafeRedirectUrl('https://shopee.vn/x')).toBe(true);
    expect(isSafeRedirectUrl('http://x.com')).toBe(false);
  });

  it('chặn localhost', () => {
    expect(isSafeRedirectUrl('https://localhost/x')).toBe(false);
  });

  it('chặn scheme nguy hiểm', () => {
    expect(isSafeRedirectUrl('javascript:x')).toBe(false);
  });
});

describe('normalizeAffiliateUrl', () => {
  it('trim và giữ lại URL http/https', () => {
    expect(normalizeAffiliateUrl(' https://a.com ')).toBe('https://a.com');
  });

  it('trả null cho scheme không hợp lệ', () => {
    expect(normalizeAffiliateUrl('ftp://x')).toBeNull();
  });
});
