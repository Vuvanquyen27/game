// Đặt lại mật khẩu cho 1 user + verify đăng nhập thật.
// Chạy: node scripts/set-password.mjs <email> <matkhau-moi>
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !service || !anon) { console.error('❌ Thiếu URL/SERVICE/ANON key trong .env.local'); process.exit(1); }

const email = (process.argv[2] || '').toLowerCase().trim();
const newPass = process.argv[3] || '';
if (!email || !newPass) { console.error('Dùng: node scripts/set-password.mjs <email> <matkhau-moi>'); process.exit(1); }
if (newPass.length < 6) { console.error('❌ Mật khẩu phải ≥ 6 ký tự (app yêu cầu).'); process.exit(1); }

const admin = createClient(url, service, { auth: { persistSession: false } });

// tìm user
const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listErr) { console.error('❌ Lỗi list users:', listErr.message); process.exit(1); }
const u = list.users.find((x) => (x.email || '').toLowerCase() === email);
if (!u) { console.error(`❌ Không có user "${email}".`); process.exit(2); }

// đặt lại mật khẩu + đảm bảo đã confirm email
const { error: updErr } = await admin.auth.admin.updateUserById(u.id, {
  password: newPass,
  email_confirm: true,
});
if (updErr) { console.error('❌ Lỗi đặt mật khẩu:', updErr.message); process.exit(1); }
console.log(`… Đã đặt mật khẩu mới cho ${email} và confirm email.`);

// verify: đăng nhập thật bằng anon key (giống hệt app)
const pub = createClient(url, anon, { auth: { persistSession: false } });
const { data: signIn, error: signErr } = await pub.auth.signInWithPassword({ email, password: newPass });
if (signErr) { console.error('❌ Đăng nhập thử THẤT BẠI:', signErr.message); process.exit(1); }
console.log('✅ Đăng nhập thử THÀNH CÔNG. user id:', signIn.user?.id);

// role
const { data: prof } = await admin.from('profiles').select('role').eq('id', u.id).single();
console.log(`✅ Role hiện tại: ${prof?.role?.toUpperCase()}`);
console.log(`\n➡️  Đăng nhập tại http://localhost:3000/admin/login`);
console.log(`    Email:    ${email}`);
console.log(`    Mật khẩu: ${newPass}`);
