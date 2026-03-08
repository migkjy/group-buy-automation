import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-48 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-4">관리자</h2>
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              공구 관리
            </Link>
            <Link
              href="/admin/orders"
              className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              주문 관리
            </Link>
            <Link
              href="/admin/deals/new"
              className="block px-3 py-2 text-sm font-medium text-orange-600 rounded-lg hover:bg-orange-50"
            >
              + 새 공구 등록
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
