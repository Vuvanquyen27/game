import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { brand } from '@/lib/brand';
import { BrandLogo } from './brand-logo';
import { ThreadsIcon } from './icons';

const FOOTER_LINKS = [
  { href: '/products', label: 'Tất cả sản phẩm' },
  { href: '/links', label: 'Link-in-bio' },
  { href: '/about', label: 'Giới thiệu' },
  { href: '/affiliate-disclosure', label: 'Công bố liên kết tiếp thị' },
  { href: '/privacy', label: 'Chính sách quyền riêng tư' },
];

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <BrandLogo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {brand.description}
          </p>
          <div className="flex gap-2">
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={brand.threadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads"
              className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ThreadsIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Khám phá</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.slice(0, 3).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Pháp lý</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.slice(3).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Công bố</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Website có thể nhận hoa hồng từ các liên kết affiliate (Shopee,
            Lazada, TikTok Shop…). Điều này không làm tăng giá bạn phải trả.
          </p>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {brand.name}. Bảo lưu mọi quyền.
          </p>
          <p>Được xây dựng với Next.js · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
