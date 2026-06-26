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
    this.animTime = 0;   // dong ho cho hieu ung (long lanh, phat sang)

    // Lop nen TINH (co + dat): ve san vao canvas dem, chi ve lai khi ban do doi.
    // Tranh ve lai 240 o + hang loat _rnd() moi khung hinh.
    this.revision = 0;     // tang moi khi ban do/cay thay doi (lop nen + minimap dung chung)
    this._groundRev = -1;  // revision lan cuoi lop nen dem da dung
    this._ground = document.createElement("canvas");
    this._ground.width = this.widthPx;
    this._ground.height = this.heightPx;
    this._groundCtx = this._ground.getContext("2d");
    this._groundCtx.imageSmoothingEnabled = false;
  }

  /** Danh dau ban do/cay vua thay doi -> ve lai lop nen + minimap o khung sau. */
  _bump() { this.revision++; }

  /** PRNG xac dinh theo o -> rai chi tiet co dinh (khong nhap nhay). */
  _rnd(c, r, s) {
    let n = (c * 374761393 + r * 668265263 + s * 2654435761) >>> 0;
    n = ((n ^ (n >>> 13)) * 1274126177) >>> 0;
    return (n % 1000) / 1000;
  }

  _key(c, r) { return c + "," + r; }
  inBounds(c, r) { return c >= 0 && c < this.cols && r >= 0 && r < this.rows; }
  getTile(c, r) { return this.inBounds(c, r) ? this.tiles[r][c] : -1; }
  setTile(c, r, t) { if (this.inBounds(c, r)) this.tiles[r][c] = t; }

  // ---------- HÀNH ĐỘNG NÔNG TRẠI ----------

  /** 2.1 Cuốc đất: cỏ -> đất cày. */
  tillAt(c, r) {
    if (this.getTile(c, r) === TILE_GRASS) { this.setTile(c, r, TILE_SOIL); this._bump(); return true; }
    return false;
  }

  /** 2.2 Gieo hạt: chỉ trên đất cày còn trống. */
  plantAt(c, r) {
    if (this.getTile(c, r) !== TILE_SOIL) return false;
    if (this.crops.has(this._key(c, r))) return false;
    // Luu kem (c, r) de ve cay/long lanh khong phai parse lai chuoi key moi khung hinh.
    this.crops.set(this._key(c, r), { stage: 0, watered: false, timer: 0, c, r });
    this._bump();
    return true;
  }

  /** 2.2 Tưới nước cho cây tại ô. */
  waterAt(c, r) {
    const crop = this.crops.get(this._key(c, r));
    if (!crop) return false;
    if (!crop.watered) { crop.watered = true; this._bump(); } // dat sam hon -> ve lai nen
    return true;
  }

  /** 2.4 Thu hoạch nếu cây đã chín. (caller cộng Đậu Thần) */
  harvestAt(c, r) {
    const crop = this.crops.get(this._key(c, r));
    if (!crop || crop.stage < CROP_MAX_STAGE) return false;
    this.crops.delete(this._key(c, r)); // đất cày vẫn còn -> trồng lại được
    this._bump(); // dat tro lai mau kho + minimap bo cham
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
    this.animTime += dt;
    for (const crop of this.crops.values()) {
      if (crop.stage >= CROP_MAX_STAGE || !crop.watered) continue;
      crop.timer += dt;
      if (crop.timer >= CROP_GROWTH_TIME) {
        crop.timer = 0;
        crop.stage++;
        if (crop.stage >= CROP_MAX_STAGE) this._bump(); // chin -> cham minimap doi sang vang
      }
    }
  }

  // ---------- VẼ ----------
  render(ctx) {
    // Lop nen (co + dat) chi ve lai khi ban do thay doi; con lai chi blit.
    if (this._groundRev !== this.revision) this._rebuildGround();
    ctx.drawImage(this._ground, 0, 0);
    this._drawWaterSparkle(ctx); // hieu ung dong tren o vua tuoi
    this._drawCrops(ctx);
  }

  /** Ve lai toan bo lop nen tinh vao canvas dem (chi goi khi revision doi). */
  _rebuildGround() {
    const ctx = this._groundCtx;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * TILE_SIZE, y = r * TILE_SIZE;
        if (this.tiles[r][c] === TILE_SOIL) this._drawSoil(ctx, x, y, c, r);
        else this._drawGrass(ctx, x, y, c, r);
      }
    }
    this._groundRev = this.revision;
  }

  /** Long lanh tren o da tuoi (hieu ung dong) — ve moi khung hinh tren lop nen. */
  _drawWaterSparkle(ctx) {
    ctx.fillStyle = "rgba(150,200,255,0.5)";
    for (const crop of this.crops.values()) {
      if (!crop.watered) continue;
      if (Math.floor(this.animTime * 4 + crop.c + crop.r) % 6 === 0) {
        const x = crop.c * TILE_SIZE, y = crop.r * TILE_SIZE;
        ctx.fillRect(x + 3, y + 2, 1, 1);
        ctx.fillRect(x + 11, y + 9, 1, 1);
      }
    }
  }

  _drawGrass(ctx, x, y, c, r) {
    // Nen co (xen ke 2 sac do).
    ctx.fillStyle = ((c + r) % 2 === 0) ? "#4a7c45" : "#447540";
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Bui co toi.
    if (this._rnd(c, r, 1) > 0.5) {
      ctx.fillStyle = "#3f6b2a";
      ctx.fillRect(x + (this._rnd(c, r, 2) * 11 | 0) + 2, y + (this._rnd(c, r, 3) * 10 | 0) + 3, 2, 1);
    }
    // Ngon co sang.
    if (this._rnd(c, r, 4) > 0.5) {
      ctx.fillStyle = "#6fae57";
      ctx.fillRect(x + (this._rnd(c, r, 5) * 12 | 0) + 1, y + (this._rnd(c, r, 6) * 11 | 0) + 2, 1, 2);
    }
    // Bong hoa hiem gap.
    if (this._rnd(c, r, 7) > 0.9) {
      ctx.fillStyle = this._rnd(c, r, 10) > 0.5 ? "#f2d24e" : "#e8e6f0";
      ctx.fillRect(x + (this._rnd(c, r, 8) * 11 | 0) + 2, y + (this._rnd(c, r, 9) * 10 | 0) + 3, 2, 2);
    }
  }

  _drawSoil(ctx, x, y, c, r) {
    const crop = this.crops.get(this._key(c, r));
    const watered = crop && crop.watered;
    // Nen dat (tuoi roi thi sam hon).
    ctx.fillStyle = watered ? "#4a3320" : "#6b4a2b";
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Luong cay.
    ctx.fillStyle = watered ? "#33240f" : "#5a3d22";
    ctx.fillRect(x, y + 4, TILE_SIZE, 2);
    ctx.fillRect(x, y + 10, TILE_SIZE, 2);
    // Hat dat lam tam (xac dinh theo o).
    ctx.fillStyle = watered ? "#5a4228" : "#7c5836";
    if (this._rnd(c, r, 11) > 0.4) ctx.fillRect(x + (this._rnd(c, r, 12) * 12 | 0) + 2, y + 2, 1, 1);
    if (this._rnd(c, r, 13) > 0.4) ctx.fillRect(x + (this._rnd(c, r, 14) * 12 | 0) + 2, y + 8, 1, 1);
    // (Hieu ung "long lanh" dong duoc ve rieng trong _drawWaterSparkle moi khung hinh.)
  }

  _drawCrops(ctx) {
    for (const crop of this.crops.values()) {
      const c = crop.c, r = crop.r;
      const cx = c * TILE_SIZE + TILE_SIZE / 2;
      const baseY = r * TILE_SIZE + TILE_SIZE - 2;

      if (crop.stage >= CROP_MAX_STAGE) {
        // Cay chin: than + la + Dau Than phat sang.
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(cx - 1, baseY - 11, 2, 11);
        ctx.fillStyle = "#43a047";
        ctx.fillRect(cx - 4, baseY - 9, 3, 2);
        ctx.fillRect(cx + 1, baseY - 7, 3, 2);
        const glow = Math.floor(this.animTime * 3 + c + r) % 4 === 0;
        ctx.fillStyle = "#ffd11a";
        ctx.fillRect(cx - 2, baseY - 14, 4, 4);
        ctx.fillStyle = glow ? "#fff6b0" : "#ffe680";
        ctx.fillRect(cx - 1, baseY - 13, 2, 2);
        if (glow) {
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(cx + 3, baseY - 15, 1, 1);
        }
      } else {
        // Dang lon: cao dan theo giai doan.
        const h = 2 + crop.stage * 3; // stage 0=2, 1=5, 2=8
        ctx.fillStyle = "#43a047";
        ctx.fillRect(cx - 1, baseY - h, 2, h);
        if (crop.stage >= 1) {
          ctx.fillStyle = "#5cb85c";
          ctx.fillRect(cx - 3, baseY - h + 1, 2, 2);
          ctx.fillRect(cx + 1, baseY - h + 2, 2, 2);
        }
        // Mam non co cham sang.
        if (crop.stage === 0) {
          ctx.fillStyle = "#74c878";
          ctx.fillRect(cx - 1, baseY - h - 1, 2, 1);
        }
      }
    }
  }
}
