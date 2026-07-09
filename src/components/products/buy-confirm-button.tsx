'use client';

import * as React from 'react';
import { ArrowUpRight, BadgeAlert, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ClickSource } from '@/lib/constants';
import { goPath } from '@/lib/site';

export function BuyConfirmButton({
  slug,
  source,
  cta,
}: {
  slug: string;
  source: ClickSource;
  cta: string;
}) {
  const href = goPath(slug, source);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="mt-1 w-full justify-center"
        >
          {cta}
          <ArrowUpRight className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-5" />
          </div>
          <DialogTitle>Tiếp tục sang Shopee?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Bạn sẽ rời Ezriso để mở trang mua hàng chính thức. Nếu mua thành công
            qua link này, hệ thống sẽ ghi nhận affiliate cho chúng tôi.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <BadgeAlert className="mt-0.5 size-4 shrink-0 text-brand-coral" />
            <p>
              Giá sản phẩm không đổi. Bạn vẫn thanh toán trực tiếp trên Shopee.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Ở lại Ezriso
          </Button>
          <Button asChild>
            {/* Dùng <a> (không phải next/link) để LUÔN hard-navigate sang route
                /go/[slug]; tránh trường hợp client-nav của App Router xử lý
                nhầm response HTML của route handler. */}
            <a href={href} rel="nofollow sponsored">
              Tiếp tục mở Shopee
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
