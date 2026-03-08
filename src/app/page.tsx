import Link from 'next/link';
import { getDeals } from '@/lib/data/deals';
import DealCard from '@/components/deals/deal-card';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const deals = getDeals().filter((d) => d.status === 'active').slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            매일 새로운<br />공동구매 특가
          </h1>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            엄선된 상품을 공동구매 가격으로 만나보세요.
            <br />
            최대 50% 할인, 한정 수량으로 진행됩니다.
          </p>
          <Link
            href="/deals"
            className="inline-block bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors text-lg"
          >
            공구 보러가기
          </Link>
        </div>
      </section>

      {/* Active Deals */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">진행중인 공구</h2>
          <Link
            href="/deals"
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">현재 진행중인 공구가 없습니다.</p>
            <p className="text-sm mt-1">곧 새로운 공구가 시작됩니다!</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            공구 참여 방법
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '공구 선택', desc: '마음에 드는 상품의 공구를 선택하세요' },
              { step: '02', title: '주문 접수', desc: '수량과 옵션을 선택하고 참여를 신청하세요' },
              { step: '03', title: '할인 혜택', desc: '목표 인원 달성 시 공구가로 구매하세요' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
