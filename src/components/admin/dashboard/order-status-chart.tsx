'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusCounts {
  pending: number;
  confirmed: number;
  cancelled: number;
}

const STATUS_CONFIG = [
  { key: 'pending', label: '대기', color: '#f59e0b' },
  { key: 'confirmed', label: '확인', color: '#10b981' },
  { key: 'cancelled', label: '취소', color: '#ef4444' },
];

export default function OrderStatusChart({
  data,
}: {
  data: StatusCounts | null;
}) {
  const total = data ? data.pending + data.confirmed + data.cancelled : 0;

  if (!data || total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          주문 상태 분포
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          아직 주문 데이터가 없습니다
        </div>
      </div>
    );
  }

  const chartData = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: data[s.key as keyof StatusCounts],
    color: s.color,
  })).filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        주문 상태 분포
      </h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={45}
              outerRadius={70}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}건`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {STATUS_CONFIG.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-600">{s.label}</span>
              <span className="font-medium text-gray-900">
                {data[s.key as keyof StatusCounts]}건
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
