'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/validation/category';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/actions/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/admin/field';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', description: '', image_url: '', status: 'active', sort_order: 0 },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: '', slug: '', description: '', image_url: '', status: 'active', sort_order: 0 });
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    reset({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      image_url: c.image_url ?? '',
      status: c.status,
      sort_order: c.sort_order,
    });
    setOpen(true);
  }

  async function onSubmit(values: CategoryFormValues) {
    const result = editing
      ? await updateCategory(editing.id, values)
      : await createCategory(values);
    if (result.ok) {
      toast.success(editing ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function onDelete(c: Category) {
    if (!confirm(`Xóa danh mục “${c.name}”?`)) return;
    const result = await deleteCategory(c.id);
    if (result.ok) {
      toast.success('Đã xóa danh mục');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const status = watch('status');

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Thêm danh mục
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          Chưa có danh mục nào.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-xl border bg-card p-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge variant={c.status === 'active' ? 'success' : 'muted'}>
                    {c.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
                {c.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(c)}
                  aria-label="Sửa"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(c)}
                  aria-label="Xóa"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
            </DialogTitle>
            <DialogDescription>
              Slug để trống sẽ tự sinh từ tên.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Tên danh mục" required error={errors.name?.message}>
              <Input {...register('name')} placeholder="VD: Đồ gia dụng" />
            </Field>
            <Field label="Slug" error={errors.slug?.message}>
              <Input {...register('slug')} placeholder="do-gia-dung" />
            </Field>
            <Field label="Mô tả" error={errors.description?.message}>
              <Textarea rows={2} {...register('description')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Trạng thái">
                <Select
                  value={status}
                  onValueChange={(v) =>
                    setValue('status', v as CategoryFormValues['status'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Thứ tự" error={errors.sort_order?.message}>
                <Input type="number" {...register('sort_order')} />
              </Field>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editing ? 'Lưu' : 'Tạo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
