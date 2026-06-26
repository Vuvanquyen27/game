"use strict";

/**
 * TitleFX: cảnh nền pixel art động cho màn hình tiêu đề / đăng nhập.
 * Bình minh kiểu Namek + Ngọc Rồng 4 sao phát quầng sáng mọc trên thung lũng,
 * sao lấp lánh, mây trôi, đồi + nông trại bóng đổ, hạt KI bay lên.
 * Vẽ ở 192x108 (16:9) rồi phủ kín (object-fit:cover) + image pixelated.
 */
class TitleFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.W = 192; this.H = 108;
    canvas.width = this.W; canvas.height = this.H;

    this._running = false;
    this._t = 0;
    this._last = 0;
    this._loop = this._loop.bind(this);

    // Sao (vị trí cố định, lấp lánh theo pha riêng).
    this._stars = [];
    for (let i = 0; i < 50; i++) {
      this._stars.push({
        x: (this._r(i, 1) * this.W) | 0,
        y: (this._r(i, 2) * 60) | 0,
        ph: this._r(i, 3) * 6.28,
        sp: 1.4 + this._r(i, 4) * 2.6,
      });
    }
    this._clouds = [{ x: 26, y: 24, s: 1.0 }, { x: 110, y: 34, s: 1.5 }, { x: 168, y: 18, s: 0.8 }];
    this._sparks = [];
  }

  /** PRNG xác định. */
  _r(i, s) {
    let n = ((i + 1) * 374761393 + s * 668265263) >>> 0;
    n = ((n ^ (n >>> 13)) * 1274126177) >>> 0;
    return (n % 1000) / 1000;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    requestAnimationFrame(this._loop);
  }
  stop() { this._running = false; }

  _loop(now) {
    if (!this._running) return;
    let dt = (now - this._last) / 1000; this._last = now;
    if (dt > 0.1) dt = 0.1;
    this._t += dt;
    this._update(dt);
    this._render();
    requestAnimationFrame(this._loop);
  }

  _update(dt) {
    for (const c of this._clouds) { c.x += dt * (3 + c.s * 2); if (c.x > this.W + 26) c.x = -26; }
    // Sinh hạt KI bay lên từ thung lũng.
    if (Math.random() < dt * 7) {
      this._sparks.push({ x: 24 + Math.random() * (this.W - 48), y: 80 + Math.random() * 8, vy: 8 + Math.random() * 12, life: 1 });
    }
    for (const s of this._sparks) { s.y -= s.vy * dt; s.life -= dt * 0.55; }
    this._sparks = this._sparks.filter((s) => s.life > 0 && s.y > 2);
  }

  // ---- helpers vẽ ----
  _disc(cx, cy, rad) {
    const ctx = this.ctx;
    for (let dy = -rad; dy <= rad; dy++) {
      const w = Math.floor(Math.sqrt(rad * rad - dy * dy));
      ctx.fillRect((cx - w) | 0, (cy + dy) | 0, w * 2 + 1, 1);
    }
  }
  _backY(x) { return Math.floor(80 - 6 * (0.5 * (1 + Math.sin(x * 0.045 + 1.3)))); }
  _frontY(x) { return Math.floor(92 - 8 * (0.5 * (1 + Math.sin(x * 0.06 + 0.2)))); }

  _render() {
    const ctx = this.ctx, W = this.W;

    // 1) Bầu trời (dải màu + dither nhẹ ở ranh giới).
    const bands = ["#171042", "#3a1c5c", "#7a2b6b", "#c24a5e", "#e8915a", "#f4c777"];
    const ys = [0, 22, 40, 54, 64, 70, 74];
    for (let i = 0; i < bands.length; i++) {
      ctx.fillStyle = bands[i];
      ctx.fillRect(0, ys[i], W, ys[i + 1] - ys[i]);
      if (i + 1 < bands.length) {
        ctx.fillStyle = bands[i + 1];
        for (let x = (i % 2); x < W; x += 2) ctx.fillRect(x, ys[i + 1] - 1, 1, 1);
      }
    }

    // 2) Sao lấp lánh.
    for (const st of this._stars) {
      const b = 0.5 + 0.5 * Math.sin(this._t * st.sp + st.ph);
      if (b <= 0.4) continue;
      ctx.globalAlpha = b;
      ctx.fillStyle = "#fff7d6";
      ctx.fillRect(st.x, st.y, 1, 1);
      if (b > 0.86) { // sao sáng: thêm 4 tia
        ctx.fillRect(st.x, st.y - 1, 1, 1); ctx.fillRect(st.x, st.y + 1, 1, 1);
        ctx.fillRect(st.x - 1, st.y, 1, 1); ctx.fillRect(st.x + 1, st.y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;

    // 3) Ngọc Rồng + quầng sáng.
    const ox = 120, oy = 44 + Math.round(Math.sin(this._t * 0.6) * 2), rad = 15;
    const pulse = 0.16 + 0.07 * Math.sin(this._t * 1.5);
    ctx.fillStyle = "rgba(255,170,70," + pulse.toFixed(3) + ")"; this._disc(ox, oy, rad + 13);
    ctx.fillStyle = "rgba(255,205,110," + (pulse + 0.07).toFixed(3) + ")"; this._disc(ox, oy, rad + 6);
    ctx.fillStyle = "#cf5f0c"; this._disc(ox, oy, rad);          // viền cam đậm
    ctx.fillStyle = "#f08a1e"; this._disc(ox, oy - 1, rad - 2);  // thân
    ctx.fillStyle = "#f9b24a"; this._disc(ox - 3, oy - 3, rad - 5); // mặt sáng
    ctx.fillStyle = "#ffe6a8"; this._disc(ox - 5, oy - 5, 3);    // điểm chói
    // 4 ngôi sao đỏ
    ctx.fillStyle = "#d2202a";
    const star = (sx, sy) => { ctx.fillRect(sx, sy - 1, 1, 3); ctx.fillRect(sx - 1, sy, 3, 1); };
    star(ox - 5, oy - 1); star(ox + 5, oy - 1); star(ox - 3, oy + 6); star(ox + 4, oy + 6);

    // 4) Mây trôi (trước Ngọc Rồng).
    for (const c of this._clouds) {
      const x = c.x | 0, y = c.y | 0, w = (12 * c.s) | 0, h = (3 * c.s) | 0 || 3;
      ctx.globalAlpha = 0.55; ctx.fillStyle = "#f3cdd9";
      ctx.fillRect(x, y, w, h);
      ctx.fillRect(x + (w / 4 | 0), y - h + 1, (w / 2) | 0, h);
      ctx.globalAlpha = 1;
    }

    // 5) Đồi sau (tím) + đồi trước (gần đen).
    ctx.fillStyle = "#3a2150";
    for (let x = 0; x < W; x++) { const y = this._backY(x); ctx.fillRect(x, y, 1, this.H - y); }
    ctx.fillStyle = "#160d22";
    for (let x = 0; x < W; x++) { const y = this._frontY(x); ctx.fillRect(x, y, 1, this.H - y); }

    // 6) Nông trại bóng đổ trên đồi trước (nhà + 2 cây) + viền sáng từ Ngọc Rồng.
    this._farmhouse(46);
    this._tree(150); this._tree(167);

    // 7) Hạt KI bay lên.
    for (const s of this._sparks) {
      ctx.globalAlpha = Math.min(1, s.life);
      ctx.fillStyle = s.life > 0.5 ? "#ffe27a" : "#ff9a3a";
      ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  _farmhouse(hx) {
    const ctx = this.ctx, by = this._frontY(hx);
    ctx.fillStyle = "#0d0716";
    ctx.fillRect(hx, by - 9, 13, 9);          // thân
    for (let i = 0; i < 7; i++) ctx.fillRect(hx - 1 + i, by - 9 - i, 13 - (i * 2 - 0), 1); // mái (tam giác)
    // viền sáng cạnh trái (hướng Ngọc Rồng)
    ctx.fillStyle = "#6b4a7a";
    ctx.fillRect(hx, by - 9, 1, 9);
    for (let i = 0; i < 7; i++) ctx.fillRect(hx - 1 + i, by - 9 - i, 1, 1);
  }

  _tree(tx) {
    const ctx = this.ctx, by = this._frontY(tx);
    ctx.fillStyle = "#0d0716";
    ctx.fillRect(tx, by - 5, 2, 5);           // thân
    this._disc(tx + 1, by - 8, 4);            // tán
    ctx.fillStyle = "#5a3a55";                // viền sáng
    ctx.fillRect(tx - 3, by - 9, 1, 1); ctx.fillRect(tx - 2, by - 11, 1, 1);
  }
}
