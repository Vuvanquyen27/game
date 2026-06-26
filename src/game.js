"use strict";

// === Cau hinh do phan giai noi bo (pixel art) ===
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

/**
 * Lop Game: vong lap game (fixed timestep) + dieu phoi cac he thong
 * (input, world/nong trai, player) va cap nhat HUD (DOM).
 */
class Game {
  constructor(canvas, character) {
    this.canvas = canvas;
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    // Nhan vat do nguoi choi tao (ten + mau trang phuc).
    this.character = character || { name: "Khach", outfitColor: "#ff7b00" };

    // Chi so nhan vat (HP/KI hien thi tren HUD; phuc vu Pha 3 chien dau sau nay).
    this.stats = { hp: 100, maxHp: 100, ki: 100, maxKi: 100, level: 1 };

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
      spritePath: this.character.sprite, // nhan vat nguoi choi da chon (undefined -> player.png)
    });

    // NPC hiep si dung trong nong trai (trang tri, chua tuong tac).
    // tint:false -> giu mau goc cua knight.png. Khong goi update -> dung yen.
    this.npc = new Player(48, 44, { spritePath: "sprites/knight.png", tint: false });
    this.npc.facing = "down";

    this.beans = 0;                 // so Dau Than da thu hoach
    this._faced = { c: 0, r: 0 };   // o dang nham toi (truoc mat nhan vat)

    // HUD (DOM) — cap nhat moi khung hinh.
    this.hud = new HUD(this);
    this.player.onReady = () => this.hud.drawPortrait();
    this.hud.drawPortrait();
    this.hud.say("HỆ THỐNG",
      "Chào mừng " + this.hud.label(this.character.name) +
      " đến Saiyan Valley! E: cuốc/gieo/thu hoạch, R: tưới nước, Shift: chạy.");

    this._loop = this._loop.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._loop);
    console.log("[Game] Vong lap da khoi dong.");
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

    // KI: chay (Shift) khi di chuyen thi tieu hao; dung lai thi hoi dan.
    if (this.player.isRunning && this.player.moving) {
      this.stats.ki = Math.max(0, this.stats.ki - 28 * dt);
    } else {
      this.stats.ki = Math.min(this.stats.maxKi, this.stats.ki + 16 * dt);
    }
  }

  /** Tinh o ngay truoc mat nhan vat (theo huong quay). */
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

  /** Xu ly canh tac: E = cuoc/gieo/thu hoach, R = tuoi. Bao ket qua qua hop thoai. */
  _handleFarming() {
    this._faced = this._facedTile();

    if (this.input.wasPressed("KeyE")) {
      const result = this.world.interact(this._faced.c, this._faced.r);
      if (result === "tilled") {
        this.hud.say("NÔNG TRẠI", "Đã cuốc đất thành ruộng trồng.");
      } else if (result === "planted") {
        this.hud.say("NÔNG TRẠI", "Đã gieo hạt Đậu Thần. Nhớ tưới nước (R)!");
      } else if (result === "harvested") {
        this.beans++;
        this.hud.say("NÔNG TRẠI", "Thu hoạch 1 Đậu Thần! Tổng: " + this.beans);
      }
    }

    if (this.input.wasPressed("KeyR")) {
      if (this.world.waterAt(this._faced.c, this._faced.r)) {
        this.hud.say("NÔNG TRẠI", "Đã tưới nước cho cây.");
      }
    }
  }

  render() {
    const ctx = this.ctx;

    // Ban do + cay trong.
    this.world.render(ctx);

    // O dang nham (noi cong cu tac dung).
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this._faced.c * TILE_SIZE + 0.5, this._faced.r * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    // Nhan vat + NPC: ve theo do sau (chan thap hon ve sau -> noi tren).
    const actors = [this.player, this.npc];
    actors.sort((a, b) => (a.y + a.height) - (b.y + b.height));
    for (const a of actors) a.render(ctx);

    // Cap nhat HUD (DOM) — thanh mau/KI, Dau Than, minimap...
    this.hud.update(this);
  }
}
