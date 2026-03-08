import DealForm from '@/components/admin/deal-form';

export default function NewDealPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">새 공구 등록</h1>
      <DealForm mode="create" />
    </div>
  );
}
