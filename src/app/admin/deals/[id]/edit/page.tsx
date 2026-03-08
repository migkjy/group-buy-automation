import { notFound } from 'next/navigation';
import { getDealById } from '@/lib/data/deals';
import DealForm from '@/components/admin/deal-form';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditDealPage({ params }: Props) {
  const { id } = await params;
  const deal = getDealById(id);

  if (!deal) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">공구 수정</h1>
      <DealForm mode="edit" deal={deal} />
    </div>
  );
}
