"use strict";

/**
 * Nhân vật người chơi.
 * - Ưu tiên vẽ ẢNH (assets/player.png). Chưa có ảnh thì vẽ khối pixel tạm (không lỗi).
 * - Di chuyển có gia tốc (mượt), chạy nhanh (Shift), hoạt ảnh nhún khi đi, facing 4 hướng.
 */
class Player {
  /**
   * @param {number} x
   * @param {number} y
   * @param {{spritePath?: string}} [options]
   *        spritePath : đường dẫn ảnh (mặc định sprites/player.png)
   */
  constructor(x, y, options) {
    options = options || {};
    this.x = x;
    this.y = y;
    this.width = 12;   // hộp va chạm (logic), không phải kích thước ảnh
    this.height = 16;

    // --- Tốc độ & gia tốc ---
    this.walkSpeed = 70;   // px/giây khi đi thường
    this.runSpeed = 130;   // px/giây khi giữ Shift
    this.accel = 600;      // px/giây^2 khi tăng tốc
    this.decel = 800;      // px/giây^2 khi nhả phím (dừng dần)

    // --- Trạng thái chuyển động ---
    this.vx = 0;
    this.vy = 0;
    this.facing = "down";  // up / down / left / right
    this.isRunning = false;

    // --- Hoạt ảnh ---
    this.moving = false;
    this._animTimer = 0;
    this.animFrame = 0;    // 0..3

    // --- Ảnh nhân vật ---
    // Tự nạp ảnh; nạp xong thì spriteLoaded = true. Lỗi/chưa có -> vẽ khối tạm.
    this.sprite = new Image();
    this.spriteLoaded = false;
    this.onReady = null;          // callback khi nạp ảnh xong (cho khung xem trước)
    this.sprite.onload = () => {
      this.spriteLoaded = true;
      if (this.onReady) this.onReady();
    };
    this.sprite.onerror = () => { this.spriteLoaded = false; };
    this._spritePath = options.spritePath || "sprites/player.png";
    this.sprite.src = this._spritePath;
  }

  /** Đổi sprite nhân vật lúc đang chạy (dùng ở màn chọn nhân vật). */
  setSprite(path) {
    if (path === this._spritePath) { // cùng ảnh -> không nạp lại (tránh onload không kích hoạt lại)
      if (this.onReady) this.onReady();
      return;
    }
    this._spritePath = path;
    this.spriteLoaded = false;
    this.sprite.src = path; // onload đã gắn ở constructor -> tự gọi onReady
  }

  /** Đưa giá trị current tiến dần về target, mỗi lần tối đa maxDelta. */
  static approach(current, target, maxDelta) {
    if (current < target) return Math.min(current + maxDelta, target);
    if (current > target) return Math.max(current - maxDelta, target);
    return target;
  }

  update(dt, input) {
    // 1) Đọc hướng input (WASD + mũi tên).
    let ix = 0, iy = 0;
    if (input.isDown("ArrowUp")    || input.isDown("KeyW")) iy -= 1;
    if (input.isDown("ArrowDown")  || input.isDown("KeyS")) iy += 1;
    if (input.isDown("ArrowLeft")  || input.isDown("KeyA")) ix -= 1;
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) ix += 1;

    // Chuẩn hoá hướng (đi chéo không nhanh hơn).
    let dirX = 0, dirY = 0;
    const len = Math.hypot(ix, iy);
    if (len > 0) { dirX = ix / len; dirY = iy / len; }

    // 2) Hướng quay (giữ nguyên khi đứng yên).
    if (ix < 0) this.facing = "left";
    else if (ix > 0) this.facing = "right";
    else if (iy < 0) this.facing = "up";
    else if (iy > 0) this.facing = "down";

    // 3) Chạy nhanh khi giữ Shift.
    this.isRunning = input.isDown("ShiftLeft") || input.isDown("ShiftRight");
    const maxSpeed = this.isRunning ? this.runSpeed : this.walkSpeed;

