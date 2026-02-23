import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] text-[var(--foreground)] flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
