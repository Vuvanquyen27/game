import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminCategories } from '@/lib/database/categories';
import { ProductForm } from '@/components/admin/product-form';
import { PageHeader } from '@/components/admin/page-header';

export default async function NewProductPage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const categories = await getAdminCategories(supabase);

  return (
    <div>
      <PageHeader
        title="Thêm sản phẩm"
        description="Tạo sản phẩm affiliate mới"
      />
      <ProductForm categories={categories} />
    </div>
  );
}
