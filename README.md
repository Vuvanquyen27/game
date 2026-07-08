# Ezriso

Nền tảng quản lý & chia sẻ sản phẩm affiliate: trang sản phẩm công khai, link
chuyển hướng an toàn `/go/[slug]`, khu quản trị (`/admin`), import CSV, và **Social
Content Manager** tự động đăng bài lên Instagram / Threads theo lịch.

## Công nghệ

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** + pattern **shadcn/ui** (Radix UI)
- **Supabase**: Postgres + Auth + Storage (RLS bật)
- **Zod** (validation) + **React Hook Form**
- **Vitest** + Testing Library (unit test)

## Scripts (`package.json`)

| Lệnh                   | Mô tả                                   |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Chạy server phát triển                  |
| `npm run build`        | Build production                        |
| `npm run start`        | Chạy bản đã build                       |
| `npm run lint`         | ESLint (`next lint`)                    |
| `npm run typecheck`    | Kiểm tra kiểu (`tsc --noEmit`)          |
| `npm run format`       | Prettier ghi đè (`--write`)             |
| `npm run format:check` | Prettier chỉ kiểm tra (`--check`)       |
| `npm run test`         | Chạy unit test một lần (`vitest run`)   |
| `npm run test:watch`   | Chạy test ở chế độ watch                |

## Cấu trúc thư mục (rút gọn)

```
src/
  app/            # App Router: trang công khai, /admin, /go/[slug], /api
  components/     # UI (shadcn/ui pattern) + component nghiệp vụ
  lib/
    slug.ts       # slugify, slugWithSuffix
    format.ts     # formatPrice, discountPercent, toNumber
    constants.ts  # enum nghiệp vụ dùng chung
    security/     # url, file (magic bytes), sanitize, ip, rate-limit
    social/       # caption, schedule, publish, instagram, threads
    import/       # parser & validate CSV
    auth/         # roles, session
    supabase/     # client browser/server/admin
supabase/
  migrations/
    0001_init.sql # bảng, index, RPC, function
    0002_rls.sql  # Row Level Security policies
  seed.sql        # dữ liệu demo (CHỈ dùng cho local)
tests/            # unit test (Vitest)
```

---

# Hướng dẫn cài đặt & triển khai (21 bước)

## 1. Yêu cầu hệ thống

- **Node.js 20+** (khuyến nghị LTS) và **npm**.
- Kiểm tra:

```bash
node -v   # >= 20
npm -v
```

## 2. Cài dependency

```bash
npm install
# Nếu gặp lỗi xung đột peer (do React 19), dùng:
npm install --legacy-peer-deps
```

> Ghi chú: một số gói chưa khai báo peer cho React 19. Cờ `--legacy-peer-deps`
> giúp npm bỏ qua kiểm tra peer nghiêm ngặt.

## 3. Tạo Supabase project

1. Vào <https://supabase.com> → **New project**.
2. Đặt tên, chọn region gần người dùng, đặt **Database password** (lưu lại).
3. Sau khi tạo xong, lấy trong **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server-only**)

## 4. Chạy migrations

**Cách A — SQL Editor (đơn giản):** mở **SQL Editor** trên dashboard, dán và
chạy theo đúng thứ tự:

1. Nội dung `supabase/migrations/0001_init.sql` (bảng, index, RPC, function).
2. Nội dung `supabase/migrations/0002_rls.sql` (RLS policies).

**Cách B — Supabase CLI:**

```bash
supabase db push
```

Với môi trường **local/dev**, nạp thêm dữ liệu mẫu:

```bash
# dán supabase/seed.sql vào SQL Editor, hoặc:
psql "$DATABASE_URL" -f supabase/seed.sql
```

> Migration tạo sẵn RPC `increment_rate_limit` và function `is_admin` /
> `is_editor` được dùng trong RLS policies.

## 5. Tạo Storage bucket `product-images`

1. Vào **Storage → New bucket**.
2. Tên: **`product-images`**, đặt **Public** (cho phép đọc công khai).
3. Ảnh được **upload qua service role** ở phía server (không phụ thuộc client),
   nên chỉ cần bật quyền **read** công khai; ghi do server đảm nhiệm.

## 6. Tạo admin user

