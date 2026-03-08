'use client';

import { formatPrice } from '@/lib/utils';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  activeDeals: number;
  avgOrderValue: number;
}

export default function SummaryCards({ data }: { data: SummaryData | null }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-7 bg-gray-200 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { key: 'revenue', label: '총매출', value: formatPrice(data.totalRevenue), icon: '\u{1F4B0}' },
    { key: 'orders', label: '총주문수', value: `${data.totalOrders}건`, icon: '\u{1F4E6}' },
    { key: 'deals', label: '활성딜수', value: `${data.activeDeals}개`, icon: '\u{1F525}' },
    { key: 'avg', label: '평균주문단가', value: formatPrice(data.avgOrderValue), icon: '\u{1F4CA}' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{card.icon}</span>
            <span className="text-sm text-gray-500">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
