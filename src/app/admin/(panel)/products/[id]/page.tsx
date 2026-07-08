import { notFound } from 'next/navigation';
import { requireEditor } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminProductById } from '@/lib/database/products';
import { getAdminCategories } from '@/lib/database/categories';
import { ProductForm } from '@/components/admin/product-form';
import { PageHeader } from '@/components/admin/page-header';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [product, categories] = await Promise.all([
    getAdminProductById(supabase, id),
    getAdminCategories(supabase),
  ]);

  if (!product) notFound();

  return (
    <div>
      <PageHeader
        title="Chỉnh sửa sản phẩm"
        description={product.title}
      />
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
