'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validation/auth';
import { hashIp, getClientIp } from '@/lib/security/ip';
import { rateLimiter } from '@/lib/security/rate-limit';
import { RATE_LIMITS } from '@/lib/constants';
import type { ActionResult } from '@/types';

/**
 * Đăng nhập admin/editor. Có rate-limit theo IP.
 * Trả về lỗi để form hiển thị; thành công → redirect.
 */
export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Thông tin đăng nhập không hợp lệ',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Rate limit theo IP để chống brute-force
  const hdrs = await headers();
  const ipHash = hashIp(getClientIp(hdrs)) ?? 'anon';
  const rl = await rateLimiter.check(
    'login',
    ipHash,
    RATE_LIMITS.login.limit,
    RATE_LIMITS.login.windowSeconds,
  );
  if (!rl.allowed) {
    return {
      ok: false,
      error: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi ít phút.',
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: 'Email hoặc mật khẩu không đúng.' };
  }

  // Xác nhận có profile với quyền editor trở lên
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: 'Tài khoản không có quyền truy cập trang quản trị.',
      };
    }
  }

  const nextParam = formData.get('next');
  const next =
    typeof nextParam === 'string' && nextParam.startsWith('/admin')
      ? nextParam
      : '/admin';
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
