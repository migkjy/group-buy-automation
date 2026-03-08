import type { Deal } from '@/types/deal';
import PriceDisplay from '@/components/ui/price-display';
import CountdownTimer from '@/components/ui/countdown-timer';
import ProgressBar from '@/components/ui/progress-bar';
import ShareButtons from '@/components/ui/share-buttons';
import StatusBadge from '@/components/ui/status-badge';

interface DealDetailProps {
  deal: Deal;
}

export default function DealDetail({ deal }: DealDetailProps) {
  const dealUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/deals/${deal.slug}`
    : `/deals/${deal.slug}`;

  return (
    <div className="space-y-6">
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={deal.status} />
          <span className="text-sm text-gray-500">{deal.category}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{deal.title}</h1>
        <p className="text-gray-600 text-sm leading-relaxed">{deal.description}</p>
      </div>

      {/* Price */}
      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-1">공구 특가</p>
        <PriceDisplay
          originalPrice={deal.originalPrice}
          groupPrice={deal.groupPrice}
          discountRate={deal.discountRate}
          size="lg"
        />
      </div>

      {/* Countdown + Progress */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">남은 시간</span>
          <CountdownTimer endDate={deal.endDate} />
        </div>
        <ProgressBar current={deal.currentOrders} target={deal.maxQuantity} />
      </div>

      {/* Supplier */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>공급사: {deal.supplier}</span>
        <span>최소 {deal.minQuantity}개 ~ 최대 {deal.maxQuantity}개</span>
      </div>

      {/* Share */}
      <ShareButtons url={dealUrl} title={deal.title} />
    </div>
  );
}
