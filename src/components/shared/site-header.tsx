'use client';

import * as React from 'react';
import Link from 'next/link';
import { Instagram, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brand } from '@/lib/brand';
import { BrandLogo } from './brand-logo';
import { SearchBar } from './search-bar';
import { ModeToggle } from './mode-toggle';
import { ThreadsIcon } from './icons';
import { Button } from '@/components/ui/button';

interface NavCategory {
  name: string;
  slug: string;
}

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/products?featured=1', label: 'Nổi bật' },
  { href: '/links', label: 'Link-in-bio' },
];

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <BrandLogo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {categories.length > 0 && (
            <div className="group relative">
              <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                Danh mục
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-56 origin-top rounded-lg border bg-popover p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                {categories.slice(0, 8).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="block rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="ml-auto hidden w-64 md:block">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-0.5 md:flex">
          <Button variant="ghost" size="icon" asChild aria-label="Instagram">
            <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram className="size-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Threads">
            <a href={brand.threadsUrl} target="_blank" rel="noopener noreferrer">
              <ThreadsIcon className="size-5" />
            </a>
          </Button>
          <ModeToggle />
        </div>

        <button
          className="ml-auto flex size-10 items-center justify-center rounded-md hover:bg-accent md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t bg-background transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-[32rem]' : 'max-h-0 border-transparent',
        )}
      >
        <div className="space-y-3 px-4 py-4">
          <SearchBar />
          <nav className="grid gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {categories.length > 0 && (
            <div>
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Danh mục
              </p>
              <div className="grid grid-cols-2 gap-1">
                {categories.slice(0, 8).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 border-t pt-3">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="size-4" /> Instagram
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a href={brand.threadsUrl} target="_blank" rel="noopener noreferrer">
                <ThreadsIcon className="size-4" /> Threads
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
