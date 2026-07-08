/**
 * Sinh slug thân thiện URL, xử lý tốt tiếng Việt (bỏ dấu, đ → d).
 */

// Combining Diacritical Marks: U+0300–U+036F
const COMBINING_MARKS = /[̀-ͯ]/g;
const D_STROKE = /[đĐ]/g; // đ, Đ

export function slugify(input: string): string {
  if (!input) return '';

  const normalized = input
    .trim()
    .toLowerCase()
    // tách dấu tổ hợp rồi loại bỏ (à → a)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    // đ/Đ không nằm trong dải combining nên map thủ công
    .replace(D_STROKE, 'd')
    .normalize('NFC');

  return normalized
    .replace(/[^a-z0-9\s_-]/g, '') // bỏ ký tự đặc biệt (giữ _ để chuyển thành -)
    .replace(/[\s_-]+/g, '-') // khoảng trắng/underscore → gạch nối
    .replace(/^-+|-+$/g, ''); // bỏ gạch nối đầu/cuối
}

/** Thêm hậu tố ngắn để đảm bảo slug duy nhất khi bị trùng. */
export function slugWithSuffix(base: string, suffix: string | number): string {
  const clean = slugify(base) || 'san-pham';
  return `${clean}-${suffix}`;
}
