import { describe, it, expect } from 'vitest';
import { buildCaption, AFFILIATE_DISCLOSURE } from '@/lib/social/caption';
import type { CaptionInput } from '@/lib/social/caption';

const base: CaptionInput = {
  title: 'Tai nghe Bluetooth ABC',
  price: 299000,
  originalPrice: 499000,
  currency: 'VND',
  shortDescription: 'Chống ồn chủ động',
  targetUrl: 'https://example.com/go/tai-nghe-abc',
  platform: 'instagram',
};

describe('buildCaption', () => {
  it('chứa tiêu đề sản phẩm', () => {
    expect(buildCaption(base)).toContain(base.title);
  });

  it('chứa disclosure tiếp thị bắt buộc', () => {
    expect(buildCaption(base)).toContain(AFFILIATE_DISCLOSURE);
  });

  it('chứa link đích (targetUrl)', () => {
    expect(buildCaption(base)).toContain(base.targetUrl);
  });

  it('hiển thị % khi có giảm giá', () => {
    expect(buildCaption(base)).toContain('%');
  });

  it('vẫn hoạt động khi không có giá', () => {
    const caption = buildCaption({
      title: 'Sản phẩm không giá',
      targetUrl: 'https://example.com/go/x',
      platform: 'threads',
    });
    expect(caption).toContain('Sản phẩm không giá');
    expect(caption).toContain(AFFILIATE_DISCLOSURE);
    expect(caption).toContain('https://example.com/go/x');
  });
});
