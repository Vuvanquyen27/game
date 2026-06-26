"use strict";

// === Cấu hình ô (tile) ===
const TILE_SIZE = 16;   // mỗi ô 16x16 px
const TILE_GRASS = 0;   // đất cỏ
const TILE_SOIL = 1;    // đất cày
const TILE_ROCK = 2;    // đất đá cứng (cần Sức Đánh cao để khai phá)
const ROCK_HARDNESS = 14; // Sức Đánh tối thiểu để đập vỡ đá

// === Kích thước THẾ GIỚI (lớn hơn khung nhìn -> camera bám theo nhân vật) ===
// Khung nhìn (canvas) vẫn 320x180 (20x12 ô); bản đồ rộng gấp ~4 lần diện tích.
// Giữ tỉ lệ 5:3 để minimap (80x48) không bị méo.
const WORLD_COLS = 40;
const WORLD_ROWS = 24;
const WORLD_WIDTH = WORLD_COLS * TILE_SIZE;   // 640 px
const WORLD_HEIGHT = WORLD_ROWS * TILE_SIZE;  // 384 px

// === Chủ đề biome (THEMES): bảng màu cho từng kiểu khu vực ===
// g* = nền + chi tiết cỏ/đất nền; f* = đốm trang trí (hoa/xương rồng/băng...);
// soil*/fur*/sp* = đất cày (khô/ướt); rk* = đá (nền/bóng/sáng/đốm/khe nứt).
const THEMES = {
  meadow: { // đồng cỏ (mặc định)
    gA: "#4a7c45", gB: "#447540", gDark: "#3f6b2a", gLite: "#6fae57", fA: "#f2d24e", fB: "#e8e6f0",
    soilDry: "#6b4a2b", soilWet: "#4a3320", furDry: "#5a3d22", furWet: "#33240f", spDry: "#7c5836", spWet: "#5a4228",
    rkBase: "#6f6a78", rkSh: "#565260", rkHi: "#8a8694", rkLt: "#a8a4b2", rkCr: "#3f3c47",
  },
  forest: { // rừng rậm (xanh tối, nấm/quả)
    gA: "#2f5a32", gB: "#295029", gDark: "#1e3c1f", gLite: "#4e8a48", fA: "#d24b4b", fB: "#caa24e",
    soilDry: "#5e4528", soilWet: "#3e2d1a", furDry: "#4d381f", furWet: "#2a1f10", spDry: "#6e5230", spWet: "#4c3a20",
    rkBase: "#5d5a50", rkSh: "#454339", rkHi: "#777462", rkLt: "#928f78", rkCr: "#312f28",
  },
  desert: { // sa mạc (cát vàng, xương rồng)
    gA: "#d9b771", gB: "#cfa961", gDark: "#bb924a", gLite: "#efda9c", fA: "#5a9e4a", fB: "#a9742f",
    soilDry: "#a07c44", soilWet: "#7a5a2c", furDry: "#896530", furWet: "#5d4420", spDry: "#c29a5b", spWet: "#94713c",
    rkBase: "#b98c54", rkSh: "#8d6838", rkHi: "#d6ad6f", rkLt: "#eccb8e", rkCr: "#6c4d24",
  },
  snow: { // núi tuyết (trắng xanh, băng)
    gA: "#dfe9f2", gB: "#d0dcec", gDark: "#b7c6db", gLite: "#ffffff", fA: "#9fc7ee", fB: "#cfe6ff",
    soilDry: "#7d7a86", soilWet: "#5e5b69", furDry: "#67646f", furWet: "#48454f", spDry: "#94909c", spWet: "#6f6b77",
    rkBase: "#9aa6ba", rkSh: "#76829a", rkHi: "#b8c3d4", rkLt: "#dde6f0", rkCr: "#5b6376",
  },
  swamp: { // đầm lầy (xanh úa, bùn)
    gA: "#4a5a35", gB: "#42522f", gDark: "#32421f", gLite: "#6e7d3f", fA: "#8bbf5a", fB: "#7a6a3a",
    soilDry: "#4e3f24", soilWet: "#352a18", furDry: "#3f3320", furWet: "#241c10", spDry: "#5e4d2e", spWet: "#40341f",
    rkBase: "#5a6052", rkSh: "#43483c", rkHi: "#737a68", rkLt: "#8c947f", rkCr: "#30342a",
  },
};

