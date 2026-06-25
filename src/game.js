"use strict";

// === Cấu hình độ phân giải nội bộ (pixel art) ===
// Canvas vẽ ở độ phân giải nhỏ này, rồi CSS phóng to -> giữ phong cách pixel.
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

/**
 * Lớp Game: quản lý VÒNG LẶP GAME (game loop) với bước thời gian cố định (fixed timestep).
 * Fixed timestep giúp logic chạy ổn định, không phụ thuộc máy nhanh hay chậm.
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false; // không làm mờ pixel khi phóng to

    // --- Cấu hình vòng lặp ---
    this.fixedDelta = 1 / 60;  // mỗi bước logic = 1/60 giây
    this._accumulator = 0;
    this._lastTime = 0;
    this._running = false;

    // --- FPS để debug ---
    this._fps = 0;
    this._frameCount = 0;
    this._fpsTimer = 0;

    // --- Các hệ thống của game ---
    this.input = new Input();
    this.player = new Player(GAME_WIDTH / 2 - 6, GAME_HEIGHT / 2 - 8); // spawn giữa màn

    this._loop = this._loop.bind(this);
  }

  /** Bắt đầu vòng lặp. */
  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._loop);
    console.log("[Game] Vòng lặp đã khởi động.");
  }

  /** Dừng vòng lặp. */
  stop() {
    this._running = false;
  }

  /** Vòng lặp chính — trình duyệt tự gọi mỗi khung hình. */
  _loop(now) {
    if (!this._running) return;

    let frameTime = (now - this._lastTime) / 1000; // ms -> giây
    this._lastTime = now;
    if (frameTime > 0.25) frameTime = 0.25; // chặn nhảy vọt khi tab bị treo/ẩn

    // Cập nhật logic theo bước CỐ ĐỊNH (có thể chạy nhiều lần trong 1 khung hình).
    this._accumulator += frameTime;
    while (this._accumulator >= this.fixedDelta) {
      this.update(this.fixedDelta);
      this._accumulator -= this.fixedDelta;
    }

    this.render();

    // Đếm FPS mỗi giây.
    this._frameCount++;
    this._fpsTimer += frameTime;
    if (this._fpsTimer >= 1) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer -= 1;
    }

    requestAnimationFrame(this._loop);
  }

  /** === LOGIC === Cập nhật trạng thái game. dt tính bằng giây. */
  update(dt) {
    this.player.update(dt, this.input);
  }

  /** === VẼ === Render khung hình hiện tại. */
  render() {
    const ctx = this.ctx;

    // Nền cỏ xanh (tạm — bước 1.3 sẽ thay bằng Tilemap thật).
    ctx.fillStyle = "#3a5a40";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Vẽ nhân vật.
    this.player.render(ctx);

    // FPS góc trên (debug).
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px monospace";
    ctx.fillText("FPS:" + this._fps, 4, 10);
  }
}
