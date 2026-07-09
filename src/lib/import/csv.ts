import { PLATFORMS, PRODUCT_STATUSES, type Platform } from '@/lib/constants';
import { isValidHttpUrl, normalizeAffiliateUrl } from '@/lib/security/url';

/**
 * Parser CSV tối giản, chuẩn RFC-4180 ở mức cần thiết:
 * - hỗ trợ field bọc dấu ", escape "" bên trong
 * - hỗ trợ dấu phẩy & xuống dòng bên trong field có ngoặc kép
 * - bỏ dòng trống ở cuối
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  const text = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  // field/row cuối cùng
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // loại bỏ dòng hoàn toàn trống
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export const IMPORT_COLUMNS = [
  'title',
  'platform',
  'original_url',
  'affiliate_url',
  'image_url',
  'price',
  'original_price',
  'seller_name',
  'short_description',
  'description',
  'category',
  'tags',
  'status',
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number];

/** Chuyển CSV thô → mảng object theo header. */
export function csvToRecords(input: string): {
  headers: string[];
  records: Record<string, string>[];
} {
  const rows = parseCsv(input);
  if (rows.length === 0) return { headers: [], records: [] };

  const headers = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const records = rows.slice(1).map((cells) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = (cells[idx] ?? '').trim();
    });
    return rec;
  });

  return { headers, records };
}

const platformSet = new Set<string>(PLATFORMS);
const statusSet = new Set<string>(PRODUCT_STATUSES);

function parseMoney(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(/[,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export interface ParsedImportRow {
  title: string;
  platform: Platform;
  original_url: string | null;
  affiliate_url: string;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  seller_name: string | null;
  short_description: string | null;
  description: string | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface ImportRowResult {
  line: number; // số dòng trong file (1-based, tính cả header)
  raw: Record<string, string>;
  valid: boolean;
  data?: ParsedImportRow;
  errors: string[];
}

/**
 * Validate + chuẩn hóa từng dòng import.
 * Trả về kết quả theo dòng: dòng lỗi được đánh dấu, KHÔNG được import.
 */
export function validateImportRecords(
  records: Record<string, string>[],
): ImportRowResult[] {
  return records.map((raw, idx) => {
    const errors: string[] = [];
    const line = idx + 2; // +1 header, +1 để về 1-based

    const title = (raw.title ?? '').trim();
    if (title.length < 3) errors.push('Thiếu hoặc quá ngắn: title');

    const platformRaw = (raw.platform ?? '').trim().toLowerCase();
    const platform = (
      platformSet.has(platformRaw) ? platformRaw : 'custom'
    ) as Platform;

    // Tự thêm https:// khi thiếu scheme, rồi mới kiểm tra hợp lệ.
    const affiliateRaw = (raw.affiliate_url ?? '').trim();
    const affiliate_url = normalizeAffiliateUrl(affiliateRaw) ?? affiliateRaw;
    if (!affiliateRaw) errors.push('Thiếu affiliate_url');
    else if (!isValidHttpUrl(affiliate_url))
      errors.push('affiliate_url không phải http/https hợp lệ');

    const original_url = (raw.original_url ?? '').trim();
    if (original_url && !isValidHttpUrl(original_url))
      errors.push('original_url không hợp lệ');

    const image_url = (raw.image_url ?? '').trim();
    if (image_url && !isValidHttpUrl(image_url))
      errors.push('image_url không hợp lệ');

    const statusRaw = (raw.status ?? 'draft').trim().toLowerCase();
    const status = (
      statusSet.has(statusRaw) ? statusRaw : 'draft'
    ) as ParsedImportRow['status'];

    const price = parseMoney(raw.price);
    const original_price = parseMoney(raw.original_price);
    if (
      price !== null &&
      original_price !== null &&
      original_price < price
    ) {
      errors.push('original_price nhỏ hơn price');
    }

    const tags = (raw.tags ?? '')
      .split(/[;,|]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const valid = errors.length === 0;
    return {
      line,
      raw,
      valid,
      errors,
      data: valid
        ? {
            title,
            platform,
            original_url: original_url || null,
            affiliate_url,
            image_url: image_url || null,
            price,
            original_price,
            seller_name: (raw.seller_name ?? '').trim() || null,
            short_description: (raw.short_description ?? '').trim() || null,
            description: (raw.description ?? '').trim() || null,
            category: (raw.category ?? '').trim() || null,
            tags,
            status,
          }
        : undefined,
    };
  });
}

/** Nội dung file CSV mẫu để tải về. */
export const SAMPLE_CSV = `title,platform,original_url,affiliate_url,image_url,price,original_price,seller_name,short_description,description,category,tags,status
Tai nghe Bluetooth ABC,shopee,https://shopee.vn/goc-abc,https://shopee.vn/aff-abc,https://picsum.photos/seed/abc/800,299000,499000,ABC Store,Tai nghe chống ồn,Mô tả chi tiết sản phẩm,Công nghệ,"tai nghe;bluetooth",published
Nồi chiên không dầu XYZ,lazada,https://lazada.vn/goc-xyz,https://lazada.vn/aff-xyz,https://picsum.photos/seed/xyz/800,1290000,1990000,XYZ Home,Dung tích 5L,Mô tả chi tiết,Đồ gia dụng,"nhà bếp;nồi chiên",draft
`;
