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

    // Nhan vat do nguoi choi tao (ten + sprite da chon).
    this.character = character || { name: "Khach" };

    // Chi so nhan vat. power = Suc Danh, potential = Tiem Nang (an Dau Than de tang).
    this.stats = {
      hp: 100, maxHp: 100, ki: 100, maxKi: 100,
      level: 1, power: 10, potential: 0, potentialMax: 5,
    };

    this.fixedDelta = 1 / 60;
    this._accumulator = 0;
    this._lastTime = 0;
    this._running = false;

    this._fps = 0;
    this._frameCount = 0;
    this._fpsTimer = 0;

    this.input = new Input();
    this.world = new World();

    // Camera (goc tren-trai khung nhin trong toa do the gioi). Bam theo nhan vat.
    this.camX = 0;
    this.camY = 0;

    // Nhan vat bat dau gan giua the gioi (vung co, de di moi huong).
    this.player = new Player(WORLD_WIDTH / 2 - 6, WORLD_HEIGHT / 2 - 8, {
      spritePath: this.character.sprite, // nhan vat nguoi choi da chon (undefined -> player.png)
    });

    // NPC hiep si dung trong nong trai (trang tri, chua tuong tac).
    // Khong goi update -> dung yen.
    this.npc = new Player(WORLD_WIDTH / 2 - 100, WORLD_HEIGHT / 2 - 40, { spritePath: "sprites/knight.png" });
    this.npc.facing = "down";

    this.beans = 0;                 // so Dau Than da thu hoach
    this._faced = { c: 0, r: 0 };   // o dang nham toi (truoc mat nhan vat)

    // Chien dau (Pha 3.3 / 3.4).
    this.effects = [];              // chuong luc tam thoi (hieu ung dam)
    this._punchCd = 0;             // hoi chieu dam (giay)
    this.powerUp = false;          // 4.1 Bung khi (hao quang, tang Suc Danh, hao KI)
    this.auraTimer = 0;            // bung phat hao quang ban dau
    this.dummy = {                  // Moc Nhan: dam de roi Tiem Nang (chi o khu nha)
      x: WORLD_WIDTH / 2 + 70, y: WORLD_HEIGHT / 2 - 60, w: 14, h: 22,
      hp: 30, maxHp: 30, flash: 0, knock: 0, broken: false, respawnT: 0,
    };

    this._fade = 0;                 // hieu ung mo den khi chuyen khu (1 -> 0)

    // HUD (DOM) — cap nhat moi khung hinh.
    this.hud = new HUD(this);
    this.player.onReady = () => this.hud.drawPortrait();
    this.hud.drawPortrait();

    // Doi khu (di toi mep ban do) -> cap nhat ten khu tren minimap + bao + hieu ung mo.
    this.world.onZoneChange = (w) => {
      this.hud.setZoneName(w.zoneName);
      this.hud.say("KHU VỰC", "Đã tới " + w.zoneName + ". Đi tiếp tới mép bản đồ để sang khu khác.");
      this._fade = 1;
    };
    this.hud.setZoneName(this.world.zoneName); // ten khu khoi dau (Dong Co)

    this.hud.say("HỆ THỐNG",
      "Chào mừng " + this.hud.label(this.character.name) +
      " đến Saiyan Valley! E: cuốc/gieo/thu hoạch, R: tưới, Shift: chạy. Đi tới MÉP bản đồ để khám phá khu mới!");

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
    this._handleZoneEdges();     // di qua mep -> sang khu ke (hoac chan lai neu la bien)
    this.world.update(dt);
    this._handleFarming();

    if (this._fade > 0) this._fade = Math.max(0, this._fade - dt / 0.3); // mo den nhat dan

    // KI: bùng khí hao mạnh > chạy hao > đứng yên hồi.
    if (this.powerUp) {
      this.stats.ki = Math.max(0, this.stats.ki - 14 * dt);
      if (this.stats.ki <= 0) { this.powerUp = false; this.hud.say("CẢNH GIỚI", "Hết KI — tắt Bùng Khí."); }
    } else if (this.player.isRunning && this.player.moving) {
      this.stats.ki = Math.max(0, this.stats.ki - 28 * dt);
    } else {
      this.stats.ki = Math.min(this.stats.maxKi, this.stats.ki + 16 * dt);
    }

    this._updateCombat(dt);
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

  /** Dang o khu nha (Dong Co)? -> noi co NPC hiep si va Moc Nhan tap luyen. */
  _isHome() { return this.world.zx === 0 && this.world.zy === 0; }

  /**
   * Di toi mep ban do: neu co khu ke ben cung huong -> sang khu do (hien ra o
   * mep doi dien); neu khong -> mep la tuong, ket nhan vat trong bien.
   */
  _handleZoneEdges() {
    const p = this.player, w = this.world;
    const cx = p.x + p.width / 2, cy = p.y + p.height / 2;
    let dir = null;
    if (cx < 0) dir = "left";
    else if (cx > WORLD_WIDTH) dir = "right";
    else if (cy < 0) dir = "up";
    else if (cy > WORLD_HEIGHT) dir = "down";

    if (dir) {
      const nx = w.zx + (dir === "left" ? -1 : dir === "right" ? 1 : 0);
      const ny = w.zy + (dir === "up" ? -1 : dir === "down" ? 1 : 0);
      if (w.hasZone(nx, ny)) {
        w.loadZone(nx, ny); // doi map (onZoneChange lo hieu ung mo + ten khu)
        // Hien ra o mep DOI DIEN, giu vi tri theo truc vuong goc.
        if (dir === "left") { p.x = WORLD_WIDTH - p.width - 1; p.y = this._clampY(p.y); }
        else if (dir === "right") { p.x = 1; p.y = this._clampY(p.y); }
        else if (dir === "up") { p.y = WORLD_HEIGHT - p.height - 1; p.x = this._clampX(p.x); }
        else { p.y = 1; p.x = this._clampX(p.x); }
        return;
      }
    }
    // Khong co khu ke -> bien la tuong.
    p.x = this._clampX(p.x);
    p.y = this._clampY(p.y);
  }

  _clampX(x) { return Math.max(0, Math.min(WORLD_WIDTH - this.player.width, x)); }
  _clampY(y) { return Math.max(0, Math.min(WORLD_HEIGHT - this.player.height, y)); }

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

    if (this.input.wasPressed("KeyF")) this.eatBean();
  }

  /**
   * 3.2 Ăn 1 Đậu Thần: hồi đầy HP/KI và +1 Tiềm Năng.
   * Đủ Tiềm Năng -> ĐỘT PHÁ lên cấp: tăng máu/khí tối đa + Sức Đánh.
   */
  eatBean() {
    if (this.beans <= 0) {
      this.hud.say("ĐẬU THẦN", "Chưa có Đậu Thần! Hãy trồng và thu hoạch trước (E).");
      return;
    }
    this.beans--;
    const s = this.stats;
    s.hp = s.maxHp;      // Đậu Thần hồi đầy (như senzu)
    s.ki = s.maxKi;

    if (this.addPotential(1)) {
      this.hud.say("ĐỘT PHÁ", "Lên cấp " + s.level + "! Sức Đánh tăng lên " + s.power + ", máu & khí mạnh hơn.");
    } else {
      this.hud.say("ĐẬU THẦN", "Ăn 1 Đậu Thần — hồi đầy HP/KI. Tiềm Năng " + s.potential + "/" + s.potentialMax + ".");
    }
  }

  /** Cộng Tiềm Năng; đủ ngưỡng -> đột phá lên cấp (có thể nhiều cấp). Trả về true nếu lên cấp. */
  addPotential(n) {
    const s = this.stats;
    s.potential += n;
    let leveled = false;
    while (s.potential >= s.potentialMax) {
      s.potential -= s.potentialMax;
      s.level++;
      s.maxHp += 20; s.maxKi += 10; s.power += 3;
      s.hp = s.maxHp; s.ki = s.maxKi;
      s.potentialMax = s.level * 5;
      leveled = true;
    }
    return leveled;
  }

  /** Sức Đánh hiệu dụng (x1.5 khi đang bùng khí). */
  effPower() { return this.powerUp ? Math.round(this.stats.power * 1.5) : this.stats.power; }

  /** 4.1 Bùng khí: bật/tắt trạng thái tăng Sức Đánh (hào quang vàng), hao KI liên tục. */
  togglePowerUp() {
    if (this.powerUp) { this.powerUp = false; this.hud.say("CẢNH GIỚI", "Đã tắt Bùng Khí."); return; }
    if (this.stats.ki < 10) { this.hud.say("CẢNH GIỚI", "Không đủ KI để bùng khí!"); return; }
    this.powerUp = true;
    this.auraTimer = 0.6;
    this.hud.say("CẢNH GIỚI", "BÙNG KHÍ! Hào quang bốc lên, Sức Đánh tăng mạnh — nhưng hao KI liên tục.");
  }

  /** 3.3 Đấm: tốn KI, bắn chưởng lực; trúng Mộc Nhân gây sát thương; đập được đá cứng (4.2). */
  punch() {
    if (this._punchCd > 0) return;
    const s = this.stats;
    if (s.ki < 5) { this.hud.say("CHIẾN ĐẤU", "Không đủ KI để đấm! Nghỉ chút hoặc ăn Đậu Thần (F)."); return; }
    s.ki -= 5;
    this._punchCd = 0.32;

    const p = this.player;
    const cx = p.x + p.width / 2, cy = p.y + p.height / 2;
    const dx = p.facing === "left" ? -1 : p.facing === "right" ? 1 : 0;
    const dy = p.facing === "up" ? -1 : p.facing === "down" ? 1 : 0;
    const pw = this.effPower();

    // Chưởng lực bay ra trước mặt (hiệu ứng).
    this.effects.push({ x: cx + dx * 8, y: cy + dy * 8, vx: dx * 130, vy: dy * 130, t: 0, life: 0.3 });

    // 4.2 Đập đá cứng ở ô trước mặt (cần Sức Đánh đủ cao).
    const rock = this.world.breakRock(this._faced.c, this._faced.r, pw);
    if (rock === "broken") {
      this.effects.push({ x: this._faced.c * TILE_SIZE + 8, y: this._faced.r * TILE_SIZE + 8, vx: 0, vy: 0, t: 0, life: 0.35 });
      this.hud.say("KHAI PHÁ", "Đập vỡ đá! Mở rộng được đất trồng.");
    } else if (rock === "tooHard") {
      this.hud.say("KHAI PHÁ", "Đá quá cứng! Cần Sức Đánh ≥ " + ROCK_HARDNESS + " (bùng khí G hoặc lên cấp).");
    }

    // Cận chiến với Mộc Nhân (chỉ ở khu nhà).
    const ax = cx + dx * 14 - 7, ay = cy + dy * 14 - 7;
    const dm = this.dummy;
    if (this._isHome() && !dm.broken && ax < dm.x + dm.w && ax + 14 > dm.x && ay < dm.y + dm.h && ay + 14 > dm.y) {
      dm.hp -= pw;
      dm.flash = 0.12;
      dm.knock = dx * 3;
      if (dm.hp <= 0) {
        dm.hp = 0; dm.broken = true; dm.respawnT = 1.5;
        if (this.addPotential(3)) this.hud.say("ĐỘT PHÁ", "Phá Mộc Nhân & lên cấp " + s.level + "! Sức Đánh " + s.power + ".");
        else this.hud.say("LUYỆN TẬP", "Phá Mộc Nhân! Tiềm Năng +3 (" + s.potential + "/" + s.potentialMax + ").");
      } else {
        this.hud.say("LUYỆN TẬP", "Đấm trúng Mộc Nhân! Còn " + dm.hp + "/" + dm.maxHp + " máu.");
      }
    }
  }

  /** Cập nhật chiến đấu: phím đấm, hồi chiêu, hiệu ứng, hồi sinh Mộc Nhân. */
  _updateCombat(dt) {
    if (this.input.wasPressed("KeyJ")) this.punch();
    if (this.input.wasPressed("KeyG")) this.togglePowerUp();
    if (this._punchCd > 0) this._punchCd -= dt;
    if (this.auraTimer > 0) this.auraTimer -= dt;

    for (const e of this.effects) { e.t += dt; e.x += e.vx * dt; e.y += e.vy * dt; }
    this.effects = this.effects.filter((e) => e.t < e.life);

    const dm = this.dummy;
    if (dm.flash > 0) dm.flash -= dt;
    if (dm.knock !== 0) dm.knock *= 0.8;
    if (dm.broken) {
      dm.respawnT -= dt;
      if (dm.respawnT <= 0) { dm.broken = false; dm.hp = dm.maxHp; }
    }
  }

  /** 4.1 Hào quang khi bùng khí (vầng sáng vàng + ngọn lửa bốc lên quanh nhân vật). */
  _drawAura(ctx) {
    if (!this.powerUp && this.auraTimer <= 0) return;
    const p = this.player;
    const cx = p.x + p.width / 2, by = p.y + p.height;
    const t = this.world.animTime;
    const rad = 11 + Math.round(Math.sin(t * 12));
    ctx.fillStyle = this.auraTimer > 0 ? "rgba(255,225,120,0.30)" : "rgba(255,210,90,0.18)";
    for (let dy = -rad; dy <= rad; dy++) {
      const w = Math.floor(Math.sqrt(rad * rad - dy * dy));
      ctx.fillRect(Math.round(cx - w), Math.round(by - 9 + dy), w * 2 + 1, 1);
    }
    ctx.fillStyle = "#ffd23a";
    for (let i = 0; i < 5; i++) {
      const ph = t * 16 + i * 1.7;
      const fx = Math.round(cx - 6 + i * 3 + Math.sin(ph));
      const fy = Math.round(by - 2 - (Math.floor(ph * 3) % 6));
      ctx.fillRect(fx, fy, 1, 2);
    }
    ctx.fillStyle = "rgba(255,255,200,0.85)";
    ctx.fillRect(Math.round(cx) - 1, Math.round(by - 14), 2, 2);
  }

  /** Vẽ Mộc Nhân (cọc gỗ + bia) + thanh máu nhỏ khi đã bị đánh. */
  _drawDummy(ctx) {
    if (!this._isHome()) return; // Moc Nhan chi co o khu nha
    const dm = this.dummy;
    if (dm.broken) {
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(dm.x + 2, dm.y + dm.h - 2, dm.w - 4, 2); // bóng mờ (đang hồi sinh)
      return;
    }
    const x = Math.round(dm.x + dm.knock), y = dm.y;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x + 1, y + dm.h - 2, dm.w - 2, 2);          // bóng
    ctx.fillStyle = "#6b4a2b"; ctx.fillRect(x + 5, y + 8, 4, dm.h - 8); // thân cột
    ctx.fillStyle = "#8a5a2b"; ctx.fillRect(x + 2, y + 2, dm.w - 4, 8); // đầu
    ctx.fillStyle = "#5a3d22"; ctx.fillRect(x + 1, y + 6, dm.w - 2, 2); // tay ngang
    ctx.fillStyle = "#d24b4b"; ctx.fillRect(x + 5, y + 3, 4, 4);        // bia đỏ
    ctx.fillStyle = "#f4e7c1"; ctx.fillRect(x + 6, y + 4, 2, 2);        // tâm bia
    if (dm.flash > 0) { ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(x, y, dm.w, dm.h); }
    if (dm.hp < dm.maxHp) {
      ctx.fillStyle = "#000"; ctx.fillRect(x, y - 4, dm.w, 3);
      ctx.fillStyle = "#e2533b"; ctx.fillRect(x, y - 4, Math.round(dm.w * dm.hp / dm.maxHp), 3);
    }
  }

  /** Vẽ chưởng lực (đĩa năng lượng nở ra rồi mờ dần). */
  _drawEffects(ctx) {
    for (const e of this.effects) {
      const rad = 2 + (e.t / e.life) * 6;
      ctx.fillStyle = (e.t / e.life) < 0.5 ? "rgba(174,240,255,0.9)" : "rgba(120,180,230,0.55)";
      for (let dyy = -rad; dyy <= rad; dyy++) {
        const w = Math.floor(Math.sqrt(rad * rad - dyy * dyy));
        ctx.fillRect(Math.round(e.x - w), Math.round(e.y + dyy), w * 2 + 1, 1);
      }
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(Math.round(e.x) - 1, Math.round(e.y) - 1, 2, 2);
    }
  }

  /** Camera bam theo nhan vat, ket trong bien the gioi (lam tron -> pixel sac net). */
  _updateCamera() {
    const p = this.player;
    let cx = Math.round(p.x + p.width / 2 - GAME_WIDTH / 2);
    let cy = Math.round(p.y + p.height / 2 - GAME_HEIGHT / 2);
    this.camX = Math.max(0, Math.min(WORLD_WIDTH - GAME_WIDTH, cx));
    this.camY = Math.max(0, Math.min(WORLD_HEIGHT - GAME_HEIGHT, cy));
  }

  render() {
    const ctx = this.ctx;

    // Camera bam theo nhan vat; doi he toa do sang "the gioi" (tat ca ve ben trong
    // dung toa do the gioi, camera lo phan dang nhin).
    this._updateCamera();
    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    // Ban do + cay trong.
    this.world.render(ctx);

    // O dang nham (noi cong cu tac dung).
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this._faced.c * TILE_SIZE + 0.5, this._faced.r * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    // Moc Nhan (ve truoc -> nhan vat co the dung de tren).
    this._drawDummy(ctx);

    // Hao quang bung khi (ve duoi chan, sau lung nhan vat).
    this._drawAura(ctx);

    // Nhan vat + NPC: ve theo do sau (chan thap hon ve sau -> noi tren).
    // NPC hiep si chi xuat hien o khu nha.
    const actors = this._isHome() ? [this.player, this.npc] : [this.player];
    actors.sort((a, b) => (a.y + a.height) - (b.y + b.height));
    for (const a of actors) a.render(ctx);

    // Chuong luc ve tren cung.
    this._drawEffects(ctx);

    ctx.restore();

    // Mo den khi chuyen khu (ve trong toa do man hinh, phu toan canvas).
    if (this._fade > 0) {
      ctx.fillStyle = "rgba(0,0,0," + Math.min(1, this._fade) + ")";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Cap nhat HUD (DOM) — thanh mau/KI, Dau Than, minimap...
    this.hud.update(this);
  }
}
