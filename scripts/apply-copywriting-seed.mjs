// Seed 5 sản phẩm "copywriting đầy đủ" (đèn học, máy cắt lông xù, vòi sen, giá đỡ
// laptop, máy xay Simplus) vào Supabase bằng service_role. Ảnh = placeholder PNG.
// Idempotent. Chạy: node scripts/apply-copywriting-seed.mjs
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const probe = await sb.from('products').select('id').limit(1);
if (probe.error) {
  console.error('❌ Chưa có bảng products — chạy supabase/setup_all.sql trong SQL Editor trước.');
  process.exit(2);
}

const catRes = await sb.from('categories').select('id,slug').in('slug', ['do-gia-dung', 'cong-nghe']);
const catId = Object.fromEntries((catRes.data || []).map((c) => [c.slug, c.id]));
const disc = 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.';
const now = new Date().toISOString();

const products = [
  {
    id: '33333333-3333-3333-3333-333333330007', cat: 'do-gia-dung',
    title: 'Đèn học chống cận Tao1501 (đổi 3 màu ánh sáng, kẹp bàn, BH 2 năm)',
    slug: 'den-hoc-chong-can-tao1501',
    short_description: 'Đèn kẹp bàn 3 tông sáng, dịu mắt, bảo hành 2 năm — góc học gọn, đủ sáng.',
    description: '<p>Học/làm buổi tối bị mỏi mắt, đèn trần hắt bóng còn đèn cũ thì chói? Đèn kẹp bàn Tao1501 có 3 tông ánh sáng (trắng/vàng/trung tính) đổi theo việc đọc, làm hay thư giãn, kẹp gọn mép bàn nên không tốn diện tích mặt bàn.</p><h3>Điểm nổi bật</h3><ul><li>3 chế độ ánh sáng đổi theo tác vụ</li><li>Được quảng cáo là ánh sáng dịu, giảm chói</li><li>Kẹp bàn chắc, tiết kiệm mặt bàn — hợp bàn học/trọ nhỏ</li><li>Bảo hành 2 năm</li></ul><h3>Phù hợp cho</h3><ul><li>Học sinh, sinh viên, dân văn phòng làm buổi tối; quà tựu trường cho con</li></ul><h3>Lưu ý</h3><ul><li>Đèn chỉ hỗ trợ ánh sáng, vẫn cần nghỉ mắt &amp; ngồi đúng tư thế. Kiểm tra độ dày mặt bàn hợp với kẹp trước khi đặt.</li></ul><p>Đã bán 100k+ · shop 4.9★, Yêu Thích+ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: 'https://shopee.vn/product/29647358/851143551',
    affiliate_url: 'https://s.shopee.vn/4Vb0amrtOA',
    image_url: '/images/products/den-hoc-chong-can-tao1501/main.png',
    price: 165000, original_price: 317000, seller_name: 'Đèn Học Chống Cận - TAO1501',
    commission_note: disc,
    copywriting: 'Học tối mỏi mắt — có khi do cái đèn bàn, không phải do bạn học nhiều.\nĐèn kẹp bàn Tao1501: 3 tông sáng (trắng/vàng/trung tính) đổi theo việc, ánh sáng dịu giảm chói, kẹp gọn mép bàn, bảo hành 2 năm.\nĐèn chỉ hỗ trợ — vẫn nhớ nghỉ mắt nha.\nMua ngay 👇 https://s.shopee.vn/4Vb0amrtOA\n#denhoc #chongcan #gochoctap #backtoschool\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: true, bio_order: 7,
  },
  {
    id: '33333333-3333-3333-3333-333333330008', cat: 'do-gia-dung',
    title: 'Máy cắt lông xù quần áo SK-877 (lưỡi cắt siêu bén)',
    slug: 'may-cat-long-xu-sk877',
    short_description: 'Cạo sạch lông xù trong tích tắc — áo len/nỉ phẳng mịn như mới.',
    description: '<p>Áo len, áo nỉ, khăn, ghế sofa nỉ bị xù lông trông cũ kỹ? Máy cắt lông xù SK-877 với lưỡi cắt bén giúp cạo sạch lông xù nhanh gọn, áo phẳng mịn thấy rõ ngay sau khi cạo.</p><h3>Điểm nổi bật</h3><ul><li>Lưỡi cắt bén, thao tác nhanh (theo mô tả gian hàng)</li><li>Hiệu quả tức thì — before/after rõ rệt</li><li>Nhỏ gọn, dùng cho áo len/nỉ, khăn, chăn, sofa nỉ</li><li>Làm mới cả tủ đồ, kéo dài tuổi thọ quần áo</li></ul><h3>Phù hợp cho</h3><ul><li>Người có nhiều đồ len/nỉ; người bán đồ si cần làm mới hàng</li></ul><p>Đã bán 5k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/4LHaOTsWj9',
    image_url: '/images/products/may-cat-long-xu-sk877/main.png',
    price: 85000, original_price: 149000, seller_name: null, commission_note: disc,
    copywriting: 'Áo len/nỉ yêu thích bị xù lông trông cũ kỹ?\nMáy cắt lông xù SK-877 lưỡi bén cạo sạch trong tích tắc — áo phẳng mịn như mới, before/after rõ luôn.\nLàm mới cả tủ đồ chỉ với 85k.\nMua ngay 👇 https://s.shopee.vn/4LHaOTsWj9\n#maycatlongxu #chamsocquanao #dogiadung #shopeefinds\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 8,
  },
  {
    id: '33333333-3333-3333-3333-333333330009', cat: 'do-gia-dung',
    title: 'Vòi sen tăng áp 7.7cm (hạt lọc nano, kèm dây)',
    slug: 'voi-sen-tang-ap-nano',
    short_description: 'Đầu vòi to 7.7cm cho tia nước mạnh & dày hơn — lắp 1 phút, chỉ 45k.',
    description: '<p>Nước yếu, tắm không đã? Vòi sen tăng áp đầu to 7.7cm (theo mô tả gian hàng) giúp tia nước mạnh và dày hơn, kèm dây tiện thay cho bộ vòi cũ, lắp đơn giản không cần thợ.</p><h3>Điểm nổi bật</h3><ul><li>Đầu vòi to 7.7cm tăng áp lực nước (theo mô tả gian hàng)</li><li>Quảng cáo có hạt lọc nano (không khẳng định hiệu quả lọc)</li><li>Kèm dây, lắp đặt đơn giản</li><li>Giá rẻ chỉ 45.000₫</li></ul><h3>Phù hợp cho</h3><ul><li>Nhà có áp lực nước yếu, muốn nâng cấp vòi sen tiết kiệm</li></ul><h3>Lưu ý</h3><ul><li>Kiểm tra ren kết nối (thường 21mm/G1/2) hợp với đường nước nhà bạn trước khi mua.</li></ul><p>Đã bán 10k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/qhiE35qpU',
    image_url: '/images/products/voi-sen-tang-ap-nano/main.png',
    price: 45000, original_price: 48000, seller_name: null, commission_note: disc,
    copywriting: 'Nước yếu, tắm mãi không đã?\nVòi sen tăng áp đầu to 7.7cm cho tia nước mạnh & dày hơn (theo mô tả gian hàng), kèm dây, lắp 1 phút không cần thợ.\nChỉ 45k — nâng cấp phòng tắm siêu tiết kiệm.\nMua ngay 👇 https://s.shopee.vn/qhiE35qpU\n#voisentangap #nhatam #dogiadung #shopeefinds\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 9,
  },
  {
    id: '33333333-3333-3333-3333-333333330010', cat: 'cong-nghe',
    title: 'Giá đỡ laptop nhôm Macbox (gấp gọn, tản nhiệt, chỉnh độ cao)',
    slug: 'gia-do-laptop-macbox',
    short_description: 'Nâng màn gần tầm mắt, khe thoáng tản nhiệt, gấp gọn — đỡ mỏi cổ khi làm việc.',
    description: '<p>Cúi cổ nhìn màn laptop cả ngày mỏi vai gáy, máy lại nóng? Giá đỡ laptop nhôm Macbox nâng màn hình gần tầm mắt hơn, nhiều khe hở hỗ trợ tản nhiệt, chỉnh được độ cao và gấp gọn mang đi.</p><h3>Điểm nổi bật</h3><ul><li>Nâng màn gần tầm mắt, nhiều người thấy đỡ mỏi cổ</li><li>Nhôm nguyên khối, khe thoáng hỗ trợ tản nhiệt</li><li>Điều chỉnh độ cao, gấp gọn nhẹ dễ mang theo</li></ul><h3>Phù hợp cho</h3><ul><li>Dân văn phòng, sinh viên, người làm việc với laptop nhiều giờ</li></ul><p>Đã bán 100k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: 'https://shopee.vn/product/338344025/3566029986',
    affiliate_url: 'https://s.shopee.vn/gOI1k6UAT',
    image_url: '/images/products/gia-do-laptop-macbox/main.png',
    price: 74000, original_price: 99000, seller_name: null, commission_note: disc,
    copywriting: 'Cúi cổ nhìn laptop cả ngày, mỏi vai gáy — máy còn nóng ran?\nGiá đỡ laptop nhôm Macbox nâng màn gần tầm mắt, khe thoáng tản nhiệt, chỉnh độ cao, gấp gọn mang đi.\nChỉ 74k nâng cấp góc làm việc.\nMua ngay 👇 https://s.shopee.vn/gOI1k6UAT\n#giadolaptop #congthaihoc #wfh #congnghe\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: true, bio_order: 10,
  },
  {
    id: '33333333-3333-3333-3333-333333330011', cat: 'do-gia-dung',
    title: 'Máy xay sinh tố cầm tay Simplus ZZJH008 (cốc 400ml, BH 1 năm 1 đổi 1)',
    slug: 'may-xay-cam-tay-simplus',
    short_description: 'Xay xong uống ngay từ cốc 400ml đi kèm — nhỏ gọn, dễ rửa, có bảo hành.',
    description: '<p>Muốn ly sinh tố buổi sáng mà ngại rửa máy xay cồng kềnh? Máy xay cầm tay Simplus ZZJH008 xay xong uống ngay từ chính cốc 400ml đi kèm — bớt một lần đổ ra ly, bớt đồ rửa; nhỏ gọn cầm tay, có bảo hành.</p><h3>Điểm nổi bật</h3><ul><li>Cốc 400ml uống trực tiếp — xay xong dùng ngay</li><li>Nhỏ gọn cầm tay, dễ vệ sinh</li><li>Thương hiệu Simplus, bảo hành 1 năm 1 đổi 1</li></ul><h3>Phù hợp cho</h3><ul><li>Người bận rộn thích sinh tố/đồ uống healthy, không gian bếp nhỏ</li></ul><h3>Lưu ý</h3><ul><li>Công suất/loại thực phẩm xay được nên xem kỹ mô tả; tránh xay đá cứng nếu shop không ghi rõ.</li></ul><p>Đã bán 10k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: 'https://shopee.vn/product/497364265/28413535505',
    affiliate_url: 'https://s.shopee.vn/1BKYcf4a9a',
    image_url: '/images/products/may-xay-cam-tay-simplus/main.png',
    price: 433000, original_price: 610000, seller_name: 'Simplus', commission_note: disc,
    copywriting: 'Thèm ly sinh tố sáng mà ngại rửa máy xay cồng kềnh?\nMáy xay cầm tay Simplus ZZJH008: xay xong uống ngay từ cốc 400ml đi kèm, nhỏ gọn, dễ rửa — bảo hành 1 năm 1 đổi 1.\nMua ngay 👇 https://s.shopee.vn/1BKYcf4a9a\n#mayxaycamtay #sinhto #dobep #simplus\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 11,
  },
];

