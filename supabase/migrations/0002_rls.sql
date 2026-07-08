-- =============================================================================
-- 0002_rls.sql — Row Level Security cho "Ezriso"
-- Bật RLS cho toàn bộ bảng public và định nghĩa policy.
-- LƯU Ý QUAN TRỌNG: service role (dùng ở server route) BYPASS RLS hoàn toàn,
--   nên KHÔNG cần policy cho service role. Các policy dưới đây chỉ áp dụng cho
--   client anon / authenticated.
-- Dùng "drop policy if exists" trước "create policy" để chạy lại được nhiều lần.
-- =============================================================================

-- Bật RLS cho tất cả bảng public
alter table public.profiles           enable row level security;
alter table public.products           enable row level security;
alter table public.product_images     enable row level security;
alter table public.categories         enable row level security;
alter table public.product_categories enable row level security;
alter table public.click_events       enable row level security;
alter table public.social_posts       enable row level security;
alter table public.site_settings      enable row level security;
alter table public.audit_logs         enable row level security;
alter table public.rate_limits        enable row level security;

-- =============================================================================
-- profiles
-- - User đọc được hồ sơ của chính mình; admin đọc tất cả.
-- - User tự cập nhật full_name của mình; đổi role chỉ admin mới được.
-- - INSERT do trigger handle_new_user() (service role) đảm nhiệm -> không cần policy.
-- =============================================================================
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

-- User tự update hồ sơ của mình (dùng cho full_name).
-- Lưu ý: chặn user tự nâng quyền phải xử lý thêm ở tầng app hoặc bằng cột riêng;
-- ở đây admin có policy riêng bên dưới để update mọi hồ sơ (bao gồm role).
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin update mọi hồ sơ, kể cả đổi role.
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- products
-- - Public (anon + authenticated) chỉ xem sản phẩm đã published & chưa xóa mềm.
-- - Editor/Admin xem tất cả, thêm/sửa. Chỉ Admin được xóa cứng.
-- =============================================================================
drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products
  for select
  using (status = 'published' and deleted_at is null);

drop policy if exists products_select_editor on public.products;
create policy products_select_editor on public.products
  for select
  using (public.is_editor());

drop policy if exists products_insert_editor on public.products;
create policy products_insert_editor on public.products
  for insert
  with check (public.is_editor());

drop policy if exists products_update_editor on public.products;
create policy products_update_editor on public.products
  for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin on public.products
  for delete
  using (public.is_admin());

-- =============================================================================
-- product_images
-- - Public xem ảnh nếu sản phẩm cha đã published & chưa xóa mềm.
-- - Editor/Admin toàn quyền.
-- =============================================================================
drop policy if exists product_images_select_public on public.product_images;
create policy product_images_select_public on public.product_images
  for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status = 'published'
        and p.deleted_at is null
    )
  );

drop policy if exists product_images_select_editor on public.product_images;
create policy product_images_select_editor on public.product_images
  for select
  using (public.is_editor());

drop policy if exists product_images_insert_editor on public.product_images;
create policy product_images_insert_editor on public.product_images
  for insert
  with check (public.is_editor());

drop policy if exists product_images_update_editor on public.product_images;
create policy product_images_update_editor on public.product_images
  for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists product_images_delete_editor on public.product_images;
create policy product_images_delete_editor on public.product_images
  for delete
  using (public.is_editor());

-- =============================================================================
-- categories
-- - Public chỉ xem danh mục status='active'.
-- - Editor/Admin xem tất cả, thêm/sửa. Chỉ Admin được xóa.
-- =============================================================================
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories
  for select
  using (status = 'active');

drop policy if exists categories_select_editor on public.categories;
create policy categories_select_editor on public.categories
  for select
  using (public.is_editor());

drop policy if exists categories_insert_editor on public.categories;
create policy categories_insert_editor on public.categories
  for insert
  with check (public.is_editor());

