import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtml, truncate } from '@/lib/security/sanitize';

describe('sanitizeHtml', () => {
  it('loại bỏ thẻ script và nội dung bên trong', () => {
    const out = sanitizeHtml('<p>ok</p><script>bad()</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('bad()');
  });

  it('giữ lại thẻ an toàn trong allowlist', () => {
    expect(sanitizeHtml('<p>ok</p><script>bad()</script>')).toContain(
      '<p>ok</p>',
    );
  });

  it('vô hiệu href dạng javascript:', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });
});

describe('stripHtml', () => {
  it('bỏ toàn bộ thẻ và gộp khoảng trắng', () => {
    expect(stripHtml('<p>Hello <b>x</b></p>')).toBe('Hello x');
  });

  it('trả chuỗi rỗng cho input rỗng', () => {
    expect(stripHtml('')).toBe('');
  });
});

describe('truncate', () => {
  it('cắt chuỗi dài không vượt quá giới hạn (+1 cho dấu …)', () => {
    expect(truncate('a'.repeat(200), 50).length).toBeLessThanOrEqual(51);
  });

  it('giữ nguyên chuỗi ngắn hơn giới hạn', () => {
    expect(truncate('ngắn gọn', 160)).toBe('ngắn gọn');
  });
});
