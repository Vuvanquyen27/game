"use strict";

// Điểm khởi động: chờ trang tải xong rồi tạo & chạy Game.
window.addEventListener("load", function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) {
    console.error("Không tìm thấy phần tử #game-canvas trong HTML.");
    return;
  }

  const game = new Game(canvas);
  game.start();
});
