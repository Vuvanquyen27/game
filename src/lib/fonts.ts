import { Fraunces, Manrope } from 'next/font/google';

/** Font hiển thị — serif đặc trưng, tông editorial ấm. */
export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700', '900'],
});

/** Font body — geometric sans, sạch & dễ đọc, hỗ trợ tiếng Việt. */
export const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
