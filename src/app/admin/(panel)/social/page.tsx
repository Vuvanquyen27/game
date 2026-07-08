import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminProducts } from '@/lib/database/products';
import { getSocialPosts } from '@/lib/database/social';
import { getSocialConnectionStatus } from '@/lib/social/config';
import { getSiteUrl } from '@/lib/site';
import { PageHeader } from '@/components/admin/page-header';
import { SocialManager } from '@/components/admin/social-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSocialPage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();

  const [{ items: products }, posts] = await Promise.all([
    getAdminProducts(supabase, { pageSize: 100 }),
    getSocialPosts(supabase),
  ]);

  const composerProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image_url: p.image_url,
    price: p.price,
    original_price: p.original_price,
    currency: p.currency,
    copywriting: p.copywriting,
    short_description: p.short_description,
    cta_text: p.cta_text,
  }));

  return (
    <div>
      <PageHeader
        title="Social Content"
        description="Soạn, lên lịch và đăng bài Instagram / Threads"
      />
      <SocialManager
        products={composerProducts}
        posts={posts}
        connection={getSocialConnectionStatus()}
        siteUrl={getSiteUrl()}
      />
    </div>
  );
}
