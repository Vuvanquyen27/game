-- =============================================================================
-- seed_affiliate_products.sql — 6 sản phẩm affiliate THẬT (có ảnh) cho gian hàng
--
-- Nguồn dữ liệu: affiliate_collected/ (threads_affiliate/products.csv + Product
-- Research). Ảnh đã copy vào public/images/products/<slug>/main.<ext>.
--
-- Idempotent: dùng UUID cố định + ON CONFLICT DO NOTHING → chạy lại không nhân đôi.
-- Tự chứa: KHÔNG phụ thuộc seed.sql (tự bảo đảm 2 danh mục cần dùng tồn tại).
--
-- CÁCH CHẠY:
--   • Supabase Dashboard → SQL Editor → dán toàn bộ file này → Run.
--   • Hoặc CLI: supabase db execute -f supabase/seed_affiliate_products.sql
--
-- LƯU Ý: Sản phẩm "Sạc dự phòng DOSEN" hiện dùng LINK GỐC Shopee (chưa có link
--        affiliate trong dữ liệu). Nhớ thay affiliate_url bằng link tiếp thị của
--        bạn để được tính hoa hồng. Các sản phẩm còn lại đã có link s.shopee.vn.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) DANH MỤC — bảo đảm tồn tại (khớp slug với seed.sql; không đụng nếu đã có).
-- -----------------------------------------------------------------------------
insert into public.categories (name, slug, description, status, sort_order) values
  ('Đồ gia dụng', 'do-gia-dung', 'Vật dụng cho căn bếp và ngôi nhà.', 'active', 1),
  ('Công nghệ',   'cong-nghe',   'Thiết bị điện tử, gadget.',          'active', 3)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 2) SẢN PHẨM — 6 món, published, đa dạng giá. UUID cố định 3333...000N.
--    copywriting = khối caption sẵn dùng cho tính năng "tạo bài social" (admin).
-- -----------------------------------------------------------------------------
insert into public.products
  (id, title, slug, short_description, description, platform, original_url,
   affiliate_url, image_url, price, original_price, currency, seller_name,
   commission_note, copywriting, cta_text, status, is_featured, show_on_bio,
   bio_order, published_at)
