"use strict";

/**
 * HUD: cap nhat giao dien (DOM) tu trang thai Game moi khung hinh.
 * - Thanh HP / KI, so Dau Than, ten + level.
 * - Minimap nong trai + cham nguoi choi.
 * - Chan dung (ve lai sprite nhan vat).
 * - Hop thoai thong bao + nut lenh (Tui do / Ban do / Nhan vat).
 */
class HUD {
  constructor(game) {
    this.game = game;
    this._p = {}; // gia tri truoc do (chi cap nhat DOM khi thay doi)

    this.elName  = document.getElementById("hud-name");
    this.elLv    = document.getElementById("hud-lv");
    this.elHp    = document.getElementById("hpfill");
    this.elHpT   = document.getElementById("hptext");
    this.elKi    = document.getElementById("kifill");
    this.elKiT   = document.getElementById("kitext");
    this.elBean  = document.getElementById("beantext");
    this.elDName = document.getElementById("dlgname");
    this.elDText = document.getElementById("dlgtext");
    this.elDCur  = document.getElementById("dlgcursor");

    this.mmctx = document.getElementById("minimap").getContext("2d");
    this.mmctx.imageSmoothingEnabled = false;

    // Minimap: lop o ve vao canvas dem, chi ve lai khi ban do doi (revision).
    // Moi khung hinh chi blit + ve cham nguoi choi -> bo vong lap 240 o moi frame.
    this._mmCanvas = document.createElement("canvas");
    this._mmCanvas.width = 40; this._mmCanvas.height = 24; // 20x12 o, scale 2
    this._mmCacheCtx = this._mmCanvas.getContext("2d");
    this._mmCacheCtx.imageSmoothingEnabled = false;
    this._mmRev = -1;
    this.pctx = document.getElementById("portrait").getContext("2d");
    this.pctx.imageSmoothingEnabled = false;

    // Trang thai hop thoai (hieu ung chay chu).
    this._dlgFull = null;
    this._dlgStart = 0;
    this._dlgDone = false;

    this._wireButtons();
  }

  /** Font UI (Pixelify Sans/Handjet) hỗ trợ tiếng Việt -> giữ nguyên dấu. */
  label(s) {
    return (s || "").trim();
  }

  say(name, text) {
    this.elDName.textContent = name;
    this._dlgFull = text;
    this._dlgStart = performance.now();
    this._dlgDone = false;
    this.elDText.textContent = "";
    this.elDCur.classList.remove("show");
  }

  /** Chay chu kieu RPG; goi moi khung hinh. */
  _tickDialog() {
    if (this._dlgFull == null || this._dlgDone) return;
    const TYPE = 48; // ky tu / giay
    const n = Math.floor((performance.now() - this._dlgStart) / 1000 * TYPE);
    if (n >= this._dlgFull.length) {
      this.elDText.textContent = this._dlgFull;
      this._dlgDone = true;
      this.elDCur.classList.add("show");
    } else {
      this.elDText.textContent = this._dlgFull.slice(0, n);
    }
  }

  _wireButtons() {
    document.querySelectorAll("#game-console .btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._onCmd(btn.dataset.cmd);
        btn.classList.add("pressed");
        setTimeout(() => btn.classList.remove("pressed"), 110);
        btn.blur();
      });
    });
  }

  _onCmd(cmd) {
    const g = this.game, s = g.stats;
    if (cmd === "bag") {
      this.say("TÚI ĐỒ", "Đậu Thần x" + g.beans + "  ·  Cuốc  ·  Bình tưới  ·  Hạt giống.");
    } else if (cmd === "map") {
      this.say("BẢN ĐỒ", "Nông trại Saiyan Valley. Cuốc đất (E) để mở rộng vùng trồng trọt.");
    } else if (cmd === "char") {
      this.say("NHÂN VẬT", this.label(g.character.name) + "  ·  LV" + s.level +
        "  ·  HP " + Math.round(s.hp) + "/" + s.maxHp + "  KI " + Math.round(s.ki) + "/" + s.maxKi);
    }
  }

  /** Goi moi khung hinh trong Game.render(). */
  update(game) {
    const s = game.stats;
    const hpW = Math.round(s.hp / s.maxHp * 100);
    const kiW = Math.round(s.ki / s.maxKi * 100);

    if (hpW !== this._p.hp) { this.elHp.style.width = hpW + "%"; this.elHpT.textContent = Math.round(s.hp) + "/" + s.maxHp; this._p.hp = hpW; }
    if (kiW !== this._p.ki) { this.elKi.style.width = kiW + "%"; this.elKiT.textContent = Math.round(s.ki) + "/" + s.maxKi; this._p.ki = kiW; }
    if (game.beans !== this._p.beans) { this.elBean.textContent = game.beans; this._p.beans = game.beans; }

    const nm = this.label(game.character.name);
    if (nm !== this._p.name) { this.elName.textContent = nm; this._p.name = nm; }
    const lv = "LV " + s.level;
    if (lv !== this._p.lv) { this.elLv.textContent = lv; this._p.lv = lv; }

    this._tickDialog();
    this._drawMinimap(game);
  }

  _drawMinimap(game) {
    const w = game.world, p = game.player, ctx = this.mmctx, s = 2;

    // Lop o chi ve lai vao canvas dem khi ban do thay doi (cuoc/trong/tuoi/thu/chin).
    if (this._mmRev !== w.revision) {
      const mc = this._mmCacheCtx;
      for (let r = 0; r < w.rows; r++) {
        for (let c = 0; c < w.cols; c++) {
          let col = (w.tiles[r][c] === TILE_SOIL) ? "#6b4a2b" : (((c + r) % 2) ? "#447540" : "#4a7c45");
          const crop = w.crops.get(c + "," + r);
          if (crop) col = (crop.stage >= CROP_MAX_STAGE) ? "#ffd11a" : "#43a047";
          mc.fillStyle = col;
          mc.fillRect(c * s, r * s, s, s);
        }
      }
      this._mmRev = w.revision;
    }
    ctx.drawImage(this._mmCanvas, 0, 0); // blit lop o (xoa luon cham frame truoc)

    // Cham nguoi choi nhap nhay.
    if (Math.floor(performance.now() / 380) % 2 === 0) {
      const pc = Math.floor((p.x + p.width / 2) / TILE_SIZE);
      const pr = Math.floor((p.y + p.height / 2) / TILE_SIZE);
      ctx.fillStyle = "#ff4d4d";
      ctx.fillRect(pc * s, pr * s, s, s);
    }
  }

  /** Ve chan dung tu sprite nhan vat (da to mau trang phuc). */
  drawPortrait() {
    const p = this.game.player, ctx = this.pctx;
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#0e1838";
    ctx.fillRect(0, 0, 32, 32);

    const img = p._tinted || (p.spriteLoaded ? p.sprite : null);
    if (img) {
      ctx.drawImage(img, 0, 0, 32, 32, 0, 0, 32, 32);
    } else {
      // Chua co sprite -> ve khoi tam theo mau trang phuc.
      ctx.fillStyle = p.outfitColor; ctx.fillRect(10, 15, 12, 10);
      ctx.fillStyle = "#f1c592";    ctx.fillRect(11, 6, 10, 9);
      ctx.fillStyle = "#5c3a1e";    ctx.fillRect(10, 4, 12, 4);
    }
  }
}
