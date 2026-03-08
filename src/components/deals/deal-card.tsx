import Link from 'next/link';
import type { Deal } from '@/types/deal';
import PriceDisplay from '@/components/ui/price-display';
import CountdownTimer from '@/components/ui/countdown-timer';
import ProgressBar from '@/components/ui/progress-bar';
import StatusBadge from '@/components/ui/status-badge';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <Link href={`/deals/${deal.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute top-2 left-2">
            <StatusBadge status={deal.status} />
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
              {deal.category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
            {deal.title}
          </h3>
          <PriceDisplay
            originalPrice={deal.originalPrice}
            groupPrice={deal.groupPrice}
            discountRate={deal.discountRate}
          />
          <div className="mt-3">
            <ProgressBar current={deal.currentOrders} target={deal.maxQuantity} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <CountdownTimer endDate={deal.endDate} />
            <span className="text-xs text-gray-500">{deal.supplier}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
