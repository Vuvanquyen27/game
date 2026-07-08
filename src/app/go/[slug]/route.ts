import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { insertClickEvent } from '@/lib/database/clicks';
import { isSafeRedirectUrl } from '@/lib/security/url';
import { getClientIp, hashIp } from '@/lib/security/ip';
import { rateLimiter } from '@/lib/security/rate-limit';
import { CLICK_SOURCES, RATE_LIMITS, type ClickSource } from '@/lib/constants';
import { getSiteUrl } from '@/lib/site';

const clickSourceSet = new Set<string>(CLICK_SOURCES);

function resolveSource(raw: string | null): ClickSource {
  if (raw && clickSourceSet.has(raw)) return raw as ClickSource;
  return 'direct';
}

/** Redirect về trang chủ khi có sự cố (không bao giờ để open redirect). */
function homeRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL('/', getSiteUrl() || request.url), {
    status: 307,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return homeRedirect(request);
  }

  const url = new URL(request.url);
  const source = resolveSource(url.searchParams.get('source'));

  // Rate limit theo IP đã hash để tránh lạm dụng
  const ipHash = hashIp(getClientIp(request.headers));
  const rl = await rateLimiter.check(
    'redirect',
    ipHash ?? 'anon',
    RATE_LIMITS.redirect.limit,
    RATE_LIMITS.redirect.windowSeconds,
  );
  if (!rl.allowed) {
    return new NextResponse('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      status: 429,
    });
  }

  const supabase = createSupabaseAdminClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('id,affiliate_url,status,deleted_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !product || product.status !== 'published' || product.deleted_at) {
    return homeRedirect(request);
  }

  // Chỉ cho phép HTTPS tuyệt đối → chống open redirect / scheme nguy hiểm
  if (!isSafeRedirectUrl(product.affiliate_url)) {
    return homeRedirect(request);
  }

  // Ghi nhận click (không lưu IP thô — chỉ ip_hash)
  try {
    await insertClickEvent(supabase, {
      product_id: product.id,
      source,
      referrer: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      ip_hash: ipHash,
      utm_source: url.searchParams.get('utm_source'),
      utm_medium: url.searchParams.get('utm_medium'),
      utm_campaign: url.searchParams.get('utm_campaign'),
    });
  } catch (err) {
    // Không chặn redirect nếu ghi log lỗi
    console.warn(
      '[go] không ghi được click:',
      err instanceof Error ? err.message : 'unknown',
    );
  }

  return NextResponse.redirect(product.affiliate_url, { status: 307 });
}
