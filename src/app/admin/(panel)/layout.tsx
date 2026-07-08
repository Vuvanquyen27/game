import { requireEditor } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard server-side: bắt buộc editor/admin. RLS ở DB là lớp bảo vệ cuối.
  const profile = await requireEditor();

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminSidebar email={profile.email} role={profile.role} />
      <div className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
