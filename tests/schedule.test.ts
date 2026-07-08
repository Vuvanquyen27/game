import { describe, it, expect } from 'vitest';
import {
  isPostDue,
  shouldRetry,
  nextStatusAfterFailure,
} from '@/lib/social/schedule';

describe('isPostDue', () => {
  it('true khi thời điểm lên lịch đã qua', () => {
    expect(isPostDue(new Date(Date.now() - 1000).toISOString())).toBe(true);
  });

  it('false khi thời điểm lên lịch còn ở tương lai', () => {
    expect(isPostDue(new Date(Date.now() + 100000).toISOString())).toBe(false);
  });

  it('false khi không có lịch (null)', () => {
    expect(isPostDue(null)).toBe(false);
  });

  it('false khi chuỗi ngày không hợp lệ', () => {
    expect(isPostDue('không phải ngày')).toBe(false);
  });
});

describe('shouldRetry', () => {
  it('còn thử lại khi chưa vượt số lần tối đa (mặc định 3)', () => {
    expect(shouldRetry(0)).toBe(true);
    expect(shouldRetry(2)).toBe(true);
  });

  it('dừng thử lại khi đã đạt số lần tối đa', () => {
    expect(shouldRetry(3)).toBe(false);
  });
});

describe('nextStatusAfterFailure', () => {
  it('quay lại scheduled khi còn lượt thử', () => {
    expect(nextStatusAfterFailure(1)).toBe('scheduled');
  });

  it('chuyển sang failed khi hết lượt thử', () => {
    expect(nextStatusAfterFailure(3)).toBe('failed');
  });
});
