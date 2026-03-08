'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Deal, DealOption } from '@/types/deal';

interface DealFormProps {
  deal?: Deal;
  mode: 'create' | 'edit';
}

export default function DealForm({ deal, mode }: DealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(deal?.title || '');
  const [description, setDescription] = useState(deal?.description || '');
  const [originalPrice, setOriginalPrice] = useState(deal?.originalPrice || 0);
  const [groupPrice, setGroupPrice] = useState(deal?.groupPrice || 0);
  const [category, setCategory] = useState(deal?.category || '');
  const [supplier, setSupplier] = useState(deal?.supplier || '');
  const [minQuantity, setMinQuantity] = useState(deal?.minQuantity || 1);
  const [maxQuantity, setMaxQuantity] = useState(deal?.maxQuantity || 100);
  const [endDate, setEndDate] = useState(
    deal?.endDate ? new Date(deal.endDate).toISOString().slice(0, 16) : ''
  );
  const [status, setStatus] = useState<Deal['status']>(deal?.status || 'active');
  const [imagesText, setImagesText] = useState(deal?.images?.join(', ') || '');
  const [options, setOptions] = useState<DealOption[]>(deal?.options || []);

  const discountRate = originalPrice > 0
    ? Math.round((1 - groupPrice / originalPrice) * 100)
    : 0;

  const addOption = () => {
    setOptions([...options, { name: '', values: [''] }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionName = (index: number, name: string) => {
    const updated = [...options];
    updated[index].name = name;
    setOptions(updated);
  };

  const updateOptionValues = (index: number, values: string) => {
    const updated = [...options];
    updated[index].values = values.split(',').map((v) => v.trim()).filter(Boolean);
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !originalPrice || !groupPrice) {
      setError('상품명, 원가, 공구가는 필수 항목입니다.');
      return;
    }
    if (groupPrice >= originalPrice) {
      setError('공구가는 원가보다 낮아야 합니다.');
      return;
    }
    if (minQuantity > maxQuantity) {
      setError('최소 수량이 최대 수량보다 클 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        originalPrice,
        groupPrice,
        discountRate,
        images: imagesText.split(',').map((s) => s.trim()).filter(Boolean),
        category: category.trim() || '기타',
        supplier: supplier.trim(),
        minQuantity,
        maxQuantity,
        startDate: deal?.startDate || new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status,
        options: options.length > 0 ? options.filter((o) => o.name && o.values.length > 0) : undefined,
      };

      const url = mode === 'create' ? '/api/deals' : `/api/deals/${deal?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '저장 중 오류가 발생했습니다.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="상품명을 입력하세요"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="상품 설명을 입력하세요"
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">원가 (원) *</label>
          <input
            type="number"
            min="0"
            value={originalPrice || ''}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공구가 (원) *</label>
          <input
            type="number"
            min="0"
            value={groupPrice || ''}
            onChange={(e) => setGroupPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
      {discountRate > 0 && (
        <p className="text-sm text-red-600">할인율: {discountRate}%</p>
      )}

      {/* Category + Supplier */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="테크, 식품, 아웃도어..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공급사</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최소 수량</label>
          <input
            type="number"
            value={minQuantity}
            min="1"
            onChange={(e) => setMinQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최대 수량</label>
          <input
            type="number"
            value={maxQuantity}
            min="1"
            onChange={(e) => setMaxQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* End date + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">마감일시</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Deal['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="upcoming">예정</option>
            <option value="active">진행중</option>
            <option value="closed">마감</option>
            <option value="sold_out">품절</option>
          </select>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL (쉼표 구분)</label>
        <input
          type="text"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/images/product-1.jpg, /images/product-2.jpg"
        />
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">옵션</label>
          <button
            type="button"
            onClick={addOption}
            className="text-xs text-orange-600 hover:underline"
          >
            + 옵션 추가
          </button>
        </div>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={opt.name}
              onChange={(e) => updateOptionName(i, e.target.value)}
              placeholder="옵션명 (예: 색상)"
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <input
              type="text"
              value={opt.values.join(', ')}
              onChange={(e) => updateOptionValues(i, e.target.value)}
              placeholder="값 (쉼표 구분: 블랙, 화이트)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="text-red-500 text-sm px-2 hover:text-red-700"
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300"
      >
        {loading ? '저장중...' : mode === 'create' ? '공구 등록' : '수정 저장'}
      </button>
    </form>
  );
}
