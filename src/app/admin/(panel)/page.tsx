import Link from 'next/link';
import {
  BarChart3,
  FileEdit,
  MousePointerClick,
  Package,
  Send,
  TrendingUp,
} from 'lucide-react';
import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { countProductsByStatus } from '@/lib/database/products';
import { countSocialByStatus } from '@/lib/database/social';
import {
  getClicksByDay,
  getClicksBySource,
  getClickTotals,
  getTopProducts,
} from '@/lib/analytics/dashboard';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import {
  ClicksByDayChart,
  ClicksBySourceChart,
} from '@/components/admin/dashboard-charts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';

export const dynamic = 'force-dynamic';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function AdminDashboardPage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();

  const [productCounts, clickTotals, bySource, byDay, topProducts, socialCounts] =
    await Promise.all([
      safe(() => countProductsByStatus(supabase), {
        total: 0,
        draft: 0,
        published: 0,
        archived: 0,
      }),
      safe(() => getClickTotals(supabase), {
        total: 0,
        today: 0,
        last7Days: 0,
      }),
      safe(() => getClicksBySource(supabase, 30), []),
      safe(() => getClicksByDay(supabase, 14), []),
      safe(() => getTopProducts(supabase, 10, 30), []),
      safe(() => countSocialByStatus(supabase), {} as Record<string, number>),
    ]);

  const hasClicks = clickTotals.total > 0;
  const socialScheduled = socialCounts.scheduled ?? 0;
  const socialFailed = socialCounts.failed ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description="Thống kê sản phẩm và lượt click affiliate"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Tổng sản phẩm"
          value={productCounts.total}
          icon={Package}
          hint={`${productCounts.published} đang xuất bản`}
        />
        <StatCard
          label="Bản nháp"
          value={productCounts.draft}
          icon={FileEdit}
        />
        <StatCard
          label="Tổng click"
          value={clickTotals.total}
          icon={MousePointerClick}
          hint={`${clickTotals.today} hôm nay`}
        />
        <StatCard
          label="Click 7 ngày"
          value={clickTotals.last7Days}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-primary" /> Lượt click 14 ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasClicks ? (
              <ClicksByDayChart data={byDay} />
            ) : (
              <EmptyState
                icon={MousePointerClick}
                title="Chưa có lượt click"
                description="Dữ liệu sẽ xuất hiện khi có người bấm vào liên kết affiliate qua /go."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Click theo nguồn (30 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasClicks ? (
              <ClicksBySourceChart data={bySource} />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Chưa có dữ liệu nguồn"
                description="Nguồn: website, instagram, threads, bio, trực tiếp."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top sản phẩm được click</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu.
              </p>
            ) : (
              <ol className="space-y-1">
                {topProducts.map((p, i) => (
                  <li
                    key={p.productId}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="line-clamp-1 flex-1 text-sm font-medium">
                      {p.slug ? (
                        <Link
                          href={`/admin/products`}
                          className="hover:text-primary"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        p.title
                      )}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      {p.count}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Social status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="size-4 text-primary" /> Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Đang chờ đăng</span>
              <span className="font-display text-xl font-bold">
                {socialScheduled}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Đăng lỗi</span>
              <span className="font-display text-xl font-bold text-destructive">
                {socialFailed}
              </span>
            </div>
            <Link
              href="/admin/social"
              className="block rounded-lg bg-secondary px-3 py-2 text-center text-sm font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Quản lý bài social
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
