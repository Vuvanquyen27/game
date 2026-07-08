-- =============================================================================
-- seed.sql — Dữ liệu mẫu (demo) cho "Ezriso"
--
-- !!! CHỈ DÙNG CHO LOCAL / DEV !!!
-- Xóa hoặc BỎ QUA file này khi seed môi trường production.
--
-- KHÔNG seed profiles/admin hay mật khẩu. Tài khoản admin được tạo qua Supabase
-- Auth (Dashboard hoặc signUp). Sau khi có user, promote admin thủ công:
--     update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- File này idempotent ở mức hợp lý: dùng UUID cố định + ON CONFLICT DO NOTHING
-- để chạy lại không bị nhân đôi (trừ click_events dùng random id — xem cuối file).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CATEGORIES — 6 danh mục active
-- -----------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, status, sort_order) values
  ('11111111-1111-1111-1111-111111110001', 'Đồ gia dụng', 'do-gia-dung', 'Vật dụng cho căn bếp và ngôi nhà.', 'active', 1),
  ('11111111-1111-1111-1111-111111110002', 'Thời trang',  'thoi-trang',  'Quần áo, phụ kiện xu hướng.',          'active', 2),
  ('11111111-1111-1111-1111-111111110003', 'Công nghệ',   'cong-nghe',   'Thiết bị điện tử, gadget.',            'active', 3),
  ('11111111-1111-1111-1111-111111110004', 'Làm đẹp',     'lam-dep',     'Mỹ phẩm và chăm sóc cá nhân.',         'active', 4),
  ('11111111-1111-1111-1111-111111110005', 'Mẹ & Bé',     'me-va-be',    'Sản phẩm cho mẹ và em bé.',            'active', 5),
  ('11111111-1111-1111-1111-111111110006', 'Thể thao',    'the-thao',    'Dụng cụ và trang phục thể thao.',      'active', 6)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- PRODUCTS — 8 sản phẩm published, chưa xóa mềm, nền tảng đa dạng.
-- Có price & original_price để hiển thị % giảm giá. published_at = now().
-- -----------------------------------------------------------------------------
insert into public.products
  (id, title, slug, short_description, description, platform, original_url, affiliate_url, image_url,
   price, original_price, currency, seller_name, cta_text, status, is_featured, show_on_bio, bio_order, published_at)
values
  ('22222222-2222-2222-2222-222222220001',
   'Nồi chiên không dầu 5L', 'noi-chien-khong-dau-5l',
   'Nấu ăn ít dầu, giòn ngon.', 'Nồi chiên không dầu dung tích 5L, công suất 1500W, hẹn giờ tự động.',
   'shopee', 'https://shopee.vn/product-example-1', 'https://shopee.vn/product-example-1',
   'https://picsum.photos/seed/airfryer/800/800',
   1290000, 1990000, 'VND', 'HomeMart Official', 'Mua ngay', 'published', true, true, 1, now()),

  ('22222222-2222-2222-2222-222222220002',
   'Áo khoác dù unisex', 'ao-khoac-du-unisex',
   'Chống gió, nhẹ, form rộng.', 'Áo khoác dù 2 lớp, chống nước nhẹ, phù hợp cả nam và nữ.',
   'lazada', 'https://lazada.vn/product-example-2', 'https://lazada.vn/product-example-2',
   'https://picsum.photos/seed/jacket/800/800',
   259000, 399000, 'VND', 'Fashion House', 'Xem shop', 'published', false, true, 2, now()),

  ('22222222-2222-2222-2222-222222220003',
   'Tai nghe Bluetooth TWS', 'tai-nghe-bluetooth-tws',
   'Chống ồn, pin 30 giờ.', 'Tai nghe true wireless, Bluetooth 5.3, chống ồn chủ động ANC.',
   'tiktok_shop', 'https://tiktok.com/product-example-3', 'https://tiktok.com/product-example-3',
   'https://picsum.photos/seed/earbuds/800/800',
   690000, 1090000, 'VND', 'TechZone', 'Mua ngay', 'published', true, true, 3, now()),

  ('22222222-2222-2222-2222-222222220004',
   'Serum vitamin C 30ml', 'serum-vitamin-c-30ml',
   'Sáng da, mờ thâm.', 'Serum vitamin C 15% giúp làm sáng và đều màu da, chai 30ml.',
   'shopee', 'https://shopee.vn/product-example-4', 'https://shopee.vn/product-example-4',
   'https://picsum.photos/seed/serum/800/800',
   315000, 450000, 'VND', 'Beauty Lab', 'Mua ngay', 'published', false, true, 4, now()),

  ('22222222-2222-2222-2222-222222220005',
   'Xe đẩy gấp gọn cho bé', 'xe-day-gap-gon-cho-be',
   'Nhẹ, gấp một tay.', 'Xe đẩy em bé gấp gọn, khung nhôm siêu nhẹ, phanh an toàn.',
   'lazada', 'https://lazada.vn/product-example-5', 'https://lazada.vn/product-example-5',
   'https://picsum.photos/seed/stroller/800/800',
   1750000, 2500000, 'VND', 'BabyLove', 'Xem chi tiết', 'published', true, false, 0, now()),

  ('22222222-2222-2222-2222-222222220006',
   'Thảm tập yoga chống trượt', 'tham-tap-yoga-chong-truot',
   'Dày 8mm, êm ái.', 'Thảm yoga TPE 8mm, chống trượt hai mặt, kèm dây buộc.',
   'amazon', 'https://amazon.com/product-example-6', 'https://amazon.com/product-example-6',
   'https://picsum.photos/seed/yogamat/800/800',
   289000, 420000, 'VND', 'FitGear', 'Mua ngay', 'published', false, false, 0, now()),

  ('22222222-2222-2222-2222-222222220007',
   'Bàn phím cơ không dây', 'ban-phim-co-khong-day',
   'Hot-swap, RGB.', 'Bàn phím cơ 75%, kết nối Bluetooth/2.4G/USB-C, switch hot-swap.',
   'tiktok_shop', 'https://tiktok.com/product-example-7', 'https://tiktok.com/product-example-7',
   'https://picsum.photos/seed/keyboard/800/800',
   890000, 1290000, 'VND', 'TechZone', 'Mua ngay', 'published', true, false, 0, now()),

  ('22222222-2222-2222-2222-222222220008',
   'Bình giữ nhiệt 750ml', 'binh-giu-nhiet-750ml',
   'Giữ nóng/lạnh 12 giờ.', 'Bình giữ nhiệt inox 304 dung tích 750ml, nắp chống rò rỉ.',
   'shopee', 'https://shopee.vn/product-example-8', 'https://shopee.vn/product-example-8',
   'https://picsum.photos/seed/bottle/800/800',
   199000, 320000, 'VND', 'HomeMart Official', 'Mua ngay', 'published', false, false, 0, now())
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- PRODUCT_CATEGORIES — gán sản phẩm vào danh mục
-- -----------------------------------------------------------------------------
insert into public.product_categories (product_id, category_id) values
  ('22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110001'), -- Nồi chiên -> Đồ gia dụng
  ('22222222-2222-2222-2222-222222220002', '11111111-1111-1111-1111-111111110002'), -- Áo khoác -> Thời trang
  ('22222222-2222-2222-2222-222222220003', '11111111-1111-1111-1111-111111110003'), -- Tai nghe -> Công nghệ
  ('22222222-2222-2222-2222-222222220004', '11111111-1111-1111-1111-111111110004'), -- Serum -> Làm đẹp
  ('22222222-2222-2222-2222-222222220005', '11111111-1111-1111-1111-111111110005'), -- Xe đẩy -> Mẹ & Bé
  ('22222222-2222-2222-2222-222222220006', '11111111-1111-1111-1111-111111110006'), -- Thảm yoga -> Thể thao
  ('22222222-2222-2222-2222-222222220007', '11111111-1111-1111-1111-111111110003'), -- Bàn phím -> Công nghệ
  ('22222222-2222-2222-2222-222222220008', '11111111-1111-1111-1111-111111110001')  -- Bình giữ nhiệt -> Đồ gia dụng
