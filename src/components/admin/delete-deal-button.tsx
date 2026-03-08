'use client';

import { useRouter } from 'next/navigation';

interface DeleteDealButtonProps {
  dealId: string;
  dealTitle: string;
}

export default function DeleteDealButton({ dealId, dealTitle }: DeleteDealButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`"${dealTitle}" 공구를 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/deals/${dealId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-600 hover:underline"
    >
      삭제
    </button>
  );
}
