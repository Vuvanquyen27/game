import { z } from 'zod';
import {
  SOCIAL_PLATFORMS,
  SOCIAL_POST_STATUSES,
  SOCIAL_POST_TYPES,
} from '@/lib/constants';
import { isValidHttpUrl } from '@/lib/security/url';

export const socialPostFormSchema = z
  .object({
    product_id: z.string().uuid().optional().or(z.literal('')),
    platform: z.enum(SOCIAL_PLATFORMS),
    post_type: z.enum(SOCIAL_POST_TYPES).default('link'),
    caption: z
      .string()
      .trim()
      .min(1, 'Nội dung không được trống')
      .max(2200, 'Nội dung tối đa 2200 ký tự'),
    media_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || isValidHttpUrl(v), { message: 'URL ảnh không hợp lệ' }),
    target_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || isValidHttpUrl(v), { message: 'URL không hợp lệ' }),
    status: z.enum(SOCIAL_POST_STATUSES).default('draft'),
    scheduled_at: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (d) =>
      d.status !== 'scheduled' ||
      (d.scheduled_at && !Number.isNaN(Date.parse(d.scheduled_at))),
    {
      message: 'Bài lên lịch cần thời điểm đăng hợp lệ',
      path: ['scheduled_at'],
    },
  )
  .refine((d) => d.post_type !== 'image' || Boolean(d.media_url), {
    message: 'Bài dạng ảnh cần có URL ảnh',
    path: ['media_url'],
  });

export type SocialPostFormValues = z.input<typeof socialPostFormSchema>;
export type SocialPostFormParsed = z.output<typeof socialPostFormSchema>;
