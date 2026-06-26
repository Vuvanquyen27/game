"use strict";

/**
 * Quản lý bàn phím.
 * - isDown(code): phím ĐANG được giữ (dùng cho di chuyển).
 * - wasPressed(code): phím VỪA được nhấn (1 lần/lần nhấn) — dùng cho hành động đơn: cuốc, gieo, tưới...
 */
class Input {
  constructor() {
    this._keys = new Set();        // đang giữ
    this._justPressed = new Set(); // vừa nhấn (chưa tiêu thụ)

    window.addEventListener("keydown", (e) => {
      if (!e.repeat) this._justPressed.add(e.code); // bỏ auto-repeat, chỉ tính lần nhấn đầu
      this._keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this._keys.delete(e.code);
    });
  }

  isDown(code) {
    return this._keys.has(code);
  }

  /** Trả true đúng MỘT lần cho mỗi lần nhấn (tiêu thụ sự kiện). */
  wasPressed(code) {
    if (this._justPressed.has(code)) {
      this._justPressed.delete(code);
      return true;
    }
    return false;
  }
}
