'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, LockKeyhole } from 'lucide-react';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types';

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/admin';
  const urlError = searchParams.get('error');

  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(loginAction, null);

  const errorMessage =
    (state && !state.ok && state.error) ||
    (urlError === 'forbidden'
      ? 'Bạn không có quyền truy cập trang này.'
      : null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@vidu.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {errorMessage && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {errorMessage}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Đang đăng nhập...
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" /> Đăng nhập
          </>
        )}
      </Button>
    </form>
  );
}
