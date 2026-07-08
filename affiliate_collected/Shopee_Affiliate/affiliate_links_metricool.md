# Link Affiliate – Đợt Metricool (2026-07-07)

> Tài khoản Shopee Affiliate: **leanjmft63**
> Cách tạo: công cụ **Custom Link** trong Shopee Affiliate (Trang chủ → Hoa hồng → Custom Link) → dán tối đa 5 link → gắn Sub_id → "Lấy link".
> Trạng thái: ✅ **Đã tạo thật cả 5 link** (không có link nào ở trạng thái PENDING).
> ⚠️ KHÔNG công khai cookie/mật khẩu/API token ở bất kỳ file nào.

## 5 link đã tạo (Sub_id1 = facebook, Sub_id2 = metricool)

| # | Sản phẩm | Link gốc | Link affiliate | Sub_id |
|---|----------|----------|----------------|--------|
| 1 | Đèn học chống cận Tao1501 | https://shopee.vn/product/29647358/851143551 | https://s.shopee.vn/4Vb0amrtOA | facebook / metricool |
| 2 | Máy cắt lông xù SK-877 | https://shopee.vn/product/973419859/26869899852 | https://s.shopee.vn/4LHaOTsWj9 | facebook / metricool |
| 3 | Vòi sen tăng áp nano | https://shopee.vn/product/154604025/18209090551 | https://s.shopee.vn/qhiE35qpU | facebook / metricool |
| 4 | Giá đỡ laptop Macbox | https://shopee.vn/product/338344025/3566029986 | https://s.shopee.vn/gOI1k6UAT | facebook / metricool |
| 5 | Máy xay cầm tay Simplus ZZJH008 | https://shopee.vn/product/497364265/28413535505 | https://s.shopee.vn/1BKYcf4a9a | facebook / metricool |

## Về quy tắc đặt tên Sub_id

- Đề bài gợi ý Sub_id dạng `metricool_YYYYMMDD_slug_platform`. **Nhưng Shopee chỉ cho phép ký tự chữ và số (a-z, A-Z, 0-9)** trong ô Sub_id — không nhận dấu gạch dưới `_` hay gạch ngang `-`.
- Vì vậy Sub_id thực tế được rút gọn thành: **Sub_id1 = tên nền tảng** (vd `facebook`), **Sub_id2 = `metricool`** (đánh dấu chiến dịch). Cách này khớp với thói quen lọc báo cáo theo Sub_id của bạn hiện tại.
- Chuỗi định danh đầy đủ `metricool_20260707_<slug>_<platform>` vẫn được giữ làm **ghi chú tài liệu** để bạn dễ tra, không nhập nguyên văn vào Shopee.

## Cách tạo link riêng cho từng nền tảng (để đo click theo kênh)

Các link ở trên đang gắn `facebook`. Nếu muốn đo riêng TikTok / Instagram / Threads / Pinterest, tạo thêm bộ link mới (2–3 phút/nền tảng):

1. Vào **affiliate.shopee.vn → Custom Link** (đang đăng nhập leanjmft63).
2. Dán đúng 5 link gốc ở cột "Link gốc" bên trên (mỗi link 1 dòng).
3. Ô **Sub_id1** nhập tên nền tảng, chỉ chữ+số:
   - TikTok → `tiktok`
   - Instagram → `instagram`
   - Threads → `threads`
   - Pinterest → `pinterest`
4. Ô **Sub_id2** nhập `metricool`.
5. Bấm **Lấy link** → copy 5 link rút gọn `s.shopee.vn/...` → thay vào cột `affiliate_url` của các dòng nền tảng tương ứng trong `metricool_shopee_affiliate_schedule.csv`.

> Gợi ý: giữ nguyên link `facebook` cho các bài Facebook; chỉ thay link cho dòng TikTok/IG/Threads. Trong CSV, các dòng nền tảng khác Facebook đã có ghi chú nhắc việc này ở cột `notes`.

## Kiểm tra link (làm trước khi đăng)

- Cả 5 link do chính công cụ Shopee Affiliate sinh ra từ link sản phẩm hợp lệ (tiêu đề sản phẩm đã tải đúng khi mở link gốc) → hợp lệ về cấu trúc.
- **Không tự bấm nhiều lần vào link affiliate của chính mình** (Shopee có thể coi là click ảo/không hợp lệ). Muốn kiểm tra, mở bằng thiết bị khác hoặc nhờ người khác bấm 1 lần, xác nhận nó dẫn tới đúng trang sản phẩm.
- Trước mỗi lần đăng: kiểm tra lại **giá, tồn kho, voucher, phân loại** trên trang (giá Shopee đổi theo ngày/Flash Sale).
