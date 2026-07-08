// Seed 6 sản phẩm affiliate vào Supabase bằng service_role (bypass RLS).
// Idempotent: upsert theo id/slug, bỏ qua nếu trùng. Chạy: node scripts/apply-affiliate-seed.mjs
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- đọc .env.local ---
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Thiếu URL hoặc service_role key trong .env.local'); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false } });

// --- 1) test kết nối + kiểm tra bảng products ---
const probe = await sb.from('products').select('id').limit(1);
if (probe.error) {
  const msg = probe.error.message || '';
  if (/does not exist|schema cache|relation/i.test(msg)) {
    console.error('❌ BẢNG CHƯA TỒN TẠI. Hãy chạy migration trước:');
    console.error('   SQL Editor → chạy supabase/migrations/0001_init.sql rồi 0002_rls.sql');
    console.error('   Chi tiết:', msg);
    process.exit(2);
  }
  console.error('❌ Lỗi kết nối (kiểm tra key?):', msg);
  process.exit(1);
}
console.log('✅ Kết nối OK, bảng products tồn tại.');

// --- 2) categories cần dùng ---
const categories = [
  { name: 'Đồ gia dụng', slug: 'do-gia-dung', description: 'Vật dụng cho căn bếp và ngôi nhà.', status: 'active', sort_order: 1 },
  { name: 'Công nghệ', slug: 'cong-nghe', description: 'Thiết bị điện tử, gadget.', status: 'active', sort_order: 3 },
];
{
  const { error } = await sb.from('categories').upsert(categories, { onConflict: 'slug', ignoreDuplicates: true });
  if (error) { console.error('Lỗi upsert categories:', error.message); process.exit(1); }
}
const catRes = await sb.from('categories').select('id,slug').in('slug', ['do-gia-dung', 'cong-nghe']);
if (catRes.error) { console.error(catRes.error.message); process.exit(1); }
const catId = Object.fromEntries(catRes.data.map((c) => [c.slug, c.id]));

// --- 3) 6 sản phẩm ---
const now = new Date().toISOString();
const disc = 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.';
const dosenUrl = 'https://shopee.vn/dosen-s%E1%BA%A1c-d%E1%BB%B1-ph%C3%B2ng-pd22.5w-10000mah-25000mah-t%E1%BB%B1-mang-theo-d%C3%A2y-%C4%91%C3%B4i-pin-d%E1%BB%B1-ph%C3%B2ng-m%C3%A0n-h%C3%ACnh-led-t%C3%ADch-h%E1%BB%A3p-t%C3%ADch-h%E1%BB%A3p-i.1125606514.26458860279';

