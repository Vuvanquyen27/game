'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  productFormSchema,
  type ProductFormValues,
} from '@/lib/validation/product';
import { createProduct, updateProduct } from '@/actions/products';
import { slugify } from '@/lib/slug';
import {
  CURRENCIES,
  PLATFORMS,
  PLATFORM_LABELS,
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
} from '@/lib/constants';
import type { Category, ProductWithRelations } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field } from '@/components/admin/field';
import { ImageUploader } from '@/components/admin/image-uploader';

type GalleryItem = {
  storage_path: string;
  public_url: string;
  alt_text?: string;
};

interface ProductFormProps {
  categories: Category[];
  product?: ProductWithRelations;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [slugTouched, setSlugTouched] = React.useState(isEdit);

  const defaultValues: ProductFormValues = {
    title: product?.title ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    platform: product?.platform ?? 'shopee',
    original_url: product?.original_url ?? '',
    affiliate_url: product?.affiliate_url ?? '',
    image_url: product?.image_url ?? '',
    price: product?.price != null ? String(product.price) : '',
    original_price:
      product?.original_price != null ? String(product.original_price) : '',
    currency: (product?.currency as 'VND' | 'USD') ?? 'VND',
    seller_name: product?.seller_name ?? '',
    commission_note: product?.commission_note ?? '',
    copywriting: product?.copywriting ?? '',
    cta_text: product?.cta_text ?? '',
    status: product?.status ?? 'draft',
    is_featured: product?.is_featured ?? false,
    show_on_bio: product?.show_on_bio ?? false,
    bio_order: product?.bio_order ?? 0,
    published_at: toDatetimeLocal(product?.published_at),
    category_ids: product?.categories.map((c) => c.id) ?? [],
    gallery:
      product?.images.map((img) => ({
        storage_path: img.storage_path,
        public_url: img.public_url,
        alt_text: img.alt_text ?? '',
      })) ?? [],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues,
  });

  const title = watch('title');
  const imageUrl = watch('image_url');
  const gallery = (watch('gallery') ?? []) as GalleryItem[];
  const selectedCategories = watch('category_ids') ?? [];

  // Tự sinh slug từ tên khi người dùng chưa tự sửa slug
  React.useEffect(() => {
    if (!slugTouched && title) {
      setValue('slug', slugify(title));
    }
  }, [title, slugTouched, setValue]);

  function toggleCategory(id: string, checked: boolean) {
    const current = new Set(selectedCategories);
    if (checked) current.add(id);
    else current.delete(id);
    setValue('category_ids', Array.from(current));
  }

  async function onSubmit(values: ProductFormValues) {
    const result = isEdit
      ? await updateProduct(product!.id, values)
      : await createProduct(values);

    if (result.ok) {
      toast.success(isEdit ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm');
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([key, msgs]) => {
          if (msgs?.[0]) {
            toast.error(`${key}: ${msgs[0]}`);
          }
        });
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-[1fr_20rem]"
    >
      {/* Cột chính */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Tên sản phẩm"
              htmlFor="title"
              required
              error={errors.title?.message}
            >
              <Input id="title" {...register('title')} placeholder="VD: Tai nghe Bluetooth ABC" />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              hint="Tự sinh từ tên; có thể chỉnh sửa. Chỉ chữ thường, số, gạch nối."
              error={errors.slug?.message}
            >
              <Input
                id="slug"
                {...register('slug')}
                onChange={(e) => {
                  setSlugTouched(true);
                  setValue('slug', e.target.value);
                }}
                placeholder="tai-nghe-bluetooth-abc"
              />
            </Field>

            <Field
              label="Mô tả ngắn"
              htmlFor="short_description"
              error={errors.short_description?.message}
            >
              <Textarea
                id="short_description"
                rows={2}
                {...register('short_description')}
                placeholder="Một câu mô tả hấp dẫn"
              />
            </Field>

            <Field
              label="Mô tả chi tiết"
              htmlFor="description"
              hint="Hỗ trợ HTML cơ bản (sẽ được làm sạch trước khi lưu)."
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={6}
                {...register('description')}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liên kết & Giá</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Affiliate URL"
              htmlFor="affiliate_url"
              required
              hint="Bắt buộc http/https. Người dùng được chuyển hướng qua /go."
              error={errors.affiliate_url?.message}
            >
              <Input
                id="affiliate_url"
                {...register('affiliate_url')}
                placeholder="https://shopee.vn/..."
              />
            </Field>

            <Field
              label="URL gốc (tùy chọn)"
              htmlFor="original_url"
              error={errors.original_url?.message}
            >
              <Input id="original_url" {...register('original_url')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Giá hiện tại" htmlFor="price" error={errors.price?.message}>
                <Input id="price" inputMode="numeric" {...register('price')} placeholder="299000" />
              </Field>
              <Field
                label="Giá cũ"
                htmlFor="original_price"
                error={errors.original_price?.message}
              >
                <Input
                  id="original_price"
                  inputMode="numeric"
                  {...register('original_price')}
                  placeholder="499000"
                />
              </Field>
              <Field label="Tiền tệ" error={errors.currency?.message}>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nền tảng" error={errors.platform?.message}>
                <Controller
                  control={control}
                  name="platform"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PLATFORM_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Nhà bán hàng" htmlFor="seller_name">
                <Input id="seller_name" {...register('seller_name')} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nội dung bán hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Copywriting" htmlFor="copywriting" hint="Dùng để tạo caption social.">
              <Textarea id="copywriting" rows={3} {...register('copywriting')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nút CTA" htmlFor="cta_text" hint="Mặc định: Xem ưu đãi">
                <Input id="cta_text" {...register('cta_text')} placeholder="Xem ưu đãi" />
              </Field>
              <Field label="Ghi chú hoa hồng" htmlFor="commission_note">
                <Input id="commission_note" {...register('commission_note')} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ảnh phụ (gallery)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {gallery.map((img, idx) => (
                <div key={img.public_url + idx} className="w-40">
                  <ImageUploader
                    value={img.public_url}
                    onUploaded={(data) => {
                      const next = [...gallery];
                      next[idx] = {
                        storage_path: data.storagePath,
                        public_url: data.publicUrl,
                        alt_text: img.alt_text,
                      };
                      setValue('gallery', next);
                    }}
                    onRemove={() => {
                      setValue(
                        'gallery',
                        gallery.filter((_, i) => i !== idx),
                      );
                    }}
                  />
                </div>
              ))}
              {gallery.length < 12 && (
                <div className="w-40">
                  <ImageUploader
                    label="Thêm ảnh"
                    onUploaded={(data) =>
                      setValue('gallery', [
                        ...gallery,
                        {
                          storage_path: data.storagePath,
                          public_url: data.publicUrl,
                          alt_text: '',
                        },
                      ])
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cột phụ */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Xuất bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Trạng thái">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PRODUCT_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Ngày xuất bản"
              htmlFor="published_at"
              hint="Bỏ trống để dùng thời điểm hiện tại khi xuất bản."
            >
              <Input
                id="published_at"
                type="datetime-local"
                {...register('published_at')}
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Nổi bật</p>
                <p className="text-xs text-muted-foreground">
                  Hiện ở khu vực nổi bật
                </p>
              </div>
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Hiện trên link-in-bio</p>
                <p className="text-xs text-muted-foreground">Trang /links</p>
              </div>
              <Controller
                control={control}
                name="show_on_bio"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <Field label="Thứ tự trên bio" htmlFor="bio_order" error={errors.bio_order?.message}>
              <Input id="bio_order" type="number" {...register('bio_order')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ảnh chính</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ImageUploader
              value={imageUrl || null}
              label="Tải ảnh chính"
              onUploaded={(data) => setValue('image_url', data.publicUrl)}
              onRemove={() => setValue('image_url', '')}
            />
            <Field label="Hoặc dán URL ảnh" htmlFor="image_url" error={errors.image_url?.message}>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://..."
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có danh mục. Tạo ở mục Danh mục.
              </p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {categories.map((c) => {
                  const checked = selectedCategories.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors',
                        checked && 'border-primary bg-primary/5',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          toggleCategory(c.id, Boolean(v))
                        }
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Thanh hành động cố định */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur lg:col-span-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/products')}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              {isEdit ? <Save className="size-4" /> : <Sparkles className="size-4" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
