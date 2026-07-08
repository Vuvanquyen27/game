import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminCategories } from '@/lib/database/categories';
import { PageHeader } from '@/components/admin/page-header';
import { CategoryManager } from '@/components/admin/category-manager';

export default async function AdminCategoriesPage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const categories = await getAdminCategories(supabase);

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Quản lý danh mục sản phẩm"
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