const rows = products.map((p) => ({
  id: p.id, title: p.title, slug: p.slug, short_description: p.short_description,
  description: p.description, platform: 'shopee', original_url: p.original_url,
  affiliate_url: p.affiliate_url, image_url: p.image_url, price: p.price,
  original_price: p.original_price, currency: 'VND', seller_name: p.seller_name,
  commission_note: p.commission_note, copywriting: p.copywriting, cta_text: 'Mua ngay',
  status: 'published', is_featured: p.is_featured, show_on_bio: true,
  bio_order: p.bio_order, published_at: now,
}));

let r = await sb.from('products').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
if (r.error) { console.error('❌ products:', r.error.message); process.exit(1); }

const links = products.map((p) => ({ product_id: p.id, category_id: catId[p.cat] }));
r = await sb.from('product_categories').upsert(links, { onConflict: 'product_id,category_id', ignoreDuplicates: true });
if (r.error) { console.error('❌ product_categories:', r.error.message); process.exit(1); }

const check = await sb.from('products').select('title,price').in('id', products.map((p) => p.id)).order('bio_order');
console.log(`✅ Đã seed 5 SP copywriting: ${check.data?.length ?? 0}/5`);
for (const x of check.data ?? []) console.log(`   • ${x.title} — ${Number(x.price).toLocaleString('vi-VN')}₫`);
const pub = await sb.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published');
console.log(`\n📦 Tổng sản phẩm published trong store: ${pub.count ?? '?'}`);
