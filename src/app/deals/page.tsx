import type { Metadata } from 'next';
import { getDeals } from '@/lib/data/deals';
import DealCard from '@/components/deals/deal-card';

export const metadata: Metadata = {
  title: '진행중인 공구',
  description: '현재 진행중인 공동구매 목록입니다. 특가 할인 상품을 확인하세요.',
};

export const dynamic = 'force-dynamic';

export default function DealsPage() {
  const deals = getDeals().filter(
    (d) => d.status === 'active' || d.status === 'upcoming'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">진행중인 공구</h1>

      {deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">현재 진행중인 공구가 없습니다.</p>
          <p className="text-sm mt-1">곧 새로운 공구가 시작됩니다!</p>
        </div>
      )}
    </div>
  );
}
