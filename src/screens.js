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
    this.auth.ensureDemoAccount(); // tài khoản demo: admin / 1234
    this.username = null;
    this.game = null;
    this.mode = "login"; // "login" | "register"

    // Danh sách nhân vật (sprite) chọn được khi tạo nhân vật.
    this.characters = [
      { id: "hero",   name: "Anh Hùng", sprite: "sprites/player.png" },
      { id: "knight", name: "Hiệp Sĩ",  sprite: "sprites/knight.png" },
      { id: "king",   name: "Vua",       sprite: "sprites/king.png" },
      { id: "ninja",  name: "Ninja",     sprite: "sprites/ninja.png" },
      { id: "mage",   name: "Phù Thủy",  sprite: "sprites/mage.png" },
      { id: "archer", name: "Cung Thủ",  sprite: "sprites/archer.png" },
    ];
    this.selectedChar = this.characters[0];

    this._cacheDom();
    this._buildCharSwatches();
    this._bindAuth();
    this._bindCharCreate();

    // Cảnh nền động cho màn hình tiêu đề (chỉ chạy khi đang ở màn đăng nhập).
    this.titleFX = new TitleFX(this.titleCanvas);

    // Nhân vật xem trước (preview) cho màn tạo nhân vật.
    // Đặt vị trí để sprite 32x32 lọt trọn trong canvas 32x40.
    this._previewPlayer = new Player(10, 20, {
      spritePath: this.selectedChar.sprite,
    });
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
    this.elConsole = document.getElementById("game-console");
    this.elAuth = document.getElementById("auth-screen");
    this.elChar = document.getElementById("char-screen");
    this.titleCanvas = document.getElementById("title-bg");

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
    this.elCharSwatches = document.getElementById("char-swatches");
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
  /** Tạo các ô chọn nhân vật (thumbnail sprite). */
  _buildCharSwatches() {
    this.characters.forEach((ch) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "char-swatch";
      b.dataset.id = ch.id;
      b.title = ch.name;
      b.style.backgroundImage = 'url("' + ch.sprite + '")';
      b.addEventListener("click", () => this._selectChar(ch));
      this.elCharSwatches.appendChild(b);
    });
  }

  _bindCharCreate() {
    this.btnCharStart.addEventListener("click", () => this._startGame());
    this.btnCharBack.addEventListener("click", () => this._logout());
  }

  _goToCharCreate() {
    const saved = this.auth.getCharacter(this.username);
    this.elCharName.value = (saved && saved.name) ? saved.name : this.username;

    const character = saved ? this.characters.find((c) => c.id === saved.charId) : null;
    this._selectChar(character || this.characters[0]);

    this._charMsg("");
    this._showScreen(this.elChar);
    this._renderPreview();
  }

  _selectChar(ch) {
    this.selectedChar = ch;
    // Tô đậm viền ô nhân vật đang chọn.
    this.elCharSwatches.querySelectorAll(".char-swatch").forEach((b) => {
      b.classList.toggle("selected", b.dataset.id === ch.id);
    });
    if (this._previewPlayer) {
      this._previewPlayer.setSprite(ch.sprite); // nạp xong sẽ tự gọi _renderPreview qua onReady
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
      charId: this.selectedChar.id,
      sprite: this.selectedChar.sprite,
    };
    this.auth.saveCharacter(this.username, character);

    this._hideAll();
    this.titleFX.stop();
    this.elConsole.classList.remove("hidden");
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
    this.elConsole.classList.add("hidden");
    el.classList.remove("hidden");
    if (el === this.elAuth) this.titleFX.start();
    else this.titleFX.stop();
  }
  _hideAll() {
    this.elAuth.classList.add("hidden");
    this.elChar.classList.add("hidden");
  }
}
