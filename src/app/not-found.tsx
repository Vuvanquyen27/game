import Link from 'next/link';
import { Home, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/brand-logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper-grain px-4 py-16 text-center">
      <div className="mb-8">
        <BrandLogo />
      </div>

      <p className="font-display text-7xl font-black leading-none tracking-tight text-primary sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        Trang bạn tìm có thể đã bị xóa, đổi tên hoặc chưa từng tồn tại. Đừng lo,
        vẫn còn rất nhiều ưu đãi hay đang chờ bạn.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="size-4" />
            Về trang chủ
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/products">
            <PackageSearch className="size-4" />
            Xem sản phẩm
          </Link>
        </Button>
      </div>
    </main>
  );
}
