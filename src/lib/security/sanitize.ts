/**
 * Làm sạch nội dung rich-text (mô tả chi tiết sản phẩm) trước khi lưu/hiển thị.
 * Chiến lược: allowlist thẻ an toàn, loại bỏ hoàn toàn script/style/handler.
 * Đây là lớp phòng thủ; nội dung vẫn nên render qua React (auto-escape).
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'a',
  'span',
]);

/** Loại bỏ toàn bộ thẻ nguy hiểm + thuộc tính sự kiện (on*) + href javascript:. */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  let out = input
    // xóa script/style/iframe/object cả nội dung bên trong
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, '')
    // xóa thẻ mở đơn lẻ của các loại nguy hiểm
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>/gi, '')
    // xóa handler sự kiện on*="..."
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // vô hiệu href/src dạng javascript:
    .replace(/(href|src)\s*=\s*"(\s*javascript:)[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'(\s*javascript:)[^']*'/gi, "$1='#'");

  // loại bỏ mọi thẻ không nằm trong allowlist
  out = out.replace(/<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    return ALLOWED_TAGS.has(String(tag).toLowerCase()) ? match : '';
  });

  return out.trim();
}

/** Rút gọn text thuần (bỏ mọi thẻ) — dùng cho meta description. */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cắt chuỗi cho meta description. */
export function truncate(input: string, max = 160): string {
  const clean = stripHtml(input);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
