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
    this.elPow   = document.getElementById("hud-pow");
    this.elTn    = document.getElementById("tnfill");
    this.elTnT   = document.getElementById("tntext");
    this.elDName = document.getElementById("dlgname");
    this.elDText = document.getElementById("dlgtext");
    this.elDCur  = document.getElementById("dlgcursor");

    // Minimap: scale tinh theo kich thuoc the gioi (khop khung CSS ~80px ngang).
    const w = game.world;
    this._mmScale = Math.max(1, Math.floor(80 / w.cols)); // 40 o -> scale 2
    const mmW = w.cols * this._mmScale, mmH = w.rows * this._mmScale;
    const mmEl = document.getElementById("minimap");
    mmEl.width = mmW; mmEl.height = mmH; // dat lai do phan giai noi bo theo the gioi
    this.mmctx = mmEl.getContext("2d");
    this.mmctx.imageSmoothingEnabled = false;

    // Minimap: lop o ve vao canvas dem, chi ve lai khi ban do doi (revision).
    // Moi khung hinh chi blit + ve cham nguoi choi -> bo vong lap toan bo o moi frame.
    this._mmCanvas = document.createElement("canvas");
    this._mmCanvas.width = mmW; this._mmCanvas.height = mmH;
    this._mmCacheCtx = this._mmCanvas.getContext("2d");
    this._mmCacheCtx.imageSmoothingEnabled = false;
    this._mmRev = -1;
    this.pctx = document.getElementById("portrait").getContext("2d");
    this.pctx.imageSmoothingEnabled = false;

    // Tieu de minimap -> hien ten khu vuc dang o (cap nhat khi doi khu).
    this.elMmTitle = document.querySelector("#game-console .mm-title");

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

  /** Cap nhat ten khu vuc hien tai len tieu de minimap. */
  setZoneName(name) {
    if (this.elMmTitle) this.elMmTitle.textContent = name || "BẢN ĐỒ";
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
    if (cmd === "eat") {
      g.eatBean();
    } else if (cmd === "bag") {
      this.say("TÚI ĐỒ", "Đậu Thần x" + g.beans + "  ·  Cuốc  ·  Bình tưới  ·  Hạt giống.");
    } else if (cmd === "map") {
      this.say("BẢN ĐỒ", "Đang ở khu " + g.world.zoneName + ". Đi tới mép bản đồ để sang khu kế bên.");
    } else if (cmd === "char") {
      this.say("NHÂN VẬT", this.label(g.character.name) + "  ·  LV" + s.level + "  ·  SĐ " + s.power +
        "  ·  HP " + Math.round(s.hp) + "/" + s.maxHp + "  KI " + Math.round(s.ki) + "/" + s.maxKi +
        "  ·  Tiềm Năng " + s.potential + "/" + s.potentialMax);
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

    const tnW = Math.round(s.potential / s.potentialMax * 100);
    if (tnW !== this._p.tn) { this.elTn.style.width = tnW + "%"; this.elTnT.textContent = s.potential + "/" + s.potentialMax; this._p.tn = tnW; }
    const pow = "SĐ " + (game.powerUp ? Math.round(s.power * 1.5) + "!" : s.power);
    if (pow !== this._p.pow) { this.elPow.textContent = pow; this._p.pow = pow; }

    const nm = this.label(game.character.name);
    if (nm !== this._p.name) { this.elName.textContent = nm; this._p.name = nm; }
    const lv = "LV " + s.level;
    if (lv !== this._p.lv) { this.elLv.textContent = lv; this._p.lv = lv; }

    this._tickDialog();
    this._drawMinimap(game);
  }

  _drawMinimap(game) {
    const w = game.world, p = game.player, ctx = this.mmctx, s = this._mmScale;

    // Lop o chi ve lai vao canvas dem khi ban do thay doi (cuoc/trong/tuoi/thu/chin/doi khu).
    if (this._mmRev !== w.revision) {
      const mc = this._mmCacheCtx, th = w.theme;
      for (let r = 0; r < w.rows; r++) {
        for (let c = 0; c < w.cols; c++) {
          const t = w.tiles[r][c];
          let col = (t === TILE_SOIL) ? th.soilDry : (t === TILE_ROCK) ? th.rkBase : (((c + r) % 2) ? th.gB : th.gA);
          const crop = w.crops.get(c + "," + r);
          if (crop) col = (crop.stage >= CROP_MAX_STAGE) ? "#ffd11a" : "#43a047";
          mc.fillStyle = col;
          mc.fillRect(c * s, r * s, s, s);
        }
      }
      this._mmRev = w.revision;
    }
    ctx.drawImage(this._mmCanvas, 0, 0); // blit lop o (xoa luon cham frame truoc)

    // Khung camera: phan ban do dang hien tren man hinh (giup dinh huong khi map rong).
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(game.camX / TILE_SIZE * s) + 0.5,
      Math.round(game.camY / TILE_SIZE * s) + 0.5,
      Math.round(GAME_WIDTH / TILE_SIZE * s) - 1,
      Math.round(GAME_HEIGHT / TILE_SIZE * s) - 1
    );

    // Cham nguoi choi nhap nhay.
    if (Math.floor(performance.now() / 380) % 2 === 0) {
      const pc = Math.floor((p.x + p.width / 2) / TILE_SIZE);
      const pr = Math.floor((p.y + p.height / 2) / TILE_SIZE);
      ctx.fillStyle = "#ff4d4d";
      ctx.fillRect(pc * s, pr * s, s, s);
    }
  }

  /** Ve chan dung tu sprite nhan vat. */
  drawPortrait() {
    const p = this.game.player, ctx = this.pctx;
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#0e1838";
    ctx.fillRect(0, 0, 32, 32);

    const img = p.spriteLoaded ? p.sprite : null;
    if (img) {
      ctx.drawImage(img, 0, 0, 32, 32, 0, 0, 32, 32);
    } else {
      // Chua co sprite -> ve khoi tam.
      ctx.fillStyle = "#ff7b00"; ctx.fillRect(10, 15, 12, 10);
      ctx.fillStyle = "#f1c592";    ctx.fillRect(11, 6, 10, 9);
      ctx.fillStyle = "#5c3a1e";    ctx.fillRect(10, 4, 12, 4);
    }
  }
}