drop policy if exists categories_update_editor on public.categories;
create policy categories_update_editor on public.categories
  for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists categories_delete_admin on public.categories;
create policy categories_delete_admin on public.categories
  for delete
  using (public.is_admin());

-- =============================================================================
-- product_categories (bảng nối)
-- - Public xem liên kết nếu sản phẩm cha đã published & chưa xóa mềm.
-- - Editor/Admin toàn quyền ghi.
-- =============================================================================
drop policy if exists product_categories_select_public on public.product_categories;
create policy product_categories_select_public on public.product_categories
  for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_categories.product_id
        and p.status = 'published'
        and p.deleted_at is null
    )
  );

drop policy if exists product_categories_select_editor on public.product_categories;
create policy product_categories_select_editor on public.product_categories
  for select
  using (public.is_editor());

drop policy if exists product_categories_insert_editor on public.product_categories;
create policy product_categories_insert_editor on public.product_categories
  for insert
  with check (public.is_editor());

drop policy if exists product_categories_update_editor on public.product_categories;
create policy product_categories_update_editor on public.product_categories
  for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists product_categories_delete_editor on public.product_categories;
create policy product_categories_delete_editor on public.product_categories
  for delete
  using (public.is_editor());

-- =============================================================================
-- click_events
-- - KHÔNG cho client (anon/authenticated) INSERT/UPDATE/DELETE trực tiếp.
--   Việc ghi click đi qua server route dùng service role (bypass RLS).
-- - Cho phép Editor/Admin SELECT để xem analytics trong dashboard.
-- =============================================================================
drop policy if exists click_events_select_editor on public.click_events;
create policy click_events_select_editor on public.click_events
  for select
  using (public.is_editor());
-- (Không tạo policy INSERT/UPDATE/DELETE cho client -> mọi ghi phải qua service role.)

-- =============================================================================
-- social_posts
-- - Mọi thao tác (SELECT/INSERT/UPDATE/DELETE) chỉ dành cho Editor/Admin.
-- =============================================================================
drop policy if exists social_posts_select_editor on public.social_posts;
create policy social_posts_select_editor on public.social_posts
  for select
  using (public.is_editor());

drop policy if exists social_posts_insert_editor on public.social_posts;
create policy social_posts_insert_editor on public.social_posts
  for insert
  with check (public.is_editor());

drop policy if exists social_posts_update_editor on public.social_posts;
create policy social_posts_update_editor on public.social_posts
  for update
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists social_posts_delete_editor on public.social_posts;
create policy social_posts_delete_editor on public.social_posts
  for delete
  using (public.is_editor());

-- =============================================================================
-- site_settings
-- - SELECT: Editor/Admin. (Để đơn giản chỉ cho is_editor SELECT. Nếu sau này
--   cần expose key công khai cho anon thì thêm policy riêng lọc theo key.)
-- - INSERT/UPDATE/DELETE: chỉ Admin.
-- =============================================================================
drop policy if exists site_settings_select_editor on public.site_settings;
create policy site_settings_select_editor on public.site_settings
  for select
  using (public.is_editor());

drop policy if exists site_settings_insert_admin on public.site_settings;
create policy site_settings_insert_admin on public.site_settings
  for insert
  with check (public.is_admin());

drop policy if exists site_settings_update_admin on public.site_settings;
create policy site_settings_update_admin on public.site_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists site_settings_delete_admin on public.site_settings;
create policy site_settings_delete_admin on public.site_settings
  for delete
  using (public.is_admin());

-- =============================================================================
-- audit_logs
-- - SELECT: chỉ Admin. Việc ghi log do server route (service role) thực hiện.
-- =============================================================================
drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs
  for select
  using (public.is_admin());

-- =============================================================================
-- rate_limits
-- - KHÔNG có policy nào cho client. Chỉ truy cập qua service role hoặc RPC
--   increment_rate_limit() (security definer). RLS bật nhưng bảng "khóa" với client.
-- =============================================================================
-- (Cố ý không tạo policy.)