1. **Authentication → Users → Add user**: nhập email + password.
2. Nâng quyền admin bằng SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@yourdomain.com';
```

> Hệ thống có 2 vai trò: `admin` (toàn quyền, quản lý tài khoản/cấu hình) và
> `editor` (quản lý sản phẩm & nội dung social).

## 7. Cấu hình `.env.local`

```bash
cp .env.example .env.local
```

Điền các giá trị. Sinh chuỗi bí mật ngẫu nhiên cho `IP_HASH_SALT` và
`CRON_SECRET`:

```bash
openssl rand -hex 32
# hoặc không có openssl:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Biến public** (nhúng vào client bundle — chỉ để giá trị an toàn):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_THREADS_URL`
- `NEXT_PUBLIC_INSTAGRAM_HANDLE`

**Biến server-only** (TUYỆT ĐỐI không để lộ ra client):

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `IP_HASH_SALT`
- `CRON_SECRET`
- `META_APP_ID`, `META_APP_SECRET`, `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`
- `THREADS_USER_ID`, `THREADS_ACCESS_TOKEN`

## 8. Chạy local

```bash
npm run dev
```

- Trang công khai: <http://localhost:3000>
- Đăng nhập quản trị: <http://localhost:3000/admin/login>

## 9. Lint

```bash
npm run lint
```

## 10. Typecheck

```bash
npm run typecheck
```

## 11. Test

```bash
npm run test
```

Các file test nằm trong `tests/` (Vitest, môi trường jsdom). Xem danh sách ở
cuối README.

## 12. Build

```bash
npm run build
```

## 13. Push lên GitHub

```bash
git init
git add .
git commit -m "Khởi tạo Ezriso"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

> `.env.local` đã nằm trong `.gitignore` — **không bao giờ commit** file này.

## 14. Import vào Vercel

1. Vào <https://vercel.com> → **Add New → Project**.
2. Chọn repo vừa push. Vercel tự nhận diện Next.js (không cần chỉnh build
   command).

## 15. Thêm env vars trên Vercel

Vào **Project → Settings → Environment Variables**, thêm đầy đủ:

**Public** (an toàn để lộ):

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_THREADS_URL
NEXT_PUBLIC_INSTAGRAM_HANDLE
```

**Server-only** (bí mật, chỉ dùng ở server/cron):

```
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
IP_HASH_SALT
CRON_SECRET
META_APP_ID
META_APP_SECRET
INSTAGRAM_USER_ID
INSTAGRAM_ACCESS_TOKEN
THREADS_USER_ID
THREADS_ACCESS_TOKEN
```

## 16. Deploy

Nhấn **Deploy**. Vercel sẽ build và cấp URL `*.vercel.app`.

## 17. Custom domain

1. **Project → Settings → Domains → Add** domain của bạn, cấu hình DNS theo
   hướng dẫn.
2. Cập nhật `NEXT_PUBLIC_SITE_URL` thành domain thật (vd
   `https://yourdomain.com`) rồi **redeploy** — biến này quyết định link `/go`
   và link chia sẻ.

## 18. Cấu hình Instagram API (tùy chọn)

1. Tạo **Meta App** tại <https://developers.facebook.com>.
2. Bật **Instagram Graph API**, liên kết tài khoản Instagram **Business/Creator**
   với một Facebook Page.
3. Lấy `INSTAGRAM_USER_ID` và **long-lived** `INSTAGRAM_ACCESS_TOKEN`, cấp quyền
   **`instagram_content_publish`**.
4. Điền `META_APP_ID`, `META_APP_SECRET`, `INSTAGRAM_USER_ID`,
   `INSTAGRAM_ACCESS_TOKEN`.

> Thiếu các biến này → app vẫn chạy ở **chế độ thủ công** (soạn caption, sao chép
> và đăng tay), không tự động publish.

## 19. Cấu hình Threads API (tùy chọn)

1. Bật **Threads API** trong Meta App.
2. Lấy `THREADS_USER_ID` và `THREADS_ACCESS_TOKEN`, điền vào env.

> Tương tự Instagram: thiếu token → chạy chế độ thủ công.

## 20. Cấu hình cron (tự động đăng theo lịch)

- File `vercel.json` khai báo lịch gọi endpoint đăng bài. Ví dụ:

