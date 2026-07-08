import { describe, it, expect } from 'vitest';
import { formatPrice, discountPercent, toNumber } from '@/lib/format';

describe('toNumber', () => {
  it('ép chuỗi số về number', () => {
    expect(toNumber('1000')).toBe(1000);
  });

  it('trả null cho chuỗi rỗng và null/undefined', () => {
    expect(toNumber('')).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
  });

  it('trả null cho giá trị không phải số', () => {
    expect(toNumber('abc')).toBeNull();
  });

  it('giữ nguyên number hợp lệ', () => {
    expect(toNumber(42)).toBe(42);
  });
});

describe('discountPercent', () => {
  it('tính đúng % giảm giá', () => {
    expect(discountPercent(300000, 500000)).toBe(40);
  });

  it('chấp nhận input dạng string', () => {
    expect(discountPercent('300000', '500000')).toBe(40);
  });

  it('trả null khi giá bằng giá gốc (không giảm)', () => {
    expect(discountPercent(500000, 500000)).toBeNull();
  });

  it('trả null khi thiếu dữ liệu', () => {
    expect(discountPercent(null, 500000)).toBeNull();
  });

  it('trả null khi giá lớn hơn giá gốc', () => {
    expect(discountPercent(600000, 500000)).toBeNull();
  });
});

describe('formatPrice', () => {
  it('chứa phần số và ký hiệu ₫ với VND', () => {
    const out = formatPrice(299000, 'VND');
    expect(out).toContain('299');
    expect(out).toContain('₫');
  });

  it('trả chuỗi rỗng khi giá trị không hợp lệ', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice('')).toBe('');
  });

  it('mặc định currency là VND', () => {
    expect(formatPrice(1000)).toContain('₫');
  });
});
