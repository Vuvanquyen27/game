-- =============================================================================
-- 0001_init.sql — Khởi tạo schema cho "Ezriso"
-- Postgres / Supabase. Comment bằng tiếng Việt.
-- Chạy được nhiều lần ở mức hợp lý (idempotent): dùng IF NOT EXISTS,
-- DO block cho ENUM, CREATE OR REPLACE FUNCTION.
-- =============================================================================

-- Bật extension pgcrypto để dùng gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- Bọc trong DO block kiểm tra tồn tại để không lỗi khi chạy lại migration.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'editor');
  end if;

  if not exists (select 1 from pg_type where typname = 'product_platform') then
    create type product_platform as enum ('shopee', 'lazada', 'tiktok_shop', 'amazon', 'custom');
  end if;

  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'category_status') then
    create type category_status as enum ('active', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'click_source') then
    create type click_source as enum ('website', 'instagram', 'threads', 'bio', 'direct');
  end if;

  if not exists (select 1 from pg_type where typname = 'social_platform') then
    create type social_platform as enum ('instagram', 'threads');
  end if;

  if not exists (select 1 from pg_type where typname = 'social_post_type') then
    create type social_post_type as enum ('text', 'image', 'link');
  end if;

  if not exists (select 1 from pg_type where typname = 'social_post_status') then
    create type social_post_status as enum ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- BẢNG: profiles
-- Hồ sơ người dùng, ánh xạ 1-1 với auth.users. role điều khiển phân quyền.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       user_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: products
-- Sản phẩm affiliate. slug unique để build URL đẹp. deleted_at = soft delete.
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  short_description text,
  description       text,
  platform          product_platform not null default 'custom',
  original_url      text,
  affiliate_url     text not null,
  image_url         text,
  price             numeric(14,2),
  original_price    numeric(14,2),
  currency          text not null default 'VND',
  seller_name       text,
  commission_note   text,
  copywriting       text,
  cta_text          text,
  status            product_status not null default 'draft',
  is_featured       boolean not null default false,
  show_on_bio       boolean not null default false,
  bio_order         integer not null default 0,
  published_at      timestamptz,
  deleted_at        timestamptz,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: product_images
-- Nhiều ảnh cho một sản phẩm. sort_order để sắp xếp gallery.
-- -----------------------------------------------------------------------------
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url   text not null,
  alt_text     text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: categories
-- Danh mục sản phẩm. slug unique.
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  status      category_status not null default 'active',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: product_categories (bảng nối nhiều-nhiều)
-- -----------------------------------------------------------------------------
create table if not exists public.product_categories (
  product_id  uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- -----------------------------------------------------------------------------
-- BẢNG: click_events
-- Ghi nhận click để làm analytics. product_id set null nếu sản phẩm bị xóa cứng.
-- -----------------------------------------------------------------------------
create table if not exists public.click_events (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products(id) on delete set null,
  source       click_source not null default 'direct',
  referrer     text,
  user_agent   text,
  ip_hash      text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  created_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: social_posts
-- Bài đăng mạng xã hội (Instagram / Threads) liên kết tới sản phẩm.
-- -----------------------------------------------------------------------------
create table if not exists public.social_posts (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid references public.products(id) on delete set null,
  platform         social_platform not null,
  post_type        social_post_type not null default 'link',
  caption          text not null,
  media_url        text,
  target_url       text,
  status           social_post_status not null default 'draft',
  scheduled_at     timestamptz,
  published_at     timestamptz,
  external_post_id text,
  publish_attempts integer not null default 0,
  last_error       text,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: site_settings
-- Cấu hình toàn site dạng key -> jsonb.
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: audit_logs
-- Nhật ký hành động (ghi bởi service role phía server).
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- BẢNG: rate_limits
-- Đếm số lần theo cửa sổ thời gian. UNIQUE để upsert.
-- -----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  id           uuid primary key default gen_random_uuid(),
  bucket       text not null,
  identifier   text not null,
  window_start timestamptz not null,
  count        integer not null default 0,
  unique (bucket, identifier, window_start)
);

-- -----------------------------------------------------------------------------
-- INDEX
-- -----------------------------------------------------------------------------
create index if not exists idx_products_slug        on public.products (slug);
create index if not exists idx_products_status      on public.products (status);
create index if not exists idx_products_platform    on public.products (platform);
create index if not exists idx_products_created_at  on public.products (created_at desc);
create index if not exists idx_products_show_on_bio on public.products (show_on_bio);
create index if not exists idx_products_is_featured on public.products (is_featured);

create index if not exists idx_click_events_product_id on public.click_events (product_id);
create index if not exists idx_click_events_created_at on public.click_events (created_at desc);
create index if not exists idx_click_events_source     on public.click_events (source);

create index if not exists idx_social_posts_status       on public.social_posts (status);
create index if not exists idx_social_posts_scheduled_at on public.social_posts (scheduled_at);

create index if not exists idx_product_categories_category_id on public.product_categories (category_id);

-- -----------------------------------------------------------------------------
-- TRIGGER: set_updated_at()
-- Tự động cập nhật cột updated_at mỗi khi UPDATE.
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Gắn trigger cho các bảng có cột updated_at.
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_social_posts_updated_at on public.social_posts;
create trigger trg_social_posts_updated_at
  before update on public.social_posts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- FUNCTION + TRIGGER: handle_new_user()
-- Khi có user mới trong auth.users -> tạo dòng tương ứng trong public.profiles.
-- LƯU Ý: Không đọc được biến môi trường (ADMIN_EMAIL) trong SQL, nên mọi user
--        mới đều nhận role mặc định 'editor'. Muốn promote admin thì chạy thủ công:
--        update public.profiles set role = 'admin' where email = 'you@example.com';
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- FUNCTION: increment_rate_limit()
-- Tăng bộ đếm rate limit theo (bucket, identifier, window_start), trả về count mới.
-- security definer để RPC từ client có thể gọi mà không cần policy trên bảng.
-- -----------------------------------------------------------------------------
create or replace function public.increment_rate_limit(
  p_bucket text,
  p_identifier text,
  p_window_start timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (bucket, identifier, window_start, count)
  values (p_bucket, p_identifier, p_window_start, 1)
  on conflict (bucket, identifier, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;

  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- HELPER FUNCTIONS cho RLS
-- security definer để đọc bảng profiles bất kể policy của người gọi.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_editor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;
