import { getOrders } from '@/lib/data/orders';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '확정', className: 'bg-green-100 text-green-800' },
  cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
};

export default function AdminOrdersPage() {
  const orders = getOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">주문 관리</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">주문 내역이 없습니다.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">주문번호</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">상품</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">주문자</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">연락처</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">수량</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">금액</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const statusInfo = statusLabels[order.status] || statusLabels.pending;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{order.dealTitle}</td>
                      <td className="px-4 py-3 text-gray-700">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-700">{order.customerPhone}</td>
                      <td className="px-4 py-3 text-gray-700">{order.quantity}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{formatPrice(order.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
