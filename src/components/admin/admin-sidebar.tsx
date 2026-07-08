'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/shared/brand-logo';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/actions/auth';

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/import', label: 'Import CSV', icon: Upload },
  { href: '/admin/social', label: 'Social', icon: Send },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  return (
    <div className="mt-auto space-y-3 border-t pt-4">
      <div className="px-1">
        <p className="truncate text-sm font-medium">{email}</p>
        <p className="text-xs capitalize text-muted-foreground">{role}</p>
      </div>
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <LogOut className="size-4" /> Đăng xuất
        </Button>
      </form>
    </div>
  );
}

export function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-md hover:bg-accent"
          aria-label="Mở menu quản trị"
        >
          <Menu className="size-5" />
        </button>
        <BrandLogo href="/admin" />
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-sidebar px-4 py-5 md:flex">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo href="/admin" />
          <ModeToggle />
        </div>
        <NavLinks />
        <UserFooter email={email} role={role} />
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r bg-sidebar px-4 py-5">
            <div className="mb-6 flex items-center justify-between">
              <BrandLogo href="/admin" />
              <button
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-md hover:bg-accent"
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <UserFooter email={email} role={role} />
          </aside>
        </div>
      )}
    </>
  );
}