values
  -- === SP1: Thảm lau chân silicon ===
  ('33333333-3333-3333-3333-333333330001',
   'Thảm lau chân silicon siêu thấm 40x60cm (X04)',
   'tham-lau-chan-silicon',
   'Thấm nước cực nhanh, đế cao su chống trơn — sàn nhà tắm khô ráo tức thì.',
   '<p>Sàn nhà tắm lúc nào cũng ướt nhẹp, thảm vải thì ẩm mốc và hôi? Thảm lau chân silicon (đá khuê tảo) 40x60cm hút nước cực nhanh, bề mặt khô lại chỉ sau vài giây bước lên.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Thấm nước cực nhanh, bề mặt mau khô</li><li>Đế cao su chống trơn trượt, an toàn cho người già &amp; trẻ nhỏ</li><li>Chỉ cần xịt rửa là sạch, không phải giặt vắt lích kích</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Nhà trọ, nhà có người già hoặc trẻ nhỏ</li></ul>'
   '<h3>Lưu ý</h3><ul><li>Kích thước cố định 40x60cm, không hợp nhà tắm quá rộng</li></ul>'
   '<p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo, có thể thay đổi).</p>',
   'shopee', null,
   'https://s.shopee.vn/9AMoS3Frd7',
   '/images/products/tham-lau-chan-silicon/main.webp',
   44900, null, 'VND', null,
   'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.',
   E'Sàn nhà tắm ướt nhẹp, thảm vải ẩm mốc hôi hám?\nThảm silicon siêu thấm hút nước cực nhanh, bước lên là khô ráo — đế chống trơn an toàn cho cả nhà.\nBefore/after sàn khô thấy rõ. Đồ rẻ dưới 50k rất đáng mua cho nhà trọ.\nMua ngay 👇 https://s.shopee.vn/9AMoS3Frd7\n#thamnhatam #dogiadung #shopeefinds #nhatro\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', false, true, 1, now()),

  -- === SP2: Sạc dự phòng DOSEN (LINK GỐC — thay bằng link affiliate của bạn) ===
  ('33333333-3333-3333-3333-333333330002',
   'Sạc dự phòng DOSEN PD 22.5W (10.000/25.000mAh, dây tích hợp, màn LED)',
   'sac-du-phong-dosen-225w',
   'Sạc nhanh 22.5W, tích hợp sẵn dây đôi, màn LED báo % pin — gọn trong túi.',
   '<p>Điện thoại hết pin giữa đường mà quên mang cáp? Sạc dự phòng DOSEN đã tích hợp sẵn dây đôi ngay trên thân máy, hỗ trợ sạc nhanh PD 22.5W và có màn LED báo phần trăm pin còn lại.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Sạc nhanh 22.5W (chuẩn PD)</li><li>Tích hợp dây sạc đôi — không cần mang cáp rời</li><li>Màn LED hiển thị dung lượng pin còn lại</li><li>Dung lượng 10.000 / 25.000mAh tuỳ phân loại</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Người hay đi lại, đi làm, đi học, đi du lịch</li></ul>'
   '<p>Đã bán 10k+ · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo). Kiểm tra kỹ dung lượng &amp; phân loại trước khi đặt.</p>',
   'shopee',
   'https://shopee.vn/dosen-s%E1%BA%A1c-d%E1%BB%B1-ph%C3%B2ng-pd22.5w-10000mah-25000mah-t%E1%BB%B1-mang-theo-d%C3%A2y-%C4%91%C3%B4i-pin-d%E1%BB%B1-ph%C3%B2ng-m%C3%A0n-h%C3%ACnh-led-t%C3%ADch-h%E1%BB%A3p-t%C3%ADch-h%E1%BB%A3p-i.1125606514.26458860279',
   'https://shopee.vn/dosen-s%E1%BA%A1c-d%E1%BB%B1-ph%C3%B2ng-pd22.5w-10000mah-25000mah-t%E1%BB%B1-mang-theo-d%C3%A2y-%C4%91%C3%B4i-pin-d%E1%BB%B1-ph%C3%B2ng-m%C3%A0n-h%C3%ACnh-led-t%C3%ADch-h%E1%BB%A3p-t%C3%ADch-h%E1%BB%A3p-i.1125606514.26458860279',
   '/images/products/sac-du-phong-dosen-225w/main.webp',
   343021, null, 'VND', 'DOSEN',
   'CHÚ Ý: đây đang là LINK GỐC Shopee (chưa gắn affiliate) — hãy tạo link tiếp thị của bạn rồi thay vào affiliate_url để được tính hoa hồng.',
   E'Hết pin giữa đường mà quên mang cáp?\nSạc dự phòng DOSEN tích hợp sẵn dây đôi, sạc nhanh 22.5W, màn LED báo % pin — bỏ túi gọn gàng.\n10.000/25.000mAh, đã bán 10k+, 4.9★.\nMua ngay 👇 (thay link affiliate của bạn)\n#sacduphong #powerbank #phukiencongnghe #dosen\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', false, true, 2, now()),

  -- === SP3: Túi hút chân không PiHome ===
  ('33333333-3333-3333-3333-333333330003',
   'Túi hút chân không PiHome (kèm máy hút siêu tốc)',
   'tui-hut-chan-khong-pihome',
   'Hút gọn quần áo, chăn màn — tiết kiệm cả nửa không gian tủ, kèm máy hút.',
   '<p>Tủ quần áo và vali chật cứng vì chăn màn, đồ mùa đông chiếm chỗ? Bộ túi hút chân không PiHome hút gọn thể tích đồ vải, giúp tiết kiệm phần lớn không gian cất trữ, lại đi kèm sẵn máy hút siêu tốc.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Hút chân không, tiết kiệm chỗ cất đồ đáng kể</li><li>Kèm máy hút mini — không phải mua rời</li><li>Giá rất rẻ, dễ mua dùng thử</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Người cần cất trữ đồ theo mùa, nhà nhỏ, hay đi du lịch/chuyển trọ</li></ul>'
   '<h3>Lưu ý</h3><ul><li>Máy hút nhỏ cần pin/sạc; nên xem kỹ mô tả về số lượng &amp; kích thước túi</li></ul>'
   '<p>4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
   'shopee', null,
   'https://s.shopee.vn/6L2dDqLmdM',
   '/images/products/tui-hut-chan-khong-pihome/main.jpg',
   13900, null, 'VND', 'PiHome',
   'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.',
   E'Tủ quần áo/vali chật cứng vì chăn màn, đồ mùa đông?\nTúi hút chân không PiHome hút gọn thể tích đồ vải, tiết kiệm cả nửa không gian — kèm sẵn máy hút siêu tốc.\nGiá rẻ bất ngờ, rất đáng mua dùng thử.\nMua ngay 👇 https://s.shopee.vn/6L2dDqLmdM\n#tuihutchankhong #meotietkiem #dogiadung #pihome\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', false, true, 3, now()),

  -- === SP4: Máy hút bụi cầm tay dodoto ===
  ('33333333-3333-3333-3333-333333330004',
   'Máy hút bụi cầm tay dodoto Lux Air V5 (lực hút 30.000Pa)',
   'may-hut-bui-cam-tay-dodoto',
   'Lực hút mạnh 30.000Pa, cầm tay gọn — hút sạch bàn phím, khe ghế, nội thất ô tô.',
   '<p>Bụi ở bàn phím, khe ghế sofa, góc kẹt hay nội thất ô tô mà chổi thường không với tới? Máy hút bụi cầm tay dodoto Lux Air V5 có lực hút mạnh tới 30.000Pa, thân nhỏ gọn cầm một tay và đầu hút len được vào khe hẹp.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Lực hút mạnh 30.000Pa</li><li>Thiết kế cầm tay, tiện mang theo</li><li>Hút được khe nhỏ, góc kẹt, nội thất xe</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Dân văn phòng, nhà có thú cưng, người dùng ô tô</li></ul>'
   '<h3>Lưu ý</h3><ul><li>Đơn giá cao hơn máy phổ thông; pin có giới hạn — cân nhắc nhu cầu trước khi mua</li></ul>'
   '<p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
   'shopee', null,
   'https://s.shopee.vn/60PmpEN3JK',
   '/images/products/may-hut-bui-cam-tay-dodoto/main.webp',
   435000, null, 'VND', 'dodoto',
   'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.',
   E'Bàn phím, khe ghế, góc kẹt, nội thất ô tô đầy bụi mà chổi không với tới?\nMáy hút bụi cầm tay dodoto Lux Air V5 lực hút 30.000Pa, cầm một tay, len được khe nhỏ.\nĐáng đầu tư cho dân văn phòng, nhà có thú cưng, người đi ô tô.\nMua ngay 👇 https://s.shopee.vn/60PmpEN3JK\n#mayhutbui #dodoto #vesinhnha #congnghe\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', true, true, 4, now()),

  -- === SP5: Máy xay tỏi ớt cầm tay LocknLock ===
  ('33333333-3333-3333-3333-333333330005',
   'Dụng cụ xay tỏi ớt cầm tay LocknLock 180ml',
   'may-xay-toi-ot-locknlock',
   'Giật dây là tỏi ớt nhuyễn trong 3 giây — thương hiệu uy tín, dễ rửa.',
   '<p>Băm tỏi ớt lâu, dao thớt ám mùi hăng cả bếp? Dụng cụ xay tỏi ớt cầm tay LocknLock 180ml chỉ cần giật dây vài lần là tỏi ớt nhuyễn trong khoảng 3 giây, không dùng điện, tháo rửa dễ dàng.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Giật dây tay là xay nhuyễn nhanh, không cần điện</li><li>Thương hiệu LocknLock uy tín</li><li>Tháo rời dễ vệ sinh</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Người nấu ăn, người sợ cay mắt khi băm tỏi ớt</li></ul>'
   '<h3>Lưu ý</h3><ul><li>Dùng lực tay kéo dây; dung tích nhỏ 180ml</li></ul>'
   '<p>Đã bán 40k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
   'shopee', null,
   'https://s.shopee.vn/5fmwQcOJzI',
   '/images/products/may-xay-toi-ot-locknlock/main.webp',
   82700, null, 'VND', 'LocknLock',
   'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.',
   E'Băm tỏi ớt lâu, dao thớt ám mùi hăng?\nDụng cụ xay tay LocknLock 180ml: giật dây vài cái là tỏi ớt nhuyễn trong 3 giây, không cần điện, tháo rửa dễ.\nĐồ bếp vui tay, thương hiệu uy tín.\nMua ngay 👇 https://s.shopee.vn/5fmwQcOJzI\n#doban #maybamtoi #locknlock #dogiadung\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', false, true, 5, now()),

  -- === SP6: Cây lau nhà tự vắt Parroti MG01 ===
  ('33333333-3333-3333-3333-333333330006',
   'Cây lau nhà tự vắt Parroti MG01 (bàn xoay 360°)',
   'cay-lau-nha-tu-vat-parroti',
   'Tự vắt không chạm nước bẩn, bàn xoay 360° — sàn khô nhanh, không cúi khom.',
   '<p>Cúi khom vắt giẻ, tay ướt bẩn mỗi lần lau nhà? Cây lau nhà tự vắt Parroti MG01 cho phép vắt khô ngay trên cán mà không phải chạm tay vào nước bẩn, đầu lau xoay 360° luồn được gầm bàn ghế, sàn khô nhanh hơn.</p>'
   '<h3>Điểm nổi bật</h3>'
   '<ul><li>Tự vắt không chạm nước bẩn</li><li>Bàn lau xoay 360°, lau linh hoạt mọi góc</li><li>Sàn khô nhanh sau khi lau</li></ul>'
   '<h3>Phù hợp cho</h3><ul><li>Nhà sàn gạch/gỗ, nhà có trẻ con, ai ngại vắt giẻ</li></ul>'
   '<h3>Lưu ý</h3><ul><li>Bông lau dùng lâu ngày cần thay; giá nhỉnh hơn cây lau thường</li></ul>'
   '<p>Đã bán 50k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>',
   'shopee', null,
   'https://s.shopee.vn/80Ar3uKIzq',
   '/images/products/cay-lau-nha-tu-vat-parroti/main.webp',
   255000, null, 'VND', 'Parroti',
   'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.',
   E'Cúi khom vắt giẻ, tay ướt bẩn mỗi lần lau nhà?\nCây lau nhà tự vắt Parroti MG01: vắt khô ngay trên cán không chạm nước bẩn, bàn xoay 360°, sàn khô nhanh.\nMón đáng tiền nhất cho nhà có trẻ con.\nMua ngay 👇 https://s.shopee.vn/80Ar3uKIzq\n#caylaunha #tuvat #parroti #dogiadung\n(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)',
   'Mua ngay', 'published', true, true, 6, now())
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3) GẮN DANH MỤC — lookup theo slug (không phụ thuộc UUID danh mục).
-- -----------------------------------------------------------------------------
insert into public.product_categories (product_id, category_id)
select p.id, c.id
from (values
  ('tham-lau-chan-silicon',        'do-gia-dung'),
  ('sac-du-phong-dosen-225w',      'cong-nghe'),
  ('tui-hut-chan-khong-pihome',    'do-gia-dung'),
  ('may-hut-bui-cam-tay-dodoto',   'cong-nghe'),
  ('may-xay-toi-ot-locknlock',     'do-gia-dung'),
  ('cay-lau-nha-tu-vat-parroti',   'do-gia-dung')
) as m(prod_slug, cat_slug)
join public.products p   on p.slug = m.prod_slug
join public.categories c on c.slug = m.cat_slug
on conflict do nothing;

