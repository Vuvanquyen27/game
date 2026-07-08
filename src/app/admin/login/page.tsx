import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/shared/brand-logo';
import { LoginForm } from '@/components/admin/login-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-grain px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="font-display text-xl font-bold">
              Đăng nhập quản trị
            </h1>
            <p className="text-sm text-muted-foreground">
              Khu vực dành riêng cho quản trị viên
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Không có chức năng đăng ký công khai. Liên hệ quản trị viên để được
          cấp tài khoản.
        </p>
      </div>
    </div>
  );
}
