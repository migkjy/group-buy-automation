import Link from 'next/link';
import { getDeals } from '@/lib/data/deals';
import { formatPrice } from '@/lib/utils';
import StatusBadge from '@/components/ui/status-badge';
import DeleteDealButton from '@/components/admin/delete-deal-button';

export const dynamic = 'force-dynamic';

export default function AdminDealsPage() {
  const deals = getDeals();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">공구 관리</h1>
        <Link
          href="/admin/deals/new"
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          새 공구 등록
        </Link>
      </div>

      {deals.length === 0 ? (
        <p className="text-gray-500 text-center py-8">등록된 공구가 없습니다.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">상품명</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">가격</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">주문</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/deals/${deal.slug}`} className="text-gray-900 font-medium hover:text-orange-600">
                        {deal.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{deal.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{formatPrice(deal.groupPrice)}</span>
                      <span className="text-xs text-red-500 ml-1">-{deal.discountRate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {deal.currentOrders}/{deal.maxQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/deals/${deal.id}/edit`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          수정
                        </Link>
                        <DeleteDealButton dealId={deal.id} dealTitle={deal.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
