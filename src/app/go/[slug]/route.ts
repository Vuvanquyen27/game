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

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function continuePage(productTitle: string, affiliateUrl: string) {
  const title = escapeHtml(productTitle);
  const url = escapeHtml(affiliateUrl);

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="2;url=${url}" />
    <title>Đang mở Shopee · Ezriso</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #fbf7ef;
        --card: rgba(255, 255, 255, 0.86);
        --text: #231b16;
        --muted: #6c625c;
        --line: rgba(35, 27, 22, 0.12);
        --accent: #ea5d2f;
        --accent-strong: #d8471c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(234, 93, 47, 0.18), transparent 30%),
          radial-gradient(circle at top right, rgba(46, 120, 99, 0.12), transparent 28%),
          var(--bg);
        color: var(--text);
        padding: 24px;
      }
      .card {
        width: min(100%, 560px);
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--card);
        backdrop-filter: blur(12px);
        box-shadow: 0 24px 80px rgba(35, 27, 22, 0.12);
        padding: 28px;
      }
      .eyebrow {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.6);
      }
      h1 {
        margin: 18px 0 8px;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.05;
        letter-spacing: -0.03em;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
        font-size: 15px;
      }
      .title {
        margin-top: 14px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.68);
        border: 1px solid var(--line);
        font-weight: 700;
      }
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 22px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 18px;
        border-radius: 14px;
        text-decoration: none;
        font-weight: 700;
        transition: transform 0.15s ease, background-color 0.15s ease;
      }
      .btn:hover { transform: translateY(-1px); }
      .btn-primary {
        color: white;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
      }
      .btn-secondary {
        color: var(--text);
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--line);
      }
      .meta {
        margin-top: 16px;
        font-size: 13px;
        color: var(--muted);
      }
      code {
        display: block;
        overflow-wrap: anywhere;
        margin-top: 8px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--line);
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="eyebrow">Ezriso</div>
      <h1>Đang mở Shopee</h1>
      <p>Bạn đang được chuyển đến trang mua hàng chính thức để hệ thống ghi nhận affiliate.</p>
      <div class="title">${title}</div>
      <div class="actions">
        <a class="btn btn-primary" href="${url}" rel="nofollow sponsored noopener">Tiếp tục mở Shopee</a>
        <a class="btn btn-secondary" href="/" rel="noopener">Quay lại Ezriso</a>
      </div>
      <div class="meta">
        Tự chuyển sau 2 giây. Nếu không tự mở, dùng nút bên trên.
        <code>${url}</code>
      </div>
    </main>
    <script>
      setTimeout(function () {
        window.location.href = ${JSON.stringify(affiliateUrl)};
      }, 2000);
    </script>
  </body>
</html>`;
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
    .select('id,title,affiliate_url,status,deleted_at')
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

  return new NextResponse(continuePage(product.title, product.affiliate_url), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