const products = [
  {
    id: '33333333-3333-3333-3333-333333330001', cat: 'do-gia-dung',
    title: 'Thảm lau chân silicon siêu thấm 40x60cm (X04)', slug: 'tham-lau-chan-silicon',
    short_description: 'Thấm nước cực nhanh, đế cao su chống trơn — sàn nhà tắm khô ráo tức thì.',
    description: '<p>Sàn nhà tắm lúc nào cũng ướt nhẹp, thảm vải thì ẩm mốc và hôi? Thảm lau chân silicon (đá khuê tảo) 40x60cm hút nước cực nhanh, bề mặt khô lại chỉ sau vài giây bước lên.</p><h3>Điểm nổi bật</h3><ul><li>Thấm nước cực nhanh, bề mặt mau khô</li><li>Đế cao su chống trơn trượt, an toàn cho người già &amp; trẻ nhỏ</li><li>Chỉ cần xịt rửa là sạch, không phải giặt vắt lích kích</li></ul><h3>Phù hợp cho</h3><ul><li>Nhà trọ, nhà có người già hoặc trẻ nhỏ</li></ul><h3>Lưu ý</h3><ul><li>Kích thước cố định 40x60cm, không hợp nhà tắm quá rộng</li></ul><p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo, có thể thay đổi).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/9AMoS3Frd7',
    image_url: '/images/products/tham-lau-chan-silicon/main.webp', price: 44900, original_price: null,
    seller_name: null, commission_note: disc,
    copywriting: 'Sàn nhà tắm ướt nhẹp, thảm vải ẩm mốc hôi hám?\nThảm silicon siêu thấm hút nước cực nhanh, bước lên là khô ráo — đế chống trơn an toàn cho cả nhà.\nBefore/after sàn khô thấy rõ. Đồ rẻ dưới 50k rất đáng mua cho nhà trọ.\nMua ngay 👇 https://s.shopee.vn/9AMoS3Frd7\n#thamnhatam #dogiadung #shopeefinds #nhatro\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 1,
  },
  {
    id: '33333333-3333-3333-3333-333333330002', cat: 'cong-nghe',
    title: 'Sạc dự phòng DOSEN PD 22.5W (10.000/25.000mAh, dây tích hợp, màn LED)', slug: 'sac-du-phong-dosen-225w',
    short_description: 'Sạc nhanh 22.5W, tích hợp sẵn dây đôi, màn LED báo % pin — gọn trong túi.',
    description: '<p>Điện thoại hết pin giữa đường mà quên mang cáp? Sạc dự phòng DOSEN đã tích hợp sẵn dây đôi ngay trên thân máy, hỗ trợ sạc nhanh PD 22.5W và có màn LED báo phần trăm pin còn lại.</p><h3>Điểm nổi bật</h3><ul><li>Sạc nhanh 22.5W (chuẩn PD)</li><li>Tích hợp dây sạc đôi — không cần mang cáp rời</li><li>Màn LED hiển thị dung lượng pin còn lại</li><li>Dung lượng 10.000 / 25.000mAh tuỳ phân loại</li></ul><h3>Phù hợp cho</h3><ul><li>Người hay đi lại, đi làm, đi học, đi du lịch</li></ul><p>Đã bán 10k+ · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo). Kiểm tra kỹ dung lượng &amp; phân loại trước khi đặt.</p>',
    original_url: dosenUrl, affiliate_url: dosenUrl,
    image_url: '/images/products/sac-du-phong-dosen-225w/main.webp', price: 343021, original_price: null,
    seller_name: 'DOSEN',
    commission_note: 'CHÚ Ý: đây đang là LINK GỐC Shopee (chưa gắn affiliate) — hãy tạo link tiếp thị của bạn rồi thay vào affiliate_url để được tính hoa hồng.',
    copywriting: 'Hết pin giữa đường mà quên mang cáp?\nSạc dự phòng DOSEN tích hợp sẵn dây đôi, sạc nhanh 22.5W, màn LED báo % pin — bỏ túi gọn gàng.\n10.000/25.000mAh, đã bán 10k+, 4.9★.\nMua ngay 👇 (thay link affiliate của bạn)\n#sacduphong #powerbank #phukiencongnghe #dosen\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 2,
  },
  {
    id: '33333333-3333-3333-3333-333333330003', cat: 'do-gia-dung',
    title: 'Túi hút chân không PiHome (kèm máy hút siêu tốc)', slug: 'tui-hut-chan-khong-pihome',
    short_description: 'Hút gọn quần áo, chăn màn — tiết kiệm cả nửa không gian tủ, kèm máy hút.',
    description: '<p>Tủ quần áo và vali chật cứng vì chăn màn, đồ mùa đông chiếm chỗ? Bộ túi hút chân không PiHome hút gọn thể tích đồ vải, giúp tiết kiệm phần lớn không gian cất trữ, lại đi kèm sẵn máy hút siêu tốc.</p><h3>Điểm nổi bật</h3><ul><li>Hút chân không, tiết kiệm chỗ cất đồ đáng kể</li><li>Kèm máy hút mini — không phải mua rời</li><li>Giá rất rẻ, dễ mua dùng thử</li></ul><h3>Phù hợp cho</h3><ul><li>Người cần cất trữ đồ theo mùa, nhà nhỏ, hay đi du lịch/chuyển trọ</li></ul><h3>Lưu ý</h3><ul><li>Máy hút nhỏ cần pin/sạc; nên xem kỹ mô tả về số lượng &amp; kích thước túi</li></ul><p>4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/6L2dDqLmdM',
    image_url: '/images/products/tui-hut-chan-khong-pihome/main.jpg', price: 13900, original_price: null,
    seller_name: 'PiHome', commission_note: disc,
    copywriting: 'Tủ quần áo/vali chật cứng vì chăn màn, đồ mùa đông?\nTúi hút chân không PiHome hút gọn thể tích đồ vải, tiết kiệm cả nửa không gian — kèm sẵn máy hút siêu tốc.\nGiá rẻ bất ngờ, rất đáng mua dùng thử.\nMua ngay 👇 https://s.shopee.vn/6L2dDqLmdM\n#tuihutchankhong #meotietkiem #dogiadung #pihome\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 3,
  },
  {
    id: '33333333-3333-3333-3333-333333330004', cat: 'cong-nghe',
    title: 'Máy hút bụi cầm tay dodoto Lux Air V5 (lực hút 30.000Pa)', slug: 'may-hut-bui-cam-tay-dodoto',
    short_description: 'Lực hút mạnh 30.000Pa, cầm tay gọn — hút sạch bàn phím, khe ghế, nội thất ô tô.',
    description: '<p>Bụi ở bàn phím, khe ghế sofa, góc kẹt hay nội thất ô tô mà chổi thường không với tới? Máy hút bụi cầm tay dodoto Lux Air V5 có lực hút mạnh tới 30.000Pa, thân nhỏ gọn cầm một tay và đầu hút len được vào khe hẹp.</p><h3>Điểm nổi bật</h3><ul><li>Lực hút mạnh 30.000Pa</li><li>Thiết kế cầm tay, tiện mang theo</li><li>Hút được khe nhỏ, góc kẹt, nội thất xe</li></ul><h3>Phù hợp cho</h3><ul><li>Dân văn phòng, nhà có thú cưng, người dùng ô tô</li></ul><h3>Lưu ý</h3><ul><li>Đơn giá cao hơn máy phổ thông; pin có giới hạn — cân nhắc nhu cầu trước khi mua</li></ul><p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/60PmpEN3JK',
    image_url: '/images/products/may-hut-bui-cam-tay-dodoto/main.webp', price: 435000, original_price: null,
    seller_name: 'dodoto', commission_note: disc,
    copywriting: 'Bàn phím, khe ghế, góc kẹt, nội thất ô tô đầy bụi mà chổi không với tới?\nMáy hút bụi cầm tay dodoto Lux Air V5 lực hút 30.000Pa, cầm một tay, len được khe nhỏ.\nĐáng đầu tư cho dân văn phòng, nhà có thú cưng, người đi ô tô.\nMua ngay 👇 https://s.shopee.vn/60PmpEN3JK\n#mayhutbui #dodoto #vesinhnha #congnghe\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: true, bio_order: 4,
  },
  {
    id: '33333333-3333-3333-3333-333333330005', cat: 'do-gia-dung',
    title: 'Dụng cụ xay tỏi ớt cầm tay LocknLock 180ml', slug: 'may-xay-toi-ot-locknlock',
    short_description: 'Giật dây là tỏi ớt nhuyễn trong 3 giây — thương hiệu uy tín, dễ rửa.',
    description: '<p>Băm tỏi ớt lâu, dao thớt ám mùi hăng cả bếp? Dụng cụ xay tỏi ớt cầm tay LocknLock 180ml chỉ cần giật dây vài lần là tỏi ớt nhuyễn trong khoảng 3 giây, không dùng điện, tháo rửa dễ dàng.</p><h3>Điểm nổi bật</h3><ul><li>Giật dây tay là xay nhuyễn nhanh, không cần điện</li><li>Thương hiệu LocknLock uy tín</li><li>Tháo rời dễ vệ sinh</li></ul><h3>Phù hợp cho</h3><ul><li>Người nấu ăn, người sợ cay mắt khi băm tỏi ớt</li></ul><h3>Lưu ý</h3><ul><li>Dùng lực tay kéo dây; dung tích nhỏ 180ml</li></ul><p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/5fmwQcOJzI',
    image_url: '/images/products/may-xay-toi-ot-locknlock/main.webp', price: 82700, original_price: null,
    seller_name: 'LocknLock', commission_note: disc,
    copywriting: 'Băm tỏi ớt lâu, dao thớt ám mùi hăng?\nDụng cụ xay tay LocknLock 180ml: giật dây vài cái là tỏi ớt nhuyễn trong 3 giây, không cần điện, tháo rửa dễ.\nĐồ bếp vui tay, thương hiệu uy tín.\nMua ngay 👇 https://s.shopee.vn/5fmwQcOJzI\n#doban #maybamtoi #locknlock #dogiadung\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: false, bio_order: 5,
  },
  {
    id: '33333333-3333-3333-3333-333333330006', cat: 'do-gia-dung',
    title: 'Cây lau nhà tự vắt Parroti MG01 (bàn xoay 360°)', slug: 'cay-lau-nha-tu-vat-parroti',
    short_description: 'Tự vắt không chạm nước bẩn, bàn xoay 360° — sàn khô nhanh, không cúi khom.',
    description: '<p>Cúi khom vắt giẻ, tay ướt bẩn mỗi lần lau nhà? Cây lau nhà tự vắt Parroti MG01 cho phép vắt khô ngay trên cán mà không phải chạm tay vào nước bẩn, đầu lau xoay 360° luồn được gầm bàn ghế, sàn khô nhanh hơn.</p><h3>Điểm nổi bật</h3><ul><li>Tự vắt không chạm nước bẩn</li><li>Bàn lau xoay 360°, lau linh hoạt mọi góc</li><li>Sàn khô nhanh sau khi lau</li></ul><h3>Phù hợp cho</h3><ul><li>Nhà sàn gạch/gỗ, nhà có trẻ con, ai ngại vắt giẻ</li></ul><h3>Lưu ý</h3><ul><li>Bông lau dùng lâu ngày cần thay; giá nhỉnh hơn cây lau thường</li></ul><p>Đã bán 50k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
    original_url: null, affiliate_url: 'https://s.shopee.vn/80Ar3uKIzq',
    image_url: '/images/products/cay-lau-nha-tu-vat-parroti/main.webp', price: 255000, original_price: null,
    seller_name: 'Parroti', commission_note: disc,
    copywriting: 'Cúi khom vắt giẻ, tay ướt bẩn mỗi lần lau nhà?\nCây lau nhà tự vắt Parroti MG01: vắt khô ngay trên cán không chạm nước bẩn, bàn xoay 360°, sàn khô nhanh.\nMón đáng tiền nhất cho nhà có trẻ con.\nMua ngay 👇 https://s.shopee.vn/80Ar3uKIzq\n#caylaunha #tuvat #parroti #dogiadung\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
    is_featured: true, bio_order: 6,
  },
];

