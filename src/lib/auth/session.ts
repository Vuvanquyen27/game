import 'server-only';

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';
import { hasRole } from '@/lib/auth/roles';

export { hasRole } from '@/lib/auth/roles';

/** Lấy user hiện tại (null nếu chưa đăng nhập). */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Lấy profile (kèm role) của user hiện tại. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
}

/**
 * Bắt buộc đăng nhập + có role editor trở lên (editor hoặc admin).
 * Nếu không đạt → redirect. Trả về profile khi hợp lệ.
 */
export async function requireEditor(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin/login');
  if (!hasRole(profile, 'editor')) redirect('/admin/login?error=forbidden');
  return profile;
}

/** Bắt buộc đăng nhập + role admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin/login');
  if (!hasRole(profile, 'admin')) redirect('/admin?error=forbidden');
  return profile;
}
