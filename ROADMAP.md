# LỘ TRÌNH PHÁT TRIỂN: PROJECT SAIYAN VALLEY

## Mục tiêu
Kết hợp tính năng trồng trọt của Stardew Valley và hệ thống chỉ số/chiến đấu của Ngọc Rồng Online. Đồ họa 2D Pixel.

## Công nghệ
- Ngôn ngữ / Engine: **HTML5 Canvas + JavaScript thuần** (prototype core loop, chạy thẳng trên trình duyệt, không cần cài đặt). Có thể port sang Unity sau khi vòng lặp lõi đã "vui".
- Chạy thử: mở `index.html` bằng trình duyệt (double-click).

## Quy tắc làm việc cho AI
1. LUÔN LUÔN làm từng bước một. Không nhảy cóc.
2. Sau khi hoàn thành một bước nhỏ, phải chạy thử (test) để đảm bảo không có lỗi rồi mới tích `[x]` vào checklist.
3. Không tự ý viết thêm tính năng nằm ngoài danh sách khi chưa được User cho phép.

---

## DANH SÁCH TÍNH NĂNG (TODO LIST)

### 📌 PHA 1: KHỞI TẠO CƠ BẢN (MVP)
- [x] 1.1. Cài đặt môi trường game cơ bản (Tạo màn hình game, vòng lặp game loop).
- [ ] 1.2. Vẽ nhân vật bằng một hình khối đơn giản (hoặc sprite pixel thô) và làm tính năng di chuyển 4 hướng (Up, Down, Left, Right).
- [ ] 1.3. Tạo bản đồ nền cơ bản (Tilemap đơn giản gồm đất cỏ và đất cày).

### 📌 PHA 2: HỆ THỐNG NÔNG TRẠI (KIỂU STARDEW)
- [ ] 2.1. Tính năng cuốc đất (Sử dụng phím tương tác để chuyển ô cỏ thành ô đất trồng).
- [ ] 2.2. Tính năng gieo hạt và tưới nước (Hạt giống đậu thần).
- [ ] 2.3. Hệ thống thời gian/phát triển (Hạt giống lớn lên sau vài giây hoặc khi qua ngày mới).
- [ ] 2.4. Thu hoạch nông sản (Thu hoạch ra Đậu Thần).

### 📌 PHA 3: HỆ THỐNG SỨC MẠNH & CHIẾN ĐẤU (KIỂU NGỌC RỒNG)
- [ ] 3.1. Thêm thanh chỉ số hiển thị: HP, KI, SỨC ĐÁNH, và TIỀM NĂNG (Sức mạnh).
- [ ] 3.2. Tính năng ăn Đậu Thần thu hoạch được -> Tăng Sức Mạnh và Tiềm Năng.
- [ ] 3.3. Thêm kỹ năng đấm cơ bản (Đấm văng ra hiệu ứng chưởng lực nhẹ).
- [ ] 3.4. Thêm Quái vật bia tập bắn (Mộc nhân / Thần thạch) để đấm -> Đấm quái rơi ra Tiềm năng.

### 📌 PHA 4: GẮN KẾT VÒNG LẶP & ĐỘT PHÁ
- [ ] 4.1. Hệ thống "Đột phá" cảnh giới (Khi đủ Tiềm Năng, nhấn nút đổi màu tóc/hào quang, tăng Sức Đánh).
- [ ] 4.2. Dùng Sức Đánh cao hơn để khai phá những mảnh đất đá cứng hơn (Mở rộng nông trại).
