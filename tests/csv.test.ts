import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  csvToRecords,
  validateImportRecords,
  SAMPLE_CSV,
} from '@/lib/import/csv';

describe('parseCsv', () => {
  it('tách hàng và cột cơ bản', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('giữ nguyên dấu phẩy nằm trong field bọc ngoặc kép', () => {
    const rows = parseCsv('a,b\n"x,y",2');
    expect(rows[1]?.[0]).toBe('x,y');
    expect(rows[1]?.[1]).toBe('2');
  });

  it('bỏ dòng hoàn toàn trống', () => {
    const rows = parseCsv('a,b\n\n1,2\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('csvToRecords', () => {
  it('chuyển SAMPLE_CSV thành records có title', () => {
    const { records } = csvToRecords(SAMPLE_CSV);
    expect(records.length).toBeGreaterThanOrEqual(2);
    expect(records[0]?.title).toBeTruthy();
  });

  it('chuẩn hóa header về chữ thường', () => {
    const { headers } = csvToRecords('Title,Platform\nA,shopee');
    expect(headers).toContain('title');
    expect(headers).toContain('platform');
  });
});

describe('validateImportRecords', () => {
  it('đánh dấu lỗi khi thiếu affiliate_url', () => {
    const result = validateImportRecords([
      { title: 'Sản phẩm hợp lệ', affiliate_url: '' },
    ])[0]!;
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('affiliate_url');
  });

  it('hợp lệ khi đủ title và affiliate_url https', () => {
    const result = validateImportRecords([
      {
        title: 'Tai nghe Bluetooth',
        affiliate_url: 'https://shopee.vn/aff-abc',
        platform: 'shopee',
      },
    ])[0]!;
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(['shopee', 'lazada', 'tiktok_shop', 'amazon', 'custom']).toContain(
      result.data?.platform,
    );
  });

  it('tách tags theo dấu ; thành mảng', () => {
    const result = validateImportRecords([
      {
        title: 'Sản phẩm có tags',
        affiliate_url: 'https://shopee.vn/x',
        tags: 'a;b',
      },
    ])[0]!;
    expect(result.valid).toBe(true);
    expect(result.data?.tags).toEqual(['a', 'b']);
  });

  it('platform không hợp lệ → fallback về custom', () => {
    const result = validateImportRecords([
      {
        title: 'Sản phẩm lạ',
        affiliate_url: 'https://x.com/y',
        platform: 'không-tồn-tại',
      },
    ])[0]!;
    expect(result.data?.platform).toBe('custom');
  });
});
