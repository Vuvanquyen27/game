# Threads Affiliate — Nhà Gọn Đồ Xinh (hướng dẫn vận hành)

Hệ thống triển khai tiếp thị liên kết Shopee trên **Threads**, ngách **đồ gia dụng nhỏ mà xịn**. Tái sử dụng 15 sản phẩm + link affiliate đã có từ các kênh trước (Facebook/Instagram/Pinterest). Tài khoản affiliate: `leanjmft63`.

## Các file trong thư mục
| File | Dùng để làm gì |
|------|----------------|
| `products.csv` | Danh sách 15 sản phẩm + link affiliate + đủ trường (giá, đánh giá, vấn đề giải quyết, góc nội dung...). Cột `Chon_test_Threads` = CO là 5 món đang test. |
| `content_calendar.md` | Lịch 7 ngày, ≥2 bài/ngày: hook + thân bài + CTA + comment #1 có link + gợi ý phản hồi + trạng thái. |
| `comment_opportunities.md` | Cách đi bình luận bài người khác + 20 mẫu bình luận tương tác KHÔNG link + bảng theo dõi cơ hội. |
| `reply_templates.md` | 10 mẫu trả lời CÓ link (chỉ dùng khi người ta hỏi) + bảng tra link nhanh. |
| `performance.csv` | Theo dõi hiệu suất từng bài: view, like, comment, click, đơn, hoa hồng, tỷ lệ nhấp. |
| `posted_content_archive.md` | Kho lưu bài + comment đã đăng để tránh lặp. |

## Quy trình đăng 1 bài (thủ công — Threads chưa có API đăng chính thức ở đây)
1. Mở `content_calendar.md`, chọn bài trạng thái **Approved**.
2. **Kiểm tra link:** bấm thử link trong comment #1, xác nhận mở đúng sản phẩm + giá còn hợp lý (Shopee đổi giá theo ngày). KHÔNG tự bấm link của mình nhiều lần (tránh invalid traffic).
3. Copy phần **BÀI VIẾT** → đăng lên Threads.
4. Trong 1–2 phút, **self-reply** (trả lời chính bài mình) bằng phần **COMMENT #1** có link.
5. Rep hết bình luận trong 1 giờ đầu (rất quan trọng cho reach Threads).
6. Cuối ngày: điền số vào `performance.csv`, chép bài + comment vào `posted_content_archive.md`, đổi trạng thái trong calendar sang **Posted** + dán link bài.

## Quy trình duyệt nội dung (giai đoạn đầu)
- Toàn bộ bài đang ở trạng thái **Draft**. Đọc lại, chỉnh giọng cho hợp bạn, rồi đổi sang **Approved** trước khi đăng.
- Không đăng dồn nhiều bài cùng lúc; rải ra theo khung giờ trong calendar.

## Quy tắc nội dung & tuân thủ (BẮT BUỘC)
- **Chưa trực tiếp dùng sản phẩm** → viết theo góc "nêu vấn đề thật + phát hiện/đang cân nhắc + hỏi cộng đồng review", KHÔNG bịa "đã dùng X tuần", KHÔNG dùng đánh giá giả.
- Không claim tuyệt đối / chữa bệnh / hiệu quả chắc chắn.
- Luôn **minh bạch hoa hồng** ở comment chứa link ("mình có nhận hoa hồng tiếp thị từ Shopee...").
- Không để link trong thân bài — chỉ ở comment #1.
- Chỉ gắn link món thật sự đáng tin (shop ≥4.8, bán nhiều) để giữ uy tín.
- Không rải link vào bài không liên quan / nhạy cảm / tin buồn.
- Không đăng lặp cùng một nội dung/bình luận hàng loạt.

## Cập nhật link / sản phẩm
- Link sống ở `products.csv` và `reply_templates.md`. Khi có link mới hoặc hết ưu đãi, cập nhật ở cả hai chỗ.
- Không sửa cấu trúc link `s.shopee.vn/...` (mất ghi nhận hoa hồng).
- Các trường ghi `CAN KIEM TRA` trong `products.csv`: điền khi vào dashboard affiliate xác nhận (giá, % hoa hồng, tên shop). Không ghi giá/khuyến mãi cố định lên bài nếu chưa kiểm tra tại thời điểm đăng.

## Nhịp triển khai đề xuất (mục 7)
- Mỗi ngày: 2 bài chính + (khi cần tăng tương tác) 1 bài hỏi/quan điểm không bán.
- 5–10 bình luận có giá trị trên bài người khác (phần lớn KHÔNG link).
- Mỗi bài quảng bá chỉ 1 link chính; không đăng liên tiếp cùng một sản phẩm.

## Tối ưu sau 7 ngày (mục 12)
Mở `performance.csv`, xét theo thứ tự ưu tiên: **click → đơn → hoa hồng → bình luận hỏi thêm → tỷ lệ chuyển đổi** (đừng chỉ nhìn like). Với mỗi bài/sản phẩm: giữ lại / viết biến thể / đổi sản phẩm / đổi CTA / dừng. Bài có click mà không ra đơn → xem lại sản phẩm hoặc giá.

---
_Sao lưu bản gốc trước khi làm Threads: `../_backup_20260707_truoc_threads/`._
