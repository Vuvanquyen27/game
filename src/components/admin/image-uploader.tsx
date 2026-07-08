'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImage } from '@/actions/upload';
import { IMAGE_UPLOAD } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string | null;
  onUploaded: (data: { publicUrl: string; storagePath: string }) => void;
  onRemove?: () => void;
  className?: string;
  label?: string;
}

export function ImageUploader({
  value,
  onUploaded,
  onRemove,
  className,
  label = 'Tải ảnh lên',
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!IMAGE_UPLOAD.acceptedMime.includes(file.type as never)) {
      toast.error('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP');
      return;
    }
    if (file.size > IMAGE_UPLOAD.maxBytes) {
      toast.error(
        `Ảnh quá lớn (tối đa ${Math.round(IMAGE_UPLOAD.maxBytes / 1024 / 1024)}MB)`,
      );
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadProductImage(fd);
      if (result.ok) {
        onUploaded(result.data);
        toast.success('Đã tải ảnh lên');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {value ? (
        <div className="relative aspect-square w-full max-w-40 overflow-hidden rounded-lg border bg-muted">
          <Image
            src={value}
            alt="Xem trước"
            fill
            sizes="160px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/50 p-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 flex-1 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Thay
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="size-7"
                onClick={onRemove}
                disabled={uploading}
                aria-label="Xóa ảnh"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square w-full max-w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span>{uploading ? 'Đang tải...' : label}</span>
        </button>
      )}
    </div>
  );
}
