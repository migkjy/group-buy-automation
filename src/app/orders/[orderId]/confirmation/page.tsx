import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/data/orders';
import { formatPrice, formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ orderId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        {/* Checkmark */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">주문이 접수되었습니다!</h1>
        <p className="text-gray-500 text-sm mb-8">공구가 성사되면 안내 연락을 드리겠습니다.</p>

        {/* Order details */}
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문번호</span>
            <span className="font-mono text-gray-900 text-xs">{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">상품명</span>
            <span className="text-gray-900 font-medium">{order.dealTitle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">수량</span>
            <span className="text-gray-900">{order.quantity}개</span>
          </div>
          {order.selectedOptions && Object.entries(order.selectedOptions).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-500">{key}</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문자</span>
            <span className="text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">연락처</span>
            <span className="text-gray-900">{order.customerPhone}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">총 금액</span>
            <span className="text-orange-600 font-bold text-lg">{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">주문일시</span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <Link
          href="/deals"
          className="inline-block mt-8 px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          공구 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
