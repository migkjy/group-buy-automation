'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Deal } from '@/types/deal';
import { formatPrice } from '@/lib/utils';

interface OrderFormProps {
  deal: Deal;
}

export default function OrderForm({ deal }: OrderFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity, setQuantity] = useState(deal.minQuantity);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    deal.options?.forEach((opt) => {
      defaults[opt.name] = opt.values[0];
    });
    return defaults;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = deal.groupPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(customerPhone.replace(/-/g, ''))) {
      setError('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          dealTitle: deal.title,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          quantity,
          selectedOptions: deal.options ? selectedOptions : undefined,
          totalPrice,
          status: 'pending' as const,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '주문 처리 중 오류가 발생했습니다.');
        return;
      }

      router.push(`/orders/${data.orderId}/confirmation`);
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = deal.status !== 'active';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">공구 참여하기</h2>

      {isDisabled && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          현재 참여할 수 없는 공구입니다.
        </p>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          id="name"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="홍길동"
          disabled={isDisabled}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          전화번호
        </label>
        <input
          id="phone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="010-1234-5678"
          disabled={isDisabled}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
        />
      </div>

      {/* Options */}
      {deal.options?.map((option) => (
        <div key={option.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {option.name}
          </label>
          <select
            value={selectedOptions[option.name]}
            onChange={(e) =>
              setSelectedOptions((prev) => ({ ...prev, [option.name]: e.target.value }))
            }
            disabled={isDisabled}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
          >
            {option.values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(deal.minQuantity, q - 1))}
            disabled={isDisabled || quantity <= deal.minQuantity}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            -
          </button>
          <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(deal.maxQuantity - deal.currentOrders, q + 1))}
            disabled={isDisabled || quantity >= deal.maxQuantity - deal.currentOrders}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">총 결제 금액</span>
        <span className="text-xl font-bold text-orange-600">{formatPrice(totalPrice)}</span>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={isDisabled || loading}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
      >
        {loading ? '처리중...' : '공구 참여하기'}
      </button>
    </form>
  );
}
