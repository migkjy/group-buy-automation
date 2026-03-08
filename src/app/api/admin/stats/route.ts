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
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

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
    name:
      d.title.length > 12 ? d.title.slice(0, 12) + '...' : d.title,
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
