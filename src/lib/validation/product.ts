import { z } from 'zod';
import {
  CURRENCIES,
  PLATFORMS,
  PRODUCT_STATUSES,
} from '@/lib/constants';
import { isValidHttpUrl } from '@/lib/security/url';

const httpsUrl = z
  .string()
  .trim()
  .refine((v) => isValidHttpUrl(v), {
    message: 'URL phải bắt đầu bằng http:// hoặc https://',
  });

const optionalHttpUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || isValidHttpUrl(v), {
    message: 'URL không hợp lệ (phải là http/https)',
  });

/** Số tiền: cho phép rỗng → undefined, số không âm. */
const money = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === '' || v === null) return undefined;
    const n = typeof v === 'string' ? Number(v.replace(/[,\s]/g, '')) : v;
    return Number.isFinite(n) ? n : NaN;
  })
  .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
    message: 'Giá phải là số không âm',
  });

export const productFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Tên sản phẩm tối thiểu 3 ký tự')
      .max(200, 'Tên sản phẩm tối đa 200 ký tự'),
    slug: z
      .string()
      .trim()
      .max(220)
      .regex(/^[a-z0-9-]*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch nối')
      .optional()
      .or(z.literal('')),
    short_description: z.string().trim().max(300).optional().or(z.literal('')),
    description: z.string().trim().max(20000).optional().or(z.literal('')),
    platform: z.enum(PLATFORMS),
    original_url: optionalHttpUrl,
    affiliate_url: httpsUrl,
    image_url: optionalHttpUrl,
    price: money,
    original_price: money,
    currency: z.enum(CURRENCIES).default('VND'),
    seller_name: z.string().trim().max(120).optional().or(z.literal('')),
    commission_note: z.string().trim().max(500).optional().or(z.literal('')),
    copywriting: z.string().trim().max(5000).optional().or(z.literal('')),
    cta_text: z.string().trim().max(60).optional().or(z.literal('')),
    status: z.enum(PRODUCT_STATUSES).default('draft'),
    is_featured: z.boolean().default(false),
    show_on_bio: z.boolean().default(false),
    bio_order: z.coerce.number().int().min(0).max(9999).default(0),
    published_at: z.string().trim().optional().or(z.literal('')),
    category_ids: z.array(z.string().uuid()).default([]),
    gallery: z
      .array(
        z.object({
          storage_path: z.string().default(''),
          public_url: z
            .string()
            .trim()
            .refine((v) => isValidHttpUrl(v), { message: 'URL ảnh không hợp lệ' }),
          alt_text: z.string().trim().max(200).optional().or(z.literal('')),
        }),
      )
      .max(12, 'Tối đa 12 ảnh phụ')
      .default([]),
  })
  .refine(
    (data) =>
      data.original_price === undefined ||
      data.price === undefined ||
      data.original_price >= data.price,
    {
      message: 'Giá cũ phải lớn hơn hoặc bằng giá hiện tại',
      path: ['original_price'],
    },
  );

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormParsed = z.output<typeof productFormSchema>;
