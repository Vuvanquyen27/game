// Kiểm tra tài khoản Auth + nâng quyền admin cho profile.
// Dùng service_role (bypass RLS). Chạy: node scripts/promote-admin.mjs [email]
// Nếu không truyền email -> dùng ADMIN_EMAIL trong .env.local.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- đọc .env.local ---
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('❌ Thiếu URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local'); process.exit(1); }

const target = (process.argv[2] || env.ADMIN_EMAIL || '').toLowerCase().trim();
const sb = createClient(url, key, { auth: { persistSession: false } });

// --- 1) liệt kê tài khoản Auth ---
const { data: list, error: listErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listErr) { console.error('❌ Lỗi đọc danh sách user Auth:', listErr.message); process.exit(1); }

console.log(`\n=== Tài khoản trong Supabase Auth (${list.users.length}) ===`);
for (const u of list.users) {
  console.log(`   • ${u.email}  | confirmed: ${u.email_confirmed_at ? 'CÓ' : 'CHƯA'}  | id: ${u.id}`);
}

// --- 2) đọc profiles + role ---
const { data: profs, error: profErr } = await sb.from('profiles').select('id,email,role');
if (profErr) { console.error('❌ Lỗi đọc profiles:', profErr.message); process.exit(1); }
const roleByEmail = Object.fromEntries((profs || []).map((p) => [(p.email || '').toLowerCase(), p]));
console.log(`\n=== Profiles (${profs.length}) ===`);
for (const p of profs) console.log(`   • ${p.email}  -> role: ${p.role}`);

// --- 3) tìm user cần nâng quyền ---
console.log(`\n=== Mục tiêu nâng quyền admin: ${target || '(không xác định)'} ===`);
const authUser = list.users.find((u) => (u.email || '').toLowerCase() === target);
if (!authUser) {
  console.error(`❌ Không tìm thấy tài khoản Auth với email "${target}".`);
  console.error('   -> Kiểm tra lại email đã tạo, hoặc truyền đúng email: node scripts/promote-admin.mjs email@ban.com');
  process.exit(2);
}
if (!authUser.email_confirmed_at) {
  console.warn('⚠️  Tài khoản CHƯA được confirm email. Vào Supabase → Auth → Users → user này → bật "Auto Confirm"/confirm, nếu không sẽ khó đăng nhập.');
}

// --- 4) đảm bảo có profile + role = admin ---
let prof = roleByEmail[target];
if (!prof) {
  console.log('… Profile chưa có (trigger có thể chưa chạy). Tạo mới với role admin…');
  const { error } = await sb.from('profiles').insert({ id: authUser.id, email: authUser.email, role: 'admin' });
  if (error) { console.error('❌ Lỗi tạo profile:', error.message); process.exit(1); }
} else if (prof.role !== 'admin') {
  console.log(`… Profile đang role "${prof.role}", nâng lên "admin"…`);
  const { error } = await sb.from('profiles').update({ role: 'admin' }).eq('id', authUser.id);
  if (error) { console.error('❌ Lỗi cập nhật role:', error.message); process.exit(1); }
} else {
  console.log('… Profile đã là admin sẵn rồi.');
}

// --- 5) xác minh ---
const { data: after, error: afterErr } = await sb.from('profiles').select('email,role').eq('id', authUser.id).single();
if (afterErr) { console.error('❌ Lỗi xác minh:', afterErr.message); process.exit(1); }
console.log(`\n✅ XONG. ${after.email} hiện có role: ${after.role.toUpperCase()}`);
console.log('   -> Đăng nhập tại http://localhost:3000/admin/login bằng email + mật khẩu bạn đã đặt.');
