"use strict";

// Điểm khởi động: chờ trang tải xong rồi mở luồng màn hình
// (Đăng nhập/Đăng ký -> Tạo nhân vật -> Game).
window.addEventListener("load", function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) {
    console.error("Không tìm thấy phần tử #game-canvas trong HTML.");
    return;
  }

  const screens = new ScreenManager(canvas);
  screens.begin();
});