const productRows = products.map((p) => ({
  id: p.id, title: p.title, slug: p.slug, short_description: p.short_description,
  description: p.description, platform: 'shopee', original_url: p.original_url,
  affiliate_url: p.affiliate_url, image_url: p.image_url, price: p.price,
  original_price: p.original_price, currency: 'VND', seller_name: p.seller_name,
  commission_note: p.commission_note, copywriting: p.copywriting, cta_text: 'Mua ngay',
  status: 'published', is_featured: p.is_featured, show_on_bio: true,
  bio_order: p.bio_order, published_at: now,
}));

{
  const { error } = await sb.from('products').upsert(productRows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) { console.error('❌ Lỗi upsert products:', error.message); process.exit(1); }
}

const links = products.map((p) => ({ product_id: p.id, category_id: catId[p.cat] }));
{
  const { error } = await sb.from('product_categories').upsert(links, { onConflict: 'product_id,category_id', ignoreDuplicates: true });
  if (error) { console.error('❌ Lỗi gắn danh mục:', error.message); process.exit(1); }
}

// --- 4) xác minh ---
const check = await sb.from('products').select('title,price,status,image_url').in('id', products.map((p) => p.id)).order('bio_order');
console.log(`\n✅ Đã seed. Tổng sản phẩm vừa thêm: ${check.data?.length ?? 0}/6`);
for (const r of check.data ?? []) console.log(`   • ${r.title} — ${Number(r.price).toLocaleString('vi-VN')}₫ [${r.status}]`);
const pubCount = await sb.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published');
console.log(`\n📦 Tổng sản phẩm published trong store: ${pubCount.count ?? '?'}`);
