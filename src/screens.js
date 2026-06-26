"use strict";

/**
 * Điều phối các MÀN HÌNH trước game:
 *   Đăng nhập / Đăng ký  ->  Tạo nhân vật  ->  Game.
 *
 * Các màn hình là lớp phủ HTML (DOM) đặt trên canvas. Game chỉ khởi động
 * sau khi người chơi đã đăng nhập và tạo (hoặc xác nhận) nhân vật.
 */
class ScreenManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.auth = new Auth();
    this.username = null;
    this.game = null;
    this.mode = "login"; // "login" | "register"

    // Bảng màu trang phục để chọn khi tạo nhân vật.
    this.outfits = [
      { id: "orange", name: "Cam (Songoku)", color: "#ff7b00" },
      { id: "blue",   name: "Xanh dương",    color: "#1e88e5" },
      { id: "red",    name: "Đỏ",            color: "#e53935" },
      { id: "purple", name: "Tím",           color: "#8e24aa" },
      { id: "green",  name: "Xanh lá",       color: "#43a047" },
    ];
    this.selectedOutfit = this.outfits[0];

    this._cacheDom();
    this._buildSwatches();
    this._bindAuth();
    this._bindCharCreate();

    // Nhân vật xem trước (preview) cho màn tạo nhân vật.
    // Đặt vị trí để sprite 32x32 lọt trọn trong canvas 32x40.
    this._previewPlayer = new Player(10, 20, { outfitColor: this.selectedOutfit.color });
    this._previewPlayer.onReady = () => this._renderPreview();
  }

  /** Bắt đầu luồng: đã đăng nhập sẵn thì vào thẳng tạo nhân vật, chưa thì đăng nhập. */
  begin() {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.username = user;
      this._goToCharCreate();
    } else {
      this._showScreen(this.elAuth);
    }
  }

  // ---------- Lưu tham chiếu DOM ----------
  _cacheDom() {
    this.elAuth = document.getElementById("auth-screen");
    this.elChar = document.getElementById("char-screen");

    this.tabLogin = document.getElementById("tab-login");
    this.tabRegister = document.getElementById("tab-register");
    this.authForm = document.getElementById("auth-form");
    this.elUsername = document.getElementById("auth-username");
    this.elPassword = document.getElementById("auth-password");
    this.confirmRow = document.getElementById("auth-confirm-row");
    this.elConfirm = document.getElementById("auth-confirm");
    this.authMsg = document.getElementById("auth-msg");
    this.authSubmit = document.getElementById("auth-submit");

    this.elPreview = document.getElementById("char-preview");
    this.elCharName = document.getElementById("char-name");
    this.elSwatches = document.getElementById("outfit-swatches");
    this.charMsg = document.getElementById("char-msg");
    this.btnCharStart = document.getElementById("char-start");
    this.btnCharBack = document.getElementById("char-back");
  }

  // ---------- Màn đăng nhập / đăng ký ----------
  _bindAuth() {
    this.tabLogin.addEventListener("click", () => this._setMode("login"));
    this.tabRegister.addEventListener("click", () => this._setMode("register"));
    this.authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this._submitAuth();
    });
  }

  _setMode(mode) {
    this.mode = mode;
    const isRegister = mode === "register";
    this.tabLogin.classList.toggle("active", !isRegister);
    this.tabRegister.classList.toggle("active", isRegister);
    this.confirmRow.classList.toggle("hidden", !isRegister);
    this.authSubmit.textContent = isRegister ? "ĐĂNG KÝ" : "ĐĂNG NHẬP";
    this._authMsg("");
  }

  _submitAuth() {
    const u = this.elUsername.value;
    const p = this.elPassword.value;

    if (this.mode === "register") {
      if (p !== this.elConfirm.value) return this._authMsg("Mật khẩu nhập lại không khớp.");
      const reg = this.auth.register(u, p);
      if (!reg.ok) return this._authMsg(reg.error);
      // Đăng ký xong tự đăng nhập luôn.
      this.auth.login(u, p);
      this.username = reg.username;
      this._goToCharCreate();
    } else {
      const res = this.auth.login(u, p);
      if (!res.ok) return this._authMsg(res.error);
      this.username = res.username;
      this._goToCharCreate();
    }
  }

  _authMsg(text) { this.authMsg.textContent = text || ""; }

  // ---------- Màn tạo nhân vật ----------
  _buildSwatches() {
    this.outfits.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.dataset.id = o.id;
      b.style.background = o.color;
      b.title = o.name;
      b.addEventListener("click", () => this._selectOutfit(o));
      this.elSwatches.appendChild(b);
    });
  }

  _bindCharCreate() {
    this.btnCharStart.addEventListener("click", () => this._startGame());
    this.btnCharBack.addEventListener("click", () => this._logout());
  }

  _goToCharCreate() {
    const saved = this.auth.getCharacter(this.username);
    this.elCharName.value = (saved && saved.name) ? saved.name : this.username;

    const outfit = saved ? this.outfits.find((o) => o.color === saved.outfitColor) : null;
    this._selectOutfit(outfit || this.outfits[0]);

    this._charMsg("");
    this._showScreen(this.elChar);
    this._renderPreview();
  }

  _selectOutfit(outfit) {
    this.selectedOutfit = outfit;
    // Tô đậm viền ô màu đang chọn.
    this.elSwatches.querySelectorAll(".swatch").forEach((b) => {
      b.classList.toggle("selected", b.dataset.id === outfit.id);
    });
    if (this._previewPlayer) {
      this._previewPlayer.setOutfit(outfit.color);
      this._renderPreview();
    }
  }

  /** Vẽ nhân vật xem trước (canvas nhỏ 20x24, CSS phóng to). */
  _renderPreview() {
    const ctx = this.elPreview.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.elPreview.width, this.elPreview.height);
    this._previewPlayer.facing = "down";
    this._previewPlayer.render(ctx);
  }

  _startGame() {
    const name = (this.elCharName.value || "").trim();
    if (name.length < 1) return this._charMsg("Hãy đặt tên cho nhân vật.");

    const character = {
      name,
      outfitColor: this.selectedOutfit.color,
      outfitId: this.selectedOutfit.id,
    };
    this.auth.saveCharacter(this.username, character);

    this._hideAll();
    this.game = new Game(this.canvas, character);
    this.game.start();
  }

  _charMsg(text) { this.charMsg.textContent = text || ""; }

  _logout() {
    this.auth.logout();
    this.username = null;
    this._setMode("login");
    this.elPassword.value = "";
    this._showScreen(this.elAuth);
  }

  // ---------- Tiện ích hiển thị ----------
  _showScreen(el) {
    this._hideAll();
    el.classList.remove("hidden");
  }
  _hideAll() {
    this.elAuth.classList.add("hidden");
    this.elChar.classList.add("hidden");
  }
}
