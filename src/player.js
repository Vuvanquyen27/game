"use strict";

/**
 * Nhân vật người chơi: giữ vị trí, tốc độ, hướng quay; tự cập nhật & tự vẽ.
 * Di chuyển bằng WASD hoặc phím mũi tên.
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 16;
    this.speed = 80;       // pixel / giây
    this.facing = "down";  // hướng quay: up / down / left / right (dùng cho animation sau)
  }

  /** Cập nhật vị trí theo input. dt = giây. */
  update(dt, input) {
    let dx = 0;
    let dy = 0;

    // Gom input từ WASD và phím mũi tên.
    if (input.isDown("ArrowUp")    || input.isDown("KeyW")) dy -= 1;
    if (input.isDown("ArrowDown")  || input.isDown("KeyS")) dy += 1;
    if (input.isDown("ArrowLeft")  || input.isDown("KeyA")) dx -= 1;
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) dx += 1;

    // Cập nhật hướng quay (ưu tiên trục ngang để chọn mắt nhìn trái/phải).
    if (dx < 0) this.facing = "left";
    else if (dx > 0) this.facing = "right";
    else if (dy < 0) this.facing = "up";
    else if (dy > 0) this.facing = "down";

    // Chuẩn hoá khi đi chéo để KHÔNG nhanh hơn đi thẳng.
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Tạm giữ nhân vật trong màn hình (đến khi có va chạm bản đồ thật ở bước sau).
    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));
  }

  /** Vẽ nhân vật bằng vài khối pixel đơn giản (kiểu Saiyan: tóc đen, áo cam). */
  render(ctx) {
    const px = Math.round(this.x);
    const py = Math.round(this.y);

    // Thân (áo cam)
    ctx.fillStyle = "#ff7b00";
    ctx.fillRect(px, py + 6, this.width, this.height - 6);

    // Đầu (màu da)
    ctx.fillStyle = "#ffd9a0";
    ctx.fillRect(px + 2, py + 1, this.width - 4, 7);

    // Tóc (đen) — gợi ý kiểu Saiyan
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(px + 1, py - 2, this.width - 2, 4);

    // Mắt: di chuyển theo hướng quay cho dễ nhận biết facing.
    ctx.fillStyle = "#000000";
    let ex = px + this.width / 2 - 1;
    const ey = py + 4;
    if (this.facing === "left") ex = px + 2;
    else if (this.facing === "right") ex = px + this.width - 4;
    ctx.fillRect(Math.round(ex), ey, 2, 2);
  }
}
