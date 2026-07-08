'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import {
  PLATFORM_LABELS,
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
} from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import {
  duplicateProduct,
  setProductStatus,
  softDeleteProduct,
  toggleProductFlag,
} from '@/actions/products';
import { SmartImage } from '@/components/shared/smart-image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { ActionResult } from '@/types';

const statusVariant: Record<
  ProductStatus,
  'success' | 'warning' | 'muted'
> = {
  published: 'success',
  draft: 'warning',
  archived: 'muted',
};

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function run(promise: Promise<ActionResult>, successMsg: string) {
    startTransition(async () => {
      const result = await promise;
      if (result.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center text-sm text-muted-foreground">
        Chưa có sản phẩm nào. Nhấn “Thêm sản phẩm” để bắt đầu.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="hidden md:table-cell">Nền tảng</TableHead>
            <TableHead className="hidden sm:table-cell">Giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="hidden lg:table-cell text-center">
              Nổi bật
            </TableHead>
            <TableHead className="hidden lg:table-cell text-center">Bio</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className={pending ? 'opacity-70' : ''}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                    <SmartImage src={p.image_url} alt={p.title} sizes="44px" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      /{p.slug}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {PLATFORM_LABELS[p.platform]}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm tabular-nums">
                {formatPrice(p.price, p.currency) || '—'}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[p.status]}>
                  {PRODUCT_STATUS_LABELS[p.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-center">
                <Switch
                  checked={p.is_featured}
                  disabled={pending}
                  onCheckedChange={(v) =>
                    run(
                      toggleProductFlag(p.id, 'is_featured', v),
                      'Đã cập nhật',
                    )
                  }
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell text-center">
                <Switch
                  checked={p.show_on_bio}
                  disabled={pending}
                  onCheckedChange={(v) =>
                    run(toggleProductFlag(p.id, 'show_on_bio', v), 'Đã cập nhật')
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Thao tác">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${p.id}`}>
                        <Pencil className="size-4" /> Chỉnh sửa
                      </Link>
                    </DropdownMenuItem>
                    {p.status === 'published' ? (
                      <DropdownMenuItem
                        onClick={() =>
                          run(setProductStatus(p.id, 'draft'), 'Đã chuyển nháp')
                        }
                      >
                        <EyeOff className="size-4" /> Chuyển thành nháp
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          run(
                            setProductStatus(p.id, 'published'),
                            'Đã xuất bản',
                          )
                        }
                      >
                        <Eye className="size-4" /> Xuất bản
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        run(
                          toggleProductFlag(p.id, 'is_featured', !p.is_featured),
                          'Đã cập nhật',
                        )
                      }
                    >
                      <Star className="size-4" />
                      {p.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        startTransition(async () => {
                          const r = await duplicateProduct(p.id);
                          if (r.ok) {
                            toast.success('Đã nhân bản');
                            router.refresh();
                          } else toast.error(r.error);
                        })
                      }
                    >
                      <Copy className="size-4" /> Nhân bản
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            `Xóa sản phẩm “${p.title}”? (xóa mềm, có thể khôi phục trong DB)`,
                          )
                        ) {
                          run(softDeleteProduct(p.id), 'Đã xóa sản phẩm');
                        }
                      }}
                    >
                      <Trash2 className="size-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
