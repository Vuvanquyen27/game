import { SiteHeader } from '@/components/shared/site-header';
import { SiteFooter } from '@/components/shared/site-footer';
import { getActiveCategories } from '@/lib/database/categories';
import { safeQuery } from '@/lib/database/safe';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await safeQuery(
    (supabase) => getActiveCategories(supabase),
    [],
  );
  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex min-h-screen flex-col bg-paper-grain">
      <SiteHeader categories={navCategories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
