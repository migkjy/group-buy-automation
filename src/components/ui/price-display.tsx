import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  originalPrice: number;
  groupPrice: number;
  discountRate: number;
  size?: 'sm' | 'lg';
}

export default function PriceDisplay({
  originalPrice,
  groupPrice,
  discountRate,
  size = 'sm',
}: PriceDisplayProps) {
  const isLarge = size === 'lg';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-red-600 font-bold ${isLarge ? 'text-sm px-2 py-0.5' : 'text-xs px-1.5 py-0.5'} bg-red-50 rounded`}
      >
        {discountRate}%
      </span>
      <span
        className={`font-bold text-gray-900 ${isLarge ? 'text-2xl' : 'text-lg'}`}
      >
        {formatPrice(groupPrice)}
      </span>
      <span
        className={`text-gray-400 line-through ${isLarge ? 'text-base' : 'text-sm'}`}
      >
        {formatPrice(originalPrice)}
      </span>
    </div>
  );
}
