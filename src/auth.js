"use strict";

/**
 * Quản lý tài khoản (đăng nhập / đăng ký) — lưu CỤC BỘ bằng localStorage.
 *
 * LƯU Ý BẢO MẬT: Đây là prototype chạy thẳng trên trình duyệt (không có server),
 * nên mật khẩu chỉ được "băm" nhẹ để tránh lưu dạng thô. ĐÂY KHÔNG phải bảo mật
 * thật — khi nào có backend thì thay phần xác thực này.
 *
 * Khi mở bằng file:// (double-click), vài trình duyệt có thể chặn localStorage.
 * Ta bọc đọc/ghi trong try/catch và có bộ nhớ tạm (_mem) để không bị lỗi cứng.
 */
class Auth {
  constructor() {
    this.ACCOUNTS_KEY = "sv_accounts";
    this.CURRENT_KEY = "sv_current_user";
    this._mem = {}; // dự phòng khi localStorage không dùng được
  }

  // ---------- Lưu trữ an toàn ----------
  _get(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return (key in this._mem) ? this._mem[key] : null; }
  }
  _set(key, val) {
    this._mem[key] = val;
    try { localStorage.setItem(key, val); } catch (e) { /* dùng _mem thay thế */ }
  }
  _remove(key) {
    delete this._mem[key];
    try { localStorage.removeItem(key); } catch (e) { /* bỏ qua */ }
  }

  _loadAccounts() {
    try { return JSON.parse(this._get(this.ACCOUNTS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  _saveAccounts(accounts) {
    this._set(this.ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  /** Băm nhẹ (djb2) — chỉ để không lưu mật khẩu dạng thô. KHÔNG an toàn cho thật. */
  _hash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return String(h >>> 0);
  }

  /** Tên đăng nhập dùng làm khóa (không phân biệt hoa/thường). */
  _id(username) { return (username || "").trim().toLowerCase(); }

  /** Đăng ký tài khoản mới. Trả về { ok, error? }. */
  register(username, password) {
    const name = (username || "").trim();
    if (name.length < 3) return { ok: false, error: "Tên đăng nhập cần ít nhất 3 ký tự." };
    if ((password || "").length < 4) return { ok: false, error: "Mật khẩu cần ít nhất 4 ký tự." };

    const accounts = this._loadAccounts();
    if (accounts[this._id(name)]) return { ok: false, error: "Tên đăng nhập đã tồn tại." };

    accounts[this._id(name)] = { username: name, pass: this._hash(password) };
    this._saveAccounts(accounts);
    return { ok: true, username: name };
  }

  /** Đăng nhập. Trả về { ok, username?, error? }. */
  login(username, password) {
    const accounts = this._loadAccounts();
    const acc = accounts[this._id(username)];
    if (!acc) return { ok: false, error: "Tài khoản không tồn tại." };
    if (acc.pass !== this._hash(password)) return { ok: false, error: "Sai mật khẩu." };
    this.setCurrentUser(acc.username);
    return { ok: true, username: acc.username };
  }

  setCurrentUser(username) { this._set(this.CURRENT_KEY, username); }
  getCurrentUser() { return this._get(this.CURRENT_KEY); }
  logout() { this._remove(this.CURRENT_KEY); }

  // ---------- Nhân vật theo từng tài khoản ----------

  _charKey(username) { return "sv_char_" + this._id(username); }

  /** Lấy nhân vật đã tạo của tài khoản (hoặc null nếu chưa có). */
  getCharacter(username) {
    try { return JSON.parse(this._get(this._charKey(username))) || null; }
    catch (e) { return null; }
  }

  /** Lưu nhân vật cho tài khoản. */
  saveCharacter(username, character) {
    this._set(this._charKey(username), JSON.stringify(character));
  }
}
