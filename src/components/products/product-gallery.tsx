'use client';

import * as React from 'react';
import { SmartImage } from '@/components/shared/smart-image';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  url: string | null;
  alt: string;
}

/** Gallery ảnh sản phẩm: ảnh chính lớn + hàng thumbnail chuyển ảnh. */
export function ProductGallery({
  images,
  priority,
}: {
  images: GalleryImage[];
  priority?: boolean;
}) {
  const list = images.length > 0 ? images : [{ url: null, alt: 'Sản phẩm' }];
  const [active, setActive] = React.useState(0);
  const current = list[Math.min(active, list.length - 1)] ?? {
    url: null,
    alt: 'Sản phẩm',
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
        <SmartImage
          src={current.url}
          alt={current.alt}
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all',
                i === active
                  ? 'ring-2 ring-primary ring-offset-1'
                  : 'opacity-70 hover:opacity-100',
              )}
            >
              <SmartImage src={img.url} alt={img.alt} sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
