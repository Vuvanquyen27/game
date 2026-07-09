// Kiểm tra toàn bộ link affiliate của sản phẩm trong Supabase.
// Báo cáo: tên sản phẩm, URL hiện tại, hợp lệ hay không, có thiếu https hay
// không, domain có hợp lệ (được nhận diện) hay không.
//
// Cách chạy:  node scripts/check-affiliate-links.mjs
// Thoát mã 1 nếu có sản phẩm ĐANG PUBLISH mà link không thể redirect được
// (dùng được trong CI để chặn deploy dữ liệu hỏng).
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- đọc .env.local (ưu tiên service_role để thấy cả draft/archived) ---
const env = {};
try {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
} catch {
  // Không có .env.local → dựa vào biến môi trường thật (CI).
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    '❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc key (service_role/anon) trong .env.local.',
  );
  process.exit(1);
}

// Domain affiliate được nhận diện (chỉ để BÁO CÁO, không phải để chặn — hệ
// thống hỗ trợ đa nền tảng nên link ngoài danh sách vẫn có thể hợp lệ).
const KNOWN_AFFILIATE_HOSTS = [
  's.shopee.vn',
  'shopee.vn',
  'shope.ee',
  'lazada.vn',
  's.lazada.vn',
  'tiktok.com',
  'vt.tiktok.com',
  'amazon.com',
  'amzn.to',
];

function analyze(rawUrl) {
  const value = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  const result = {
    value,
    hasHttps: false,
    missingScheme: false,
    isValid: false, // redirect được (https tuyệt đối, host hợp lệ, không nội bộ)
    knownDomain: false,
    host: '',
    note: '',
  };

  if (!value) {
    result.note = 'RỖNG';
    return result;
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
  result.missingScheme = !hasScheme;
  const candidate = hasScheme ? value : `https://${value}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    result.note = 'Không parse được thành URL';
    return result;
  }

  result.host = parsed.hostname.toLowerCase();
  result.hasHttps = parsed.protocol === 'https:';

  const internal =
    result.host === 'localhost' ||
    result.host === '127.0.0.1' ||
    result.host === '0.0.0.0' ||
    result.host.endsWith('.local');

  result.isValid =
    parsed.protocol === 'https:' && result.host.length >= 3 && !internal;

  result.knownDomain = KNOWN_AFFILIATE_HOSTS.some(
    (d) => result.host === d || result.host.endsWith(`.${d}`),
  );

  if (!result.isValid) {
    if (parsed.protocol !== 'https:') result.note = 'Không phải https://';
    else if (internal) result.note = 'Domain nội bộ/không cho phép';
    else result.note = 'Host không hợp lệ';
  }

  return result;
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await sb
  .from('products')
  .select('title,slug,status,deleted_at,affiliate_url')
  .order('status', { ascending: true });

if (error) {
  console.error('❌ Lỗi truy vấn products:', error.message);
  process.exit(1);
}

console.log(`\n🔎 Kiểm tra ${data.length} sản phẩm\n`);

let publishedBad = 0;
let anyBad = 0;

for (const p of data) {
  const a = analyze(p.affiliate_url);
  const isPublished = p.status === 'published' && !p.deleted_at;

  const ok = a.isValid;
  if (!ok) {
    anyBad++;
    if (isPublished) publishedBad++;
  }

  const badge = ok ? '✅' : isPublished ? '❌' : '⚠️ ';
  const flags = [];
  if (a.missingScheme) flags.push('THIẾU https://');
  if (!a.hasHttps && !a.missingScheme) flags.push('KHÔNG https');
  if (a.isValid && !a.knownDomain) flags.push('domain lạ (không phải sàn quen)');
  if (a.note) flags.push(a.note);

  console.log(`${badge} [${p.status}] ${p.title}`);
  console.log(`    slug   : ${p.slug}`);
  console.log(`    url    : ${a.value || '(rỗng)'}`);
  console.log(
    `    hợp lệ : ${ok ? 'CÓ' : 'KHÔNG'}` +
      (flags.length ? `  — ${flags.join('; ')}` : ''),
  );
  console.log('');
}

console.log('──────────────────────────────────────────');
console.log(`Tổng: ${data.length}`);
console.log(`Link hỏng (mọi trạng thái): ${anyBad}`);
console.log(`Link hỏng ở sản phẩm ĐANG PUBLISH: ${publishedBad}`);

if (publishedBad > 0) {
  console.error(
    `\n❌ Có ${publishedBad} sản phẩm đang publish với link KHÔNG redirect được.`,
  );
  process.exit(1);
}

console.log('\n✅ Tất cả sản phẩm đang publish đều có link affiliate hợp lệ.');
