/** Định dạng giá, phần trăm giảm giá, ngày tháng. */

/**
 * Ép về number an toàn. Supabase trả cột numeric dưới dạng string,
 * nên mọi hàm tính tiền phải coerce trước khi dùng.
 */
export function toNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

/** Định dạng tiền theo locale VN. VND không có phần thập phân. */
export function formatPrice(
  input: number | string | null | undefined,
  currency = 'VND',
): string {
  const value = toNumber(input);
  if (value === null) return '';

  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Tính % giảm giá từ giá cũ → giá hiện tại.
 * Trả về số nguyên 0–100, hoặc null nếu không hợp lệ để hiển thị.
 */
export function discountPercent(
  priceInput: number | string | null | undefined,
  originalPriceInput: number | string | null | undefined,
): number | null {
  const price = toNumber(priceInput);
  const originalPrice = toNumber(originalPriceInput);
  if (price === null || originalPrice === null) return null;
  if (originalPrice <= 0 || price < 0) return null;
  if (price >= originalPrice) return null;

  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return pct > 0 ? pct : null;
}

/** Ngày dạng dd/MM/yyyy theo giờ VN. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/** Ngày giờ dạng dd/MM/yyyy HH:mm. */
export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
