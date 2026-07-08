import { requireEditor } from '@/lib/auth/session';
import { PageHeader } from '@/components/admin/page-header';
import { ImportClient } from '@/components/admin/import-client';

export default async function AdminImportPage() {
  await requireEditor();
  return (
    <div>
      <PageHeader
        title="Import CSV"
        description="Nhập hàng loạt sản phẩm từ file CSV (không tự động scraping)"
      />
      <ImportClient />
    </div>
  );
}
