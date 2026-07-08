import { z } from 'zod';
import { CATEGORY_STATUSES } from '@/lib/constants';
import { isValidHttpUrl } from '@/lib/security/url';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên danh mục tối thiểu 2 ký tự')
    .max(100, 'Tên danh mục tối đa 100 ký tự'),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch nối')
    .optional()
    .or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  image_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || isValidHttpUrl(v), {
      message: 'URL ảnh không hợp lệ',
    }),
  status: z.enum(CATEGORY_STATUSES).default('active'),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type CategoryFormParsed = z.output<typeof categoryFormSchema>;
