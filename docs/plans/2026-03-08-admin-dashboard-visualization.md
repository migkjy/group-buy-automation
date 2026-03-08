# Admin Dashboard Data Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add data visualization charts and summary cards to the admin dashboard so admins can see sales/orders/deals at a glance.

**Architecture:** Create a `/api/admin/stats` endpoint that aggregates data from in-memory deals/orders stores. Build a client-side dashboard page at `/admin/dashboard` with recharts for charts and Tailwind for summary cards. The existing `/admin` page (deals list) stays unchanged; add a "대시보드" nav link.

**Tech Stack:** Next.js 15, recharts, TypeScript, Tailwind CSS

---

### Task 1: Install recharts

**Files:**
- Modify: `package.json`

**Step 1: Install recharts**

Run: `cd /Users/nbs22/(Claude)/(claude).projects/business-builder/projects/group-buy-automation && npm install recharts`

**Step 2: Verify install**

Run: `cat package.json | grep recharts`
Expected: `"recharts": "^2.x.x"` in dependencies

---

### Task 2: Create /api/admin/stats endpoint

**Files:**
- Create: `src/app/api/admin/stats/route.ts`

**Step 1: Create the stats API route**

```typescript
import { NextResponse } from 'next/server';
import { getDeals } from '@/lib/data/deals';
import { getOrders } from '@/lib/data/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  const deals = getDeals();
  const orders = getOrders();

  // Summary stats
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;
  const activeDeals = deals.filter((d) => d.status === 'active').length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Daily revenue for last 7 days
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayOrders = orders.filter((o) => {
      return o.createdAt.slice(0, 10) === dateStr && o.status !== 'cancelled';
    });
    dailyRevenue.push({
      date: label,
      revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
      orders: dayOrders.length,
    });
  }

  // Deal progress (goal vs current)
  const dealProgress = deals.map((d) => ({
    name: d.title.length > 12 ? d.title.slice(0, 12) + '...' : d.title,
    current: d.currentOrders,
    max: d.maxQuantity,
    percent: Math.round((d.currentOrders / d.maxQuantity) * 100),
  }));

  // Order status distribution
  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return NextResponse.json({
    summary: { totalRevenue, totalOrders, activeDeals, avgOrderValue },
    dailyRevenue,
    dealProgress,
    statusCounts,
  });
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: No errors

---

### Task 3: Create summary cards component

**Files:**
- Create: `src/components/admin/dashboard/summary-cards.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { formatPrice } from '@/lib/utils';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  activeDeals: number;
  avgOrderValue: number;
}

const icons: Record<string, string> = {
  revenue: '\u{1F4B0}',
  orders: '\u{1F4E6}',
  deals: '\u{1F525}',
  avg: '\u{1F4CA}',
};

export default function SummaryCards({ data }: { data: SummaryData | null }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-7 bg-gray-200 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { key: 'revenue', label: '총매출', value: formatPrice(data.totalRevenue), icon: icons.revenue },
    { key: 'orders', label: '총주문수', value: `${data.totalOrders}건`, icon: icons.orders },
    { key: 'deals', label: '활성딜수', value: `${data.activeDeals}개`, icon: icons.deals },
    { key: 'avg', label: '평균주문단가', value: formatPrice(data.avgOrderValue), icon: icons.avg },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{card.icon}</span>
            <span className="text-sm text-gray-500">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Task 4: Create chart components

**Files:**
- Create: `src/components/admin/dashboard/revenue-chart.tsx`
- Create: `src/components/admin/dashboard/deal-progress-chart.tsx`
- Create: `src/components/admin/dashboard/order-status-chart.tsx`

**Step 1: Create revenue chart (bar chart, 7-day daily revenue)**

```tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export default function RevenueChart({ data }: { data: DailyRevenue[] }) {
  if (!data.length || data.every((d) => d.revenue === 0)) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">매출 추이 (최근 7일)</h3>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          아직 매출 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">매출 추이 (최근 7일)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 2: Create deal progress chart (horizontal bar)**

```tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface DealProgress {
  name: string;
  current: number;
  max: number;
  percent: number;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

export default function DealProgressChart({ data }: { data: DealProgress[] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">딜별 달성률</h3>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          아직 딜 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">딜별 달성률</h3>
      <ResponsiveContainer width="100%" height={data.length * 50 + 20}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => [`${value}%`, '달성률']} />
          <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 3: Create order status donut chart**

```tsx
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

export default function OrderStatusChart({ data }: { data: StatusCounts | null }) {
  const total = data ? data.pending + data.confirmed + data.cancelled : 0;

  if (!data || total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">주문 상태 분포</h3>
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
      <h3 className="text-sm font-semibold text-gray-700 mb-4">주문 상태 분포</h3>
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
            <Tooltip formatter={(value: number) => [`${value}건`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {STATUS_CONFIG.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600">{s.label}</span>
              <span className="font-medium text-gray-900">{data[s.key as keyof StatusCounts]}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 5: Create dashboard page

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`

**Step 1: Create the dashboard page**

```tsx
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
  dealProgress: { name: string; current: number; max: number; percent: number }[];
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
```

---

### Task 6: Add dashboard link to admin sidebar

**Files:**
- Modify: `src/app/admin/layout.tsx`

**Step 1: Add dashboard nav link as first item**

Add a "대시보드" Link to `/admin/dashboard` as the first nav item in the sidebar, before "공구 관리".

```tsx
<Link
  href="/admin/dashboard"
  className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
>
  대시보드
</Link>
```

---

### Task 7: Build verification and commit

**Step 1: Run build**

Run: `cd /Users/nbs22/(Claude)/(claude).projects/business-builder/projects/group-buy-automation && npm run build`
Expected: Build succeeds with 0 errors

**Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): add dashboard data visualization with charts"
```

**Step 3: Push**

```bash
git pull --rebase origin main && git push origin main
```