// === Bản đồ tổng (ZONE_MAP): lưới các khu nối nhau (toa do "zx,zy" -> khu) ===
// Đi tới mép bản đồ -> sang khu kế bên cùng hướng. Toạ độ không có trong bảng = tường.
// Bố cục 3x2 (nhà ở góc trên-trái), đi sang phải/xuống để khám phá, có thể vòng lại:
//   [Đồng Cỏ*][Rừng Rậm][Núi Tuyết]
//   [Đầm Lầy ][Sa Mạc  ][Thảo Nguyên]
const ZONE_MAP = {
  "0,0": { theme: "meadow", name: "ĐỒNG CỎ" },     // khu nhà (khởi đầu)
  "1,0": { theme: "forest", name: "RỪNG RẬM" },
  "2,0": { theme: "snow",   name: "NÚI TUYẾT" },
  "0,1": { theme: "swamp",  name: "ĐẦM LẦY" },
  "1,1": { theme: "desert", name: "SA MẠC" },
  "2,1": { theme: "meadow", name: "THẢO NGUYÊN" },
};

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
    this.cols = WORLD_COLS;
    this.rows = WORLD_ROWS;
    this.widthPx = this.cols * TILE_SIZE;
    this.heightPx = this.rows * TILE_SIZE;

    this.animTime = 0;   // dong ho cho hieu ung (long lanh, phat sang)

    // Cac khu (zone) da tung tham -> luu rieng tien trinh nong trai tung khu,
    // quay lai thay y nguyen luc roi di.
    this.zones = new Map();   // "zx,zy" -> { tiles, crops }
    this.zx = undefined;      // toa do khu hien tai (tren ZONE_MAP)
    this.zy = undefined;
    this.theme = null;        // bang mau biome khu hien tai
    this.zoneName = "";
    this.onZoneChange = null; // Game gan: cap nhat HUD khi doi khu

    // Lop nen TINH (co + dat): ve san vao canvas dem, chi ve lai khi ban do doi.
    // Tranh ve lai toan bo o + hang loat _rnd() moi khung hinh.
    this.revision = 0;     // tang moi khi ban do/cay thay doi (lop nen + minimap dung chung)
    this._groundRev = -1;  // revision lan cuoi lop nen dem da dung
    this._ground = document.createElement("canvas");
    this._ground.width = this.widthPx;
    this._ground.height = this.heightPx;
    this._groundCtx = this._ground.getContext("2d");
    this._groundCtx.imageSmoothingEnabled = false;

    this.loadZone(0, 0); // vao khu nha (Dong Co)
  }

  _zkey(zx, zy) { return zx + "," + zy; }

  /** Co khu vuc o toa do nay khong (de biet co chuyen map duoc khong). */
  hasZone(zx, zy) {
    return Object.prototype.hasOwnProperty.call(ZONE_MAP, this._zkey(zx, zy));
  }

  /**
   * Chuyen sang khu (zx, zy): luu khu hien tai, nap (hoac sinh moi) khu dich.
   * Doi theme + ban do; tien trinh nong trai tung khu duoc giu lai.
   */
  loadZone(zx, zy) {
    // Luu trang thai khu hien tai truoc khi roi di.
    if (this.zx !== undefined) {
      this.zones.set(this._zkey(this.zx, this.zy), { tiles: this.tiles, crops: this.crops });
    }
    const def = ZONE_MAP[this._zkey(zx, zy)] || ZONE_MAP["0,0"];
    this.zx = zx; this.zy = zy;
    this.theme = THEMES[def.theme];
    this.zoneName = def.name;

    const saved = this.zones.get(this._zkey(zx, zy));
    if (saved) {
      this.tiles = saved.tiles; this.crops = saved.crops; // quay lai khu cu
    } else {
      const z = this._generateZone(zx, zy);               // lan dau -> sinh moi
      this.tiles = z.tiles; this.crops = z.crops;
    }
    this._bump();                          // ve lai lop nen + minimap theo theme moi
    if (this.onZoneChange) this.onZoneChange(this);
  }

  /** Sinh dia hinh cho mot khu (co dinh theo toa do -> quay lai van the). */
  _generateZone(zx, zy) {
    const tiles = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) row.push(TILE_GRASS);
      tiles.push(row);
    }

    if (zx === 0 && zy === 0) {
      // Khu nha: vung da cung o duoi-phai de khai pha (giu nguyen loi choi cu).
      const rockC = Math.floor(this.cols * 0.55), rockR = Math.floor(this.rows * 0.55);
      for (let r = rockR; r < this.rows; r++)
        for (let c = rockC; c < this.cols; c++) tiles[r][c] = TILE_ROCK;
    } else {
      // Khu khac: rai vai cum da ngau nhien (theo toa do nen co dinh).
      const clusters = 3 + Math.floor(this._rnd(zx, zy, 90) * 4); // 3..6 cum
      for (let i = 0; i < clusters; i++) {
        const cc = 2 + Math.floor(this._rnd(zx * 7 + i, zy * 13, 91) * (this.cols - 4));
        const cr = 2 + Math.floor(this._rnd(zx * 5 + i, zy * 11, 92) * (this.rows - 4));
        const sz = 1 + Math.floor(this._rnd(zx + i, zy + i, 93) * 3); // ban kinh 1..3
        for (let r = cr - sz; r <= cr + sz; r++)
          for (let c = cc - sz; c <= cc + sz; c++)
            if (this.inBounds(c, r) && this._rnd(c * 3 + i, r * 3, 94) > 0.35) tiles[r][c] = TILE_ROCK;
      }
    }
    return { tiles, crops: new Map() };
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

  /** 4.2 Đập đá: cần Sức Đánh đủ mạnh. Trả về "broken" | "tooHard" | "none". */
  breakRock(c, r, power) {
    if (this.getTile(c, r) !== TILE_ROCK) return "none";
    if (power < ROCK_HARDNESS) return "tooHard";
    this.setTile(c, r, TILE_GRASS); // đá vỡ -> đất cỏ trồng được
    this._bump();
    return "broken";
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
        const t = this.tiles[r][c];
        if (t === TILE_SOIL) this._drawSoil(ctx, x, y, c, r);
        else if (t === TILE_ROCK) this._drawRock(ctx, x, y, c, r);
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
    const t = this.theme;
    // Nen (xen ke 2 sac do).
    ctx.fillStyle = ((c + r) % 2 === 0) ? t.gA : t.gB;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Bui/dom toi.
    if (this._rnd(c, r, 1) > 0.5) {
      ctx.fillStyle = t.gDark;
      ctx.fillRect(x + (this._rnd(c, r, 2) * 11 | 0) + 2, y + (this._rnd(c, r, 3) * 10 | 0) + 3, 2, 1);
    }
    // Diem sang.
    if (this._rnd(c, r, 4) > 0.5) {
      ctx.fillStyle = t.gLite;
      ctx.fillRect(x + (this._rnd(c, r, 5) * 12 | 0) + 1, y + (this._rnd(c, r, 6) * 11 | 0) + 2, 1, 2);
    }
    // Dom trang tri hiem gap (hoa / xuong rong / bang... tuy biome).
    if (this._rnd(c, r, 7) > 0.9) {
      ctx.fillStyle = this._rnd(c, r, 10) > 0.5 ? t.fA : t.fB;
      ctx.fillRect(x + (this._rnd(c, r, 8) * 11 | 0) + 2, y + (this._rnd(c, r, 9) * 10 | 0) + 3, 2, 2);
    }
  }

  _drawRock(ctx, x, y, c, r) {
    const t = this.theme;
    ctx.fillStyle = t.rkBase; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);     // nền đá
    ctx.fillStyle = t.rkSh; ctx.fillRect(x, y + 11, TILE_SIZE, 5);          // chân tối
    ctx.fillStyle = t.rkHi; ctx.fillRect(x + 3, y + 3, 6, 5); ctx.fillRect(x + 9, y + 6, 4, 4); // tảng sáng
    ctx.fillStyle = t.rkLt; ctx.fillRect(x + 4, y + 4, 2, 2);               // đốm sáng
    if (this._rnd(c, r, 21) > 0.4) { ctx.fillStyle = t.rkCr; ctx.fillRect(x + (this._rnd(c, r, 22) * 11 | 0) + 2, y + 2, 1, 7); } // khe nứt
  }

  _drawSoil(ctx, x, y, c, r) {
    const t = this.theme;
    const crop = this.crops.get(this._key(c, r));
    const watered = crop && crop.watered;
    // Nen dat (tuoi roi thi sam hon).
    ctx.fillStyle = watered ? t.soilWet : t.soilDry;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Luong cay.
    ctx.fillStyle = watered ? t.furWet : t.furDry;
    ctx.fillRect(x, y + 4, TILE_SIZE, 2);
    ctx.fillRect(x, y + 10, TILE_SIZE, 2);
    // Hat dat lam tam (xac dinh theo o).
    ctx.fillStyle = watered ? t.spWet : t.spDry;
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
