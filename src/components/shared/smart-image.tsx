import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Ảnh có fallback khi thiếu URL. Dùng fill trong khung tỉ lệ do cha đặt. */
export function SmartImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority,
}: SmartImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
        aria-label={alt}
      >
        <ImageOff className="size-8 opacity-40" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
    />
  );
}
