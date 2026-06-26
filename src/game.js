"use strict";

// === Cấu hình độ phân giải nội bộ (pixel art) ===
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

/**
 * Lớp Game: vòng lặp game (fixed timestep) + điều phối các hệ thống
 * (input, world/nông trại, player).
 */
class Game {
  constructor(canvas, character) {
    this.canvas = canvas;
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    // Nhân vật do người chơi tạo ở màn "Tạo nhân vật" (tên + màu trang phục).
    this.character = character || { name: "Khach", outfitColor: "#ff7b00" };

    this.fixedDelta = 1 / 60;
    this._accumulator = 0;
    this._lastTime = 0;
    this._running = false;

    this._fps = 0;
    this._frameCount = 0;
    this._fpsTimer = 0;

    this.input = new Input();
    this.world = new World();
    this.player = new Player(GAME_WIDTH / 2 - 6, GAME_HEIGHT / 2 - 8, {
      outfitColor: this.character.outfitColor,
    });

    this.beans = 0;                 // số Đậu Thần đã thu hoạch
    this._faced = { c: 0, r: 0 };   // ô đang nhắm tới (trước mặt nhân vật)

    this._loop = this._loop.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._loop);
    console.log("[Game] Vòng lặp đã khởi động.");
  }

  stop() { this._running = false; }

  _loop(now) {
    if (!this._running) return;

    let frameTime = (now - this._lastTime) / 1000;
    this._lastTime = now;
    if (frameTime > 0.25) frameTime = 0.25;

    this._accumulator += frameTime;
    while (this._accumulator >= this.fixedDelta) {
      this.update(this.fixedDelta);
      this._accumulator -= this.fixedDelta;
    }

    this.render();

    this._frameCount++;
    this._fpsTimer += frameTime;
    if (this._fpsTimer >= 1) {
      this._fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer -= 1;
    }

    requestAnimationFrame(this._loop);
  }

  update(dt) {
    this.player.update(dt, this.input);
    this.world.update(dt);
    this._handleFarming();
  }

  /** Tính ô ngay trước mặt nhân vật (theo hướng quay). */
  _facedTile() {
    const p = this.player;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    let dc = 0, dr = 0;
    if (p.facing === "up") dr = -1;
    else if (p.facing === "down") dr = 1;
    else if (p.facing === "left") dc = -1;
    else if (p.facing === "right") dc = 1;
    return { c: Math.floor(cx / TILE_SIZE) + dc, r: Math.floor(cy / TILE_SIZE) + dr };
  }

  /** Xử lý canh tác: E = cuốc/gieo/thu hoạch, R = tưới. */
  _handleFarming() {
    this._faced = this._facedTile();

    if (this.input.wasPressed("KeyE")) {
      const result = this.world.interact(this._faced.c, this._faced.r);
      if (result === "harvested") {
        this.beans++;
        console.log("[Game] Thu hoach Dau Than! Tong:", this.beans);
      }
    }

    if (this.input.wasPressed("KeyR")) {
      this.world.waterAt(this._faced.c, this._faced.r);
    }
  }

  render() {
    const ctx = this.ctx;

    // Bản đồ + cây trồng.
    this.world.render(ctx);

    // Ô đang nhắm (nơi công cụ tác dụng).
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this._faced.c * TILE_SIZE + 0.5, this._faced.r * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    // Nhân vật.
    this.player.render(ctx);

    // HUD (dùng chữ không dấu cho dễ đọc ở cỡ 8px).
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px monospace";
    ctx.fillText("NV: " + this.character.name, 4, 10);
    ctx.fillText("Dau Than: " + this.beans, 4, 20);
    ctx.fillText("FPS:" + this._fps, GAME_WIDTH - 40, 10);
    ctx.fillText("E: cuoc/gieo/thu hoach   R: tuoi nuoc", 4, GAME_HEIGHT - 5);
  }
}
