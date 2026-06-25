"use strict";

/**
 * Quản lý bàn phím: ghi nhớ phím nào ĐANG được giữ.
 * Dùng kiểu "đang giữ" (không phải "vừa nhấn") để di chuyển mượt khi giữ phím.
 */
class Input {
  constructor() {
    this._keys = new Set();

    window.addEventListener("keydown", (e) => {
      this._keys.add(e.code);
      // Chặn trình duyệt cuộn trang khi bấm phím mũi tên / Space.
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this._keys.delete(e.code);
    });
  }

  /** Phím (theo mã e.code, ví dụ "KeyW", "ArrowUp") có đang được giữ không? */
  isDown(code) {
    return this._keys.has(code);
  }
}