    // 4) Gia tốc: vận tốc tiến dần về vận tốc mong muốn.
    const targetVx = dirX * maxSpeed;
    const targetVy = dirY * maxSpeed;
    const rate = (len > 0 ? this.accel : this.decel) * dt;
    this.vx = Player.approach(this.vx, targetVx, rate);
    this.vy = Player.approach(this.vy, targetVy, rate);

    // 5) Di chuyển. Giữ trong biên / chuyển sang khu kế (đi quá mép) do Game xử lý.
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 6) Hoạt ảnh đi bộ.
    this.moving = (Math.abs(this.vx) + Math.abs(this.vy)) > 5;
    if (this.moving) {
      this._animTimer += dt * (this.isRunning ? 12 : 8);
      this.animFrame = Math.floor(this._animTimer) % 4;
    } else {
      this._animTimer = 0;
      this.animFrame = 0;
    }
  }

  render(ctx) {
    // Nhún 1px ở khung 1 & 3 khi đang đi.
    const bob = (this.moving && (this.animFrame === 1 || this.animFrame === 3)) ? -1 : 0;

    // Bóng đổ dưới chân (tạo chiều sâu) — vẽ trước thân, không nhún theo.
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(Math.round(this.x) + 2, Math.round(this.y) + this.height - 2, this.width - 4, 2);

    // Có ảnh -> vẽ ảnh (đã tô màu trang phục); chưa có -> vẽ khối pixel tạm.
    if (this.spriteLoaded) {
      const img = this.sprite;
      const iw = img.width;
      const ih = img.height;
      // Căn giữa ngang theo hộp va chạm; đáy ảnh = đáy hộp (chân chạm đất).
      const dx = Math.round(this.x + this.width / 2 - iw / 2);
      const dy = Math.round(this.y + this.height - ih) + bob;

      if (this.facing === "left") {
        // Lật ngang khi quay trái (giả định ảnh gốc nhìn phải/chính diện).
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(img, -dx - iw, dy);
        ctx.restore();
      } else {
        ctx.drawImage(img, dx, dy);
      }
      return;
    }

    this._renderBlock(ctx, bob);
  }

  /** Vẽ khối pixel tạm (khi chưa có ảnh). */
  _renderBlock(ctx, bob) {
    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const topY = py + bob;

    // Chân (đi bộ: 2 chân thay nhau bước)
    ctx.fillStyle = "#3a2a1a";
    const step = this.moving ? (this.animFrame % 2) : 0;
    ctx.fillRect(px + 2, py + 13 + (step === 0 ? 0 : 1), 3, 3);
    ctx.fillRect(px + this.width - 5, py + 13 + (step === 1 ? 0 : 1), 3, 3);

    // Thân (áo màu cam mặc định cho khối tạm)
    ctx.fillStyle = "#ff7b00";
    ctx.fillRect(px, topY + 8, this.width, 5);

    // Đầu (màu da)
    ctx.fillStyle = "#ffd9a0";
    ctx.fillRect(px + 2, topY + 1, this.width - 4, 7);

    // Tóc & mắt theo hướng quay
    ctx.fillStyle = "#1a1a1a";
    if (this.facing === "up") {
      ctx.fillRect(px + 1, topY - 2, this.width - 2, 8); // quay lưng: tóc che kín
    } else {
      ctx.fillRect(px + 1, topY - 2, this.width - 2, 4);
      ctx.fillStyle = "#000000";
      const ey = topY + 4;
      if (this.facing === "down") {
        ctx.fillRect(px + 3, ey, 2, 2);
        ctx.fillRect(px + this.width - 5, ey, 2, 2);
      } else if (this.facing === "left") {
        ctx.fillRect(px + 2, ey, 2, 2);
      } else if (this.facing === "right") {
        ctx.fillRect(px + this.width - 4, ey, 2, 2);
      }
    }
  }
}