-- ################### PHẦN B: 5 SẢN PHẨM COPYWRITING (ảnh placeholder) ##########
-- Đèn học Tao1501, máy cắt lông xù SK-877, vòi sen tăng áp, giá đỡ laptop Macbox,
-- máy xay Simplus. Ảnh = /images/products/<slug>/main.png (placeholder, thay sau).
insert into public.products
  (id, title, slug, short_description, description, platform, original_url, affiliate_url, image_url, price, original_price, currency, seller_name, commission_note, copywriting, cta_text, status, is_featured, show_on_bio, bio_order, published_at)
values
  ('33333333-3333-3333-3333-333333330007', 'Đèn học chống cận Tao1501 (đổi 3 màu ánh sáng, kẹp bàn, BH 2 năm)', 'den-hoc-chong-can-tao1501', 'Đèn kẹp bàn 3 tông sáng, dịu mắt, bảo hành 2 năm — góc học gọn, đủ sáng.', '<p>Học/làm buổi tối bị mỏi mắt, đèn trần hắt bóng còn đèn cũ thì chói? Đèn kẹp bàn Tao1501 có 3 tông ánh sáng (trắng/vàng/trung tính) đổi theo việc đọc, làm hay thư giãn, kẹp gọn mép bàn nên không tốn diện tích mặt bàn.</p><h3>Điểm nổi bật</h3><ul><li>3 chế độ ánh sáng đổi theo tác vụ</li><li>Được quảng cáo là ánh sáng dịu, giảm chói</li><li>Kẹp bàn chắc, tiết kiệm mặt bàn — hợp bàn học/trọ nhỏ</li><li>Bảo hành 2 năm</li></ul><h3>Phù hợp cho</h3><ul><li>Học sinh, sinh viên, dân văn phòng làm buổi tối; quà tựu trường cho con</li></ul><h3>Lưu ý</h3><ul><li>Đèn chỉ hỗ trợ ánh sáng, vẫn cần nghỉ mắt &amp; ngồi đúng tư thế. Kiểm tra độ dày mặt bàn hợp với kẹp trước khi đặt.</li></ul><p>Đã bán 100k+ · shop 4.9★, Yêu Thích+ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>', 'shopee', 'https://shopee.vn/product/29647358/851143551', 'https://s.shopee.vn/4Vb0amrtOA', '/images/products/den-hoc-chong-can-tao1501/main.png', 165000, 317000, 'VND', 'Đèn Học Chống Cận - TAO1501', 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.', 'Học tối mỏi mắt — có khi do cái đèn bàn, không phải do bạn học nhiều.
Đèn kẹp bàn Tao1501: 3 tông sáng (trắng/vàng/trung tính) đổi theo việc, ánh sáng dịu giảm chói, kẹp gọn mép bàn, bảo hành 2 năm.
Đèn chỉ hỗ trợ — vẫn nhớ nghỉ mắt nha.
Mua ngay 👇 https://s.shopee.vn/4Vb0amrtOA
#denhoc #chongcan #gochoctap #backtoschool
(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)', 'Mua ngay', 'published', true, true, 7, now()),
  ('33333333-3333-3333-3333-333333330008', 'Máy cắt lông xù quần áo SK-877 (lưỡi cắt siêu bén)', 'may-cat-long-xu-sk877', 'Cạo sạch lông xù trong tích tắc — áo len/nỉ phẳng mịn như mới.', '<p>Áo len, áo nỉ, khăn, ghế sofa nỉ bị xù lông trông cũ kỹ? Máy cắt lông xù SK-877 với lưỡi cắt bén giúp cạo sạch lông xù nhanh gọn, áo phẳng mịn thấy rõ ngay sau khi cạo.</p><h3>Điểm nổi bật</h3><ul><li>Lưỡi cắt bén, thao tác nhanh (theo mô tả gian hàng)</li><li>Hiệu quả tức thì — before/after rõ rệt</li><li>Nhỏ gọn, dùng cho áo len/nỉ, khăn, chăn, sofa nỉ</li><li>Làm mới cả tủ đồ, kéo dài tuổi thọ quần áo</li></ul><h3>Phù hợp cho</h3><ul><li>Người có nhiều đồ len/nỉ; người bán đồ si cần làm mới hàng</li></ul><p>Đã bán 5k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>', 'shopee', null, 'https://s.shopee.vn/4LHaOTsWj9', '/images/products/may-cat-long-xu-sk877/main.png', 85000, 149000, 'VND', null, 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.', 'Áo len/nỉ yêu thích bị xù lông trông cũ kỹ?
Máy cắt lông xù SK-877 lưỡi bén cạo sạch trong tích tắc — áo phẳng mịn như mới, before/after rõ luôn.
Làm mới cả tủ đồ chỉ với 85k.
Mua ngay 👇 https://s.shopee.vn/4LHaOTsWj9
#maycatlongxu #chamsocquanao #dogiadung #shopeefinds
(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)', 'Mua ngay', 'published', false, true, 8, now()),
  ('33333333-3333-3333-3333-333333330009', 'Vòi sen tăng áp 7.7cm (hạt lọc nano, kèm dây)', 'voi-sen-tang-ap-nano', 'Đầu vòi to 7.7cm cho tia nước mạnh & dày hơn — lắp 1 phút, chỉ 45k.', '<p>Nước yếu, tắm không đã? Vòi sen tăng áp đầu to 7.7cm (theo mô tả gian hàng) giúp tia nước mạnh và dày hơn, kèm dây tiện thay cho bộ vòi cũ, lắp đơn giản không cần thợ.</p><h3>Điểm nổi bật</h3><ul><li>Đầu vòi to 7.7cm tăng áp lực nước (theo mô tả gian hàng)</li><li>Quảng cáo có hạt lọc nano (không khẳng định hiệu quả lọc)</li><li>Kèm dây, lắp đặt đơn giản</li><li>Giá rẻ chỉ 45.000₫</li></ul><h3>Phù hợp cho</h3><ul><li>Nhà có áp lực nước yếu, muốn nâng cấp vòi sen tiết kiệm</li></ul><h3>Lưu ý</h3><ul><li>Kiểm tra ren kết nối (thường 21mm/G1/2) hợp với đường nước nhà bạn trước khi mua.</li></ul><p>Đã bán 10k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>', 'shopee', null, 'https://s.shopee.vn/qhiE35qpU', '/images/products/voi-sen-tang-ap-nano/main.png', 45000, 48000, 'VND', null, 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.', 'Nước yếu, tắm mãi không đã?
Vòi sen tăng áp đầu to 7.7cm cho tia nước mạnh & dày hơn (theo mô tả gian hàng), kèm dây, lắp 1 phút không cần thợ.
Chỉ 45k — nâng cấp phòng tắm siêu tiết kiệm.
Mua ngay 👇 https://s.shopee.vn/qhiE35qpU
#voisentangap #nhatam #dogiadung #shopeefinds
(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)', 'Mua ngay', 'published', false, true, 9, now()),
  ('33333333-3333-3333-3333-333333330010', 'Giá đỡ laptop nhôm Macbox (gấp gọn, tản nhiệt, chỉnh độ cao)', 'gia-do-laptop-macbox', 'Nâng màn gần tầm mắt, khe thoáng tản nhiệt, gấp gọn — đỡ mỏi cổ khi làm việc.', '<p>Cúi cổ nhìn màn laptop cả ngày mỏi vai gáy, máy lại nóng? Giá đỡ laptop nhôm Macbox nâng màn hình gần tầm mắt hơn, nhiều khe hở hỗ trợ tản nhiệt, chỉnh được độ cao và gấp gọn mang đi.</p><h3>Điểm nổi bật</h3><ul><li>Nâng màn gần tầm mắt, nhiều người thấy đỡ mỏi cổ</li><li>Nhôm nguyên khối, khe thoáng hỗ trợ tản nhiệt</li><li>Điều chỉnh độ cao, gấp gọn nhẹ dễ mang theo</li></ul><h3>Phù hợp cho</h3><ul><li>Dân văn phòng, sinh viên, người làm việc với laptop nhiều giờ</li></ul><p>Đã bán 100k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>', 'shopee', 'https://shopee.vn/product/338344025/3566029986', 'https://s.shopee.vn/gOI1k6UAT', '/images/products/gia-do-laptop-macbox/main.png', 74000, 99000, 'VND', null, 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.', 'Cúi cổ nhìn laptop cả ngày, mỏi vai gáy — máy còn nóng ran?
Giá đỡ laptop nhôm Macbox nâng màn gần tầm mắt, khe thoáng tản nhiệt, chỉnh độ cao, gấp gọn mang đi.
Chỉ 74k nâng cấp góc làm việc.
Mua ngay 👇 https://s.shopee.vn/gOI1k6UAT
#giadolaptop #congthaihoc #wfh #congnghe
(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)', 'Mua ngay', 'published', true, true, 10, now()),
  ('33333333-3333-3333-3333-333333330011', 'Máy xay sinh tố cầm tay Simplus ZZJH008 (cốc 400ml, BH 1 năm 1 đổi 1)', 'may-xay-cam-tay-simplus', 'Xay xong uống ngay từ cốc 400ml đi kèm — nhỏ gọn, dễ rửa, có bảo hành.', '<p>Muốn ly sinh tố buổi sáng mà ngại rửa máy xay cồng kềnh? Máy xay cầm tay Simplus ZZJH008 xay xong uống ngay từ chính cốc 400ml đi kèm — bớt một lần đổ ra ly, bớt đồ rửa; nhỏ gọn cầm tay, có bảo hành.</p><h3>Điểm nổi bật</h3><ul><li>Cốc 400ml uống trực tiếp — xay xong dùng ngay</li><li>Nhỏ gọn cầm tay, dễ vệ sinh</li><li>Thương hiệu Simplus, bảo hành 1 năm 1 đổi 1</li></ul><h3>Phù hợp cho</h3><ul><li>Người bận rộn thích sinh tố/đồ uống healthy, không gian bếp nhỏ</li></ul><h3>Lưu ý</h3><ul><li>Công suất/loại thực phẩm xay được nên xem kỹ mô tả; tránh xay đá cứng nếu shop không ghi rõ.</li></ul><p>Đã bán 10k+/tháng · 4.9★ (số hiển thị trên Shopee tại thời điểm tham khảo).</p>', 'shopee', 'https://shopee.vn/product/497364265/28413535505', 'https://s.shopee.vn/1BKYcf4a9a', '/images/products/may-xay-cam-tay-simplus/main.png', 433000, 610000, 'VND', 'Simplus', 'Đây là link tiếp thị liên kết (affiliate). Mình có thể nhận hoa hồng khi bạn mua qua link, giá sản phẩm không đổi.', 'Thèm ly sinh tố sáng mà ngại rửa máy xay cồng kềnh?
Máy xay cầm tay Simplus ZZJH008: xay xong uống ngay từ cốc 400ml đi kèm, nhỏ gọn, dễ rửa — bảo hành 1 năm 1 đổi 1.
Mua ngay 👇 https://s.shopee.vn/1BKYcf4a9a
#mayxaycamtay #sinhto #dobep #simplus
(Tiếp thị liên kết – có thể nhận hoa hồng, giá không đổi.)', 'Mua ngay', 'published', false, true, 11, now())
on conflict (id) do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id
from (values
  ('den-hoc-chong-can-tao1501', 'do-gia-dung'),
  ('may-cat-long-xu-sk877', 'do-gia-dung'),
  ('voi-sen-tang-ap-nano', 'do-gia-dung'),
  ('gia-do-laptop-macbox', 'cong-nghe'),
  ('may-xay-cam-tay-simplus', 'do-gia-dung')
) as m(prod_slug, cat_slug)
join public.products p   on p.slug = m.prod_slug
join public.categories c on c.slug = m.cat_slug
on conflict do nothing;
