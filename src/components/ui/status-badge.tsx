import type { Deal } from '@/types/deal';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Deal['status'];
}

const statusConfig: Record<Deal['status'], { label: string; className: string }> = {
  active: { label: '진행중', className: 'bg-green-100 text-green-800' },
  upcoming: { label: '예정', className: 'bg-blue-100 text-blue-800' },
  closed: { label: '마감', className: 'bg-gray-100 text-gray-600' },
  sold_out: { label: '품절', className: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
