import { NextResponse, type NextRequest } from 'next/server';
import type { SocialPostStatus } from '@/lib/constants';
import { getDuePosts } from '@/lib/database/social';
import { nextStatusAfterFailure } from '@/lib/social/schedule';
import { publishToSocial } from '@/lib/social/publish';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

/** Số bài tối đa xử lý mỗi lần chạy cron. */
const BATCH_SIZE = 10;

/** Một dòng kết quả tóm tắt cho mỗi bài đã xử lý. */
interface PostResult {
  id: string;
  status: SocialPostStatus;
}

/**
 * Xác thực yêu cầu cron.
 * - Bắt buộc CRON_SECRET đã được cấu hình.
 * - Chấp nhận header `Authorization: Bearer <CRON_SECRET>` (Vercel Cron gửi khi cấu hình),
 *   hoặc query `?secret=<CRON_SECRET>` như phương án dự phòng.
 * Không bao giờ log giá trị secret/token.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;

  const querySecret = new URL(request.url).searchParams.get('secret');
  return querySecret !== null && querySecret === secret;
}

async function handle(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Thiếu cấu hình Supabase / service role → bỏ qua nhẹ nhàng (không lỗi).
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      skipped: true,
      reason: 'Supabase chưa được cấu hình đầy đủ (thiếu URL/anon/service role key).',
    });
  }

  const adminClient = createSupabaseAdminClient();
  const posts = await getDuePosts(adminClient, BATCH_SIZE);

  let published = 0;
  let failed = 0;
  let rescheduled = 0;
  const results: PostResult[] = [];

  for (const post of posts) {
    try {
      // (a) "Khóa" bài để tránh xử lý trùng nếu cron chạy chồng lần.
      await adminClient
        .from('social_posts')
        .update({ status: 'publishing' })
        .eq('id', post.id);

      // (b) Gọi service đăng bài theo nền tảng.
      const result = await publishToSocial(post.platform, {
        caption: post.caption,
        postType: post.post_type,
        mediaUrl: post.media_url,
        targetUrl: post.target_url,
      });

      if (result.ok) {
        // (c) Thành công.
        await adminClient
          .from('social_posts')
          .update({
            status: 'published',
            external_post_id: result.externalPostId,
            published_at: new Date().toISOString(),
            last_error: null,
          })
          .eq('id', post.id);
        published += 1;
        results.push({ id: post.id, status: 'published' });
      } else {
        // (d) Thất bại.
        const attempts = (post.publish_attempts ?? 0) + 1;
        let status: SocialPostStatus;
        let lastError: string;

        if (result.notConfigured) {
          // Chưa cấu hình API → không retry, chuyển sang thủ công.
          status = 'failed';
          lastError = 'API chưa cấu hình';
        } else {
          status = nextStatusAfterFailure(attempts);
          lastError = result.error;
        }

        await adminClient
          .from('social_posts')
          .update({
            status,
            publish_attempts: attempts,
            last_error: lastError,
          })
          .eq('id', post.id);

        if (status === 'failed') failed += 1;
        else rescheduled += 1;
        results.push({ id: post.id, status });
      }
    } catch (err) {
      // 1 lỗi bất ngờ không được chặn cả batch. Đưa bài về trạng thái hợp lý
      // để không kẹt mãi ở 'publishing'.
      const attempts = (post.publish_attempts ?? 0) + 1;
      const status = nextStatusAfterFailure(attempts);
      console.warn(
        '[cron/social-publish] lỗi xử lý bài',
        post.id,
        ':',
        err instanceof Error ? err.message : 'unknown',
      );
      try {
        await adminClient
          .from('social_posts')
          .update({
            status,
            publish_attempts: attempts,
            last_error: err instanceof Error ? err.message : 'Lỗi không xác định',
          })
          .eq('id', post.id);
      } catch {
        // Bỏ qua lỗi cập nhật để tiếp tục xử lý các bài còn lại.
      }
      if (status === 'failed') failed += 1;
      else rescheduled += 1;
      results.push({ id: post.id, status });
    }
  }

  return NextResponse.json({
    processed: posts.length,
    published,
    failed,
    rescheduled,
    results,
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}
