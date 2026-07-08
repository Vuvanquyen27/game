// Tạo ảnh placeholder 800x800 (PNG) cho sản phẩm chưa có ảnh thật.
// Chạy: node scripts/gen-placeholders.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const items = [
  { slug: 'den-hoc-chong-can-tao1501', name: 'Đèn học chống cận\nTao1501' },
  { slug: 'may-cat-long-xu-sk877', name: 'Máy cắt lông xù\nSK-877' },
  { slug: 'voi-sen-tang-ap-nano', name: 'Vòi sen tăng áp\n7.7cm' },
  { slug: 'gia-do-laptop-macbox', name: 'Giá đỡ laptop\nMacbox' },
  { slug: 'may-xay-cam-tay-simplus', name: 'Máy xay cầm tay\nSimplus' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(name) {
  const lines = name.split('\n');
  const startY = 400 - (lines.length - 1) * 34;
  const tspans = lines
    .map((l, i) => `<tspan x="400" y="${startY + i * 68}">${esc(l)}</tspan>`)
    .join('');
  return `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12352a"/>
      <stop offset="1" stop-color="#0a201a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="400" cy="270" r="96" fill="none" stroke="#d8b46a" stroke-width="6" opacity="0.9"/>
  <text x="400" y="300" font-family="Arial, 'Segoe UI', sans-serif" font-size="96" fill="#d8b46a" text-anchor="middle">🛍</text>
  <text font-family="Arial, 'Segoe UI', sans-serif" font-size="52" font-weight="700" fill="#ffffff" text-anchor="middle">${tspans}</text>
  <text x="400" y="640" font-family="Arial, 'Segoe UI', sans-serif" font-size="30" fill="#9db8ac" text-anchor="middle">Ảnh sản phẩm đang cập nhật</text>
</svg>`;
}

for (const it of items) {
  const dir = path.join('public', 'images', 'products', it.slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'main.png');
  await sharp(Buffer.from(svg(it.name))).png().toFile(out);
  console.log('✓', out);
}
console.log('done');
