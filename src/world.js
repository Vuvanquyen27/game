"use strict";

// === Cấu hình ô (tile) ===
const TILE_SIZE = 16;   // mỗi ô 16x16 px
const TILE_GRASS = 0;   // đất cỏ
const TILE_SOIL = 1;    // đất cày

// === Cấu hình cây trồng (Đậu Thần) ===
const CROP_MAX_STAGE = 3;     // 0 = mầm ... 3 = chín
const CROP_GROWTH_TIME = 3;   // giây cho mỗi giai đoạn (chỉ lớn khi đã tưới)

/**
 * Bản đồ nền (Tilemap) + hệ thống nông trại.
 * - tiles[][]: loại ô (cỏ / đất cày).
 * - crops: Map "c,r" -> { stage, watered, timer } cho cây đang trồng.
 */
class World {
  constructor() {
    this.cols = Math.ceil(GAME_WIDTH / TILE_SIZE);
    this.rows = Math.ceil(GAME_HEIGHT / TILE_SIZE);
    this.widthPx = this.cols * TILE_SIZE;
    this.heightPx = this.rows * TILE_SIZE;

    // Toàn bộ là cỏ; người chơi tự cuốc thành đất cày.
    this.tiles = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) row.push(TILE_GRASS);
      this.tiles.push(row);
    }

    this.crops = new Map();
  }

  _key(c, r) { return c + "," + r; }
  inBounds(c, r) { return c >= 0 && c < this.cols && r >= 0 && r < this.rows; }
  getTile(c, r) { return this.inBounds(c, r) ? this.tiles[r][c] : -1; }
  setTile(c, r, t) { if (this.inBounds(c, r)) this.tiles[r][c] = t; }

  // ---------- HÀNH ĐỘNG NÔNG TRẠI ----------

  /** 2.1 Cuốc đất: cỏ -> đất cày. */
  tillAt(c, r) {
    if (this.getTile(c, r) === TILE_GRASS) { this.setTile(c, r, TILE_SOIL); return true; }
    return false;
  }

  /** 2.2 Gieo hạt: chỉ trên đất cày còn trống. */
  plantAt(c, r) {
    if (this.getTile(c, r) !== TILE_SOIL) return false;
    if (this.crops.has(this._key(c, r))) return false;
    this.crops.set(this._key(c, r), { stage: 0, watered: false, timer: 0 });
    return true;
  }

  /** 2.2 Tưới nước cho cây tại ô. */
  waterAt(c, r) {
    const crop = this.crops.get(this._key(c, r));
    if (!crop) return false;
    crop.watered = true;
    return true;
  }

  /** 2.4 Thu hoạch nếu cây đã chín. (caller cộng Đậu Thần) */
  harvestAt(c, r) {
    const crop = this.crops.get(this._key(c, r));
    if (!crop || crop.stage < CROP_MAX_STAGE) return false;
    this.crops.delete(this._key(c, r)); // đất cày vẫn còn -> trồng lại được
    return true;
  }

  /**
   * Tương tác đa năng (phím E) theo trạng thái ô:
   *   cỏ -> cuốc | đất trống -> gieo | cây chín -> thu hoạch.
   * Trả về: "tilled" | "planted" | "harvested" | "none".
   */
  interact(c, r) {
    if (this.getTile(c, r) === TILE_GRASS) {
      return this.tillAt(c, r) ? "tilled" : "none";
    }
    if (this.getTile(c, r) === TILE_SOIL) {
      const crop = this.crops.get(this._key(c, r));
      if (!crop) return this.plantAt(c, r) ? "planted" : "none";
      if (crop.stage >= CROP_MAX_STAGE) return this.harvestAt(c, r) ? "harvested" : "none";
    }
    return "none";
  }

  /** 2.3 Phát triển cây theo thời gian (đã tưới mới lớn). */
  update(dt) {
    for (const crop of this.crops.values()) {
      if (crop.stage >= CROP_MAX_STAGE || !crop.watered) continue;
      crop.timer += dt;
      if (crop.timer >= CROP_GROWTH_TIME) {
        crop.timer = 0;
        crop.stage++;
      }
    }
  }

  // ---------- VẼ ----------
  render(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * TILE_SIZE, y = r * TILE_SIZE;
        if (this.tiles[r][c] === TILE_SOIL) this._drawSoil(ctx, x, y, c, r);
        else this._drawGrass(ctx, x, y, c, r);
      }
    }
    this._drawCrops(ctx);
  }

  _drawGrass(ctx, x, y, c, r) {
    ctx.fillStyle = ((c + r) % 2 === 0) ? "#4a7c45" : "#447540";
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  }

  _drawSoil(ctx, x, y, c, r) {
    const crop = this.crops.get(this._key(c, r));
    const watered = crop && crop.watered;
    ctx.fillStyle = watered ? "#4a3320" : "#6b4a2b"; // tưới rồi thì sẫm hơn
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = watered ? "#3a2718" : "#5a3d22";
    ctx.fillRect(x, y + 4, TILE_SIZE, 2);
    ctx.fillRect(x, y + 10, TILE_SIZE, 2);
  }

  _drawCrops(ctx) {
    for (const [k, crop] of this.crops) {
      const idx = k.indexOf(",");
      const c = parseInt(k.slice(0, idx), 10);
      const r = parseInt(k.slice(idx + 1), 10);
      const cx = c * TILE_SIZE + TILE_SIZE / 2;
      const baseY = r * TILE_SIZE + TILE_SIZE - 2;

      if (crop.stage >= CROP_MAX_STAGE) {
        // Cây chín: thân xanh + Đậu Thần (vàng)
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(cx - 1, baseY - 10, 2, 10);
        ctx.fillStyle = "#ffd11a";
        ctx.fillRect(cx - 4, baseY - 9, 2, 2);
        ctx.fillRect(cx + 2, baseY - 6, 2, 2);
        ctx.fillRect(cx - 3, baseY - 4, 2, 2);
      } else {
        // Đang lớn: cao dần theo giai đoạn
        const h = 2 + crop.stage * 3; // stage 0=2, 1=5, 2=8
        ctx.fillStyle = "#43a047";
        ctx.fillRect(cx - 1, baseY - h, 2, h);
        if (crop.stage >= 1) {
          ctx.fillRect(cx - 3, baseY - h + 1, 2, 2);
          ctx.fillRect(cx + 1, baseY - h + 2, 2, 2);
        }
      }
    }
  }
}
