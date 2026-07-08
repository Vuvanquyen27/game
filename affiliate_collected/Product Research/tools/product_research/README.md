# tools/product_research

Toolchain nghiên cứu sản phẩm được quan tâm trên **Shopee.vn** và **Lazada.vn** (thị trường Việt Nam),
xuất ra báo cáo Markdown + dữ liệu JSON.

## Kết quả đầu ra
- `../../product_research.md` — báo cáo tiếng Việt đầy đủ (8 phần).
- `../../product_research_data.json` — dữ liệu có cấu trúc (đã chấm điểm).

## Cách chạy
```bash
cd tools/product_research
node generate.js
```
(Node.js >= 18, không cần cài dependency.)

## Cấu trúc
- `data.js` — dữ liệu sản phẩm ĐÃ XÁC MINH (verified fields) + nội dung copywriting viết mới.
- `scoring.js` — công thức Popularity Score (0–100) & Confidence Score.
- `collectors.js` — tài liệu hoá phương pháp + các hàm trích xuất DOM đã dùng.
- `generate.js` — đọc data + chấm điểm → xuất `.md` và `.json`.
- `requirements.txt` — ghi chú môi trường.

## Phương pháp thu thập (quan trọng)
Dữ liệu được thu thập **thủ công qua trình duyệt Chrome thật** (Claude in Chrome MCP), đọc đúng
những gì một người dùng bình thường thấy trên trang **tìm kiếm/chi tiết công khai**.

Nguyên tắc đã tuân thủ:
- KHÔNG vượt đăng nhập, CAPTCHA, hay cơ chế chống bot.
- KHÔNG dùng API nội bộ, cookie/token không được cấp.
- Nghỉ giữa các lần mở trang; không tải lại trang không cần thiết.
- **KHÔNG bịa số liệu.** Trường không truy cập được ghi `null` / "Không công khai".

## Cách chấm điểm (tóm tắt)
Popularity Score tổng hợp các tín hiệu công khai: lượt bán (30) + số đánh giá (25) +
điểm sao (10) + thứ hạng theo lượt bán trên trang 1 (15) + giảm giá hợp lý (5) +
gian hàng uy tín (5) + độ phủ từ khóa (10). Lượt bán & số đánh giá được **chuẩn hoá log**.
Nếu một tín hiệu thiếu, trọng số được **tái phân bổ** cho các tín hiệu còn lại và **hạ Confidence**.

- `Cao`: có đủ lượt bán + số đánh giá + điểm sao + URL (chủ yếu là sản phẩm Lazada đã mở trang chi tiết).
- `Trung bình`: đủ ≥2 tín hiệu mạnh nhưng thiếu 1 (sản phẩm Shopee — không có số lượng đánh giá công khai trên trang tìm kiếm).
- `Thấp`: chủ yếu dựa trên thứ hạng/snippet.

## Giới hạn đã biết
- Shopee không hiển thị **số lượng đánh giá** trên thẻ tìm kiếm → `review_count = null`.
- Lượt bán Shopee theo **mốc** ("10k+","2k+"), không phải số chính xác.
- Điểm sao Lazada chỉ có ở **trang chi tiết** (đã mở 6 trang để lấy cho các sản phẩm được chọn).
- Ưu tiên **"ít nhưng thật"**: 13 sản phẩm có dữ liệu xác minh, thay vì cố gán đủ 30.