```json
{
  "crons": [
    {
      "path": "/api/cron/social-publish",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

- Đặt biến `CRON_SECRET` trên Vercel. Vercel Cron gọi
  `/api/cron/social-publish` kèm header:

```
Authorization: Bearer <CRON_SECRET>
```

- Route kiểm tra header khớp `CRON_SECRET` rồi mới xử lý các bài **đã tới hạn**
  (`scheduled_at <= now`), thử lại tối đa **3 lần** trước khi chuyển trạng thái
  `failed`.

## 21. Lỗi thường gặp

| Triệu chứng                                  | Nguyên nhân & cách xử lý                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Trang chạy nhưng **không có dữ liệu**        | Thiếu env Supabase — app không crash nhưng không truy vấn được. Kiểm tra 3 biến Supabase. |
| **Upload ảnh lỗi**                           | Chưa tạo bucket `product-images` (bước 5) hoặc thiếu `SUPABASE_SERVICE_ROLE_KEY`.        |
| Bị chặn khi đọc/ghi (403 / empty)            | **RLS** chặn — kiểm tra `role` trong `public.profiles` và policy ở `0002_rls.sql`.       |
| `npm install` báo xung đột peer              | Chạy `npm install --legacy-peer-deps` (React 19).                                        |
| Link `/go/[slug]` sai domain                 | `NEXT_PUBLIC_SITE_URL` chưa đúng — cập nhật rồi redeploy (bước 17).                       |
| Cron không chạy / 401                        | `CRON_SECRET` chưa đặt hoặc header `Authorization` sai.                                   |

---

## Tắt seed demo khi production

- **KHÔNG** chạy `supabase/seed.sql` trên môi trường production. File seed chỉ
  dùng để tạo dữ liệu mẫu cho **local/dev**.
- Nếu lỡ chạy trên production, hãy dọn sạch dữ liệu demo trước khi go-live để
  tránh lẫn với dữ liệu thật.

## Bảo mật (tóm tắt)

- **Không commit `.env.local`** (đã có trong `.gitignore`).
- `SUPABASE_SERVICE_ROLE_KEY` và các access token (Instagram/Threads) **chỉ dùng
  ở server** (server routes / cron) — không bao giờ để prefix `NEXT_PUBLIC_`.
- **IP chỉ lưu ở dạng hash** (dùng `IP_HASH_SALT`), không lưu IP thô — phục vụ
  rate-limit mà vẫn tôn trọng quyền riêng tư.
- Redirect `/go/[slug]` chỉ cho phép **HTTPS tuyệt đối**, chặn scheme lạ,
  `localhost` và host nội bộ (chống open redirect / SSRF).
- Nội dung rich-text được **sanitize** (allowlist thẻ, loại bỏ `script`, handler
  `on*`, `href="javascript:"`) trước khi lưu/hiển thị.

---

## Danh sách file test (`tests/`)

| File                       | Đối tượng kiểm thử                                          |
| -------------------------- | ---------------------------------------------------------- |
| `tests/setup.ts`           | Setup Vitest (`@testing-library/jest-dom`)                 |
| `tests/slug.test.ts`       | `slugify`, `slugWithSuffix`                                |
| `tests/format.test.ts`     | `formatPrice`, `discountPercent`, `toNumber`               |
| `tests/url.test.ts`        | `isValidHttpUrl`, `isSafeRedirectUrl`, `normalizeAffiliateUrl` |
| `tests/caption.test.ts`    | `buildCaption`, `AFFILIATE_DISCLOSURE`                     |
| `tests/schedule.test.ts`   | `isPostDue`, `shouldRetry`, `nextStatusAfterFailure`       |
| `tests/csv.test.ts`        | `parseCsv`, `csvToRecords`, `validateImportRecords`, `SAMPLE_CSV` |
| `tests/roles.test.ts`      | `hasRole`, `canManageAccounts`, `canManageContent`         |
| `tests/file.test.ts`       | `detectImageType`, `extForMime`                            |
| `tests/sanitize.test.ts`   | `sanitizeHtml`, `stripHtml`, `truncate`                    |
| `tests/go-redirect.test.ts`| An toàn redirect `/go/[slug]` qua `isSafeRedirectUrl`      |

Chạy toàn bộ:

```bash
npm run test
```
