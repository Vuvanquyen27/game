import { describe, it, expect } from 'vitest';
import { detectImageType, extForMime } from '@/lib/security/file';

// Đệm thêm byte để đủ độ dài tối thiểu 12 byte mà detectImageType yêu cầu.
function pad(bytes: number[], length = 16): Uint8Array {
  const arr = new Uint8Array(length);
  arr.set(bytes.slice(0, length));
  return arr;
}

describe('detectImageType', () => {
  it('nhận diện JPEG qua magic bytes FF D8 FF', () => {
    expect(detectImageType(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
  });

  it('nhận diện PNG qua magic bytes', () => {
    expect(
      detectImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe('image/png');
  });

  it('nhận diện WEBP (RIFF....WEBP)', () => {
    const bytes = pad([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(detectImageType(bytes)).toBe('image/webp');
  });

  it('trả null với bytes rác', () => {
    expect(detectImageType(pad([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });

  it('trả null khi quá ngắn (< 12 byte)', () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff]))).toBeNull();
  });
});

describe('extForMime', () => {
  it('map MIME sang đuôi file', () => {
    expect(extForMime('image/jpeg')).toBe('jpg');
    expect(extForMime('image/png')).toBe('png');
    expect(extForMime('image/webp')).toBe('webp');
  });

  it('fallback "bin" cho MIME không xác định', () => {
    expect(extForMime(null)).toBe('bin');
  });
});
