'use client';

import { useEffect, useState } from 'react';
import SummaryCards from '@/components/admin/dashboard/summary-cards';
import RevenueChart from '@/components/admin/dashboard/revenue-chart';
import DealProgressChart from '@/components/admin/dashboard/deal-progress-chart';
import OrderStatusChart from '@/components/admin/dashboard/order-status-chart';

interface StatsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    activeDeals: number;
    avgOrderValue: number;
  };
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  dealProgress: {
    name: string;
    current: number;
    max: number;
    percent: number;
  }[];
  statusCounts: { pending: number; confirmed: number; cancelled: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="space-y-6">
        <SummaryCards data={stats?.summary ?? null} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-72" />
              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-72" />
              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-72" />
            </>
          ) : (
            <>
              <RevenueChart data={stats?.dailyRevenue ?? []} />
              <DealProgressChart data={stats?.dealProgress ?? []} />
              <OrderStatusChart data={stats?.statusCounts ?? null} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
