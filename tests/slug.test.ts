import { describe, it, expect } from 'vitest';
import { slugify, slugWithSuffix } from '@/lib/slug';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và chuyển thành slug', () => {
    expect(slugify('Nồi Chiên Không Dầu 5L')).toBe('noi-chien-khong-dau-5l');
  });

  it('xử lý đ/Đ và dấu tổ hợp', () => {
    expect(slugify('Áo Thun Đẹp Đẽ')).toBe('ao-thun-dep-de');
  });

  it('gộp khoảng trắng, underscore, gạch nối thừa', () => {
    expect(slugify('  Hello__World--Test  ')).toBe('hello-world-test');
  });

  it('trả về chuỗi rỗng khi input rỗng', () => {
    expect(slugify('')).toBe('');
  });

  it('bỏ ký tự đặc biệt và dấu ở đầu/cuối', () => {
    expect(slugify('Đảo Đẹp!!! @#$')).toBe('dao-dep');
  });

  it('không để lại gạch nối ở đầu hoặc cuối', () => {
    const result = slugify('---Xin chào---');
    expect(result.startsWith('-')).toBe(false);
    expect(result.endsWith('-')).toBe(false);
  });
});

describe('slugWithSuffix', () => {
  it('nối hậu tố vào slug đã chuẩn hóa', () => {
    expect(slugWithSuffix('Nồi Chiên', 2)).toBe('noi-chien-2');
    expect(slugWithSuffix('Áo Thun', 'abc')).toBe('ao-thun-abc');
  });

  it('dùng fallback "san-pham" khi base rỗng/không hợp lệ', () => {
    expect(slugWithSuffix('!!!', 5)).toBe('san-pham-5');
  });
});