on conflict (product_id, category_id) do nothing;

-- -----------------------------------------------------------------------------
-- SOCIAL_POSTS — 2 bài draft (Instagram & Threads), có disclosure tiếp thị.
-- -----------------------------------------------------------------------------
insert into public.social_posts
  (id, product_id, platform, post_type, caption, target_url, status)
values
  ('33333333-3333-3333-3333-333333330001',
   '22222222-2222-2222-2222-222222220001',
   'instagram', 'link',
   'Nồi chiên không dầu 5L đang giảm sốc! Nấu nhanh, ít dầu, cả nhà mê. '
     || E'\n\nBài viết có chứa liên kết tiếp thị (affiliate) — mình có thể nhận hoa hồng khi bạn mua qua link.',
   'https://shopee.vn/product-example-1',
   'draft'),

  ('33333333-3333-3333-3333-333333330002',
   '22222222-2222-2222-2222-222222220003',
   'threads', 'link',
   'Tai nghe TWS chống ồn pin 30 giờ, giá quá hời cho anh em cần tập trung. '
     || E'\n\nBài viết có chứa liên kết tiếp thị (affiliate) — mình có thể nhận hoa hồng khi bạn mua qua link.',
   'https://tiktok.com/product-example-3',
   'draft')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- CLICK_EVENTS — dữ liệu demo cho dashboard analytics (local).
-- source đa dạng, created_at rải trong 7 ngày gần đây, ip_hash để NULL.
-- LƯU Ý: dùng gen_random_uuid() nên chạy lại file sẽ thêm dòng mới (không idempotent).
--        Chỉ dùng để xem thử biểu đồ ở local.
-- -----------------------------------------------------------------------------
insert into public.click_events (product_id, source, referrer, utm_source, utm_medium, utm_campaign, created_at) values
  ('22222222-2222-2222-2222-222222220001', 'website',   'https://google.com',       'google',    'organic', 'launch',  now() - interval '0 days'),
  ('22222222-2222-2222-2222-222222220001', 'bio',       null,                        'linktree',  'bio',     'bio',     now() - interval '1 days'),
  ('22222222-2222-2222-2222-222222220003', 'instagram', 'https://instagram.com',     'instagram', 'social',  'reels',   now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222220003', 'threads',   'https://threads.net',       'threads',   'social',  'post',    now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222220004', 'direct',    null,                        null,        null,      null,      now() - interval '3 days'),
  ('22222222-2222-2222-2222-222222220002', 'website',   'https://facebook.com',      'facebook',  'referral','sale',    now() - interval '4 days'),
  ('22222222-2222-2222-2222-222222220007', 'instagram', 'https://instagram.com',     'instagram', 'social',  'story',   now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222220005', 'bio',       null,                        'linktree',  'bio',     'bio',     now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222220006', 'direct',    null,                        null,        null,      null,      now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222220008', 'website',   'https://google.com',        'google',    'cpc',     'search',  now() - interval '7 days');
