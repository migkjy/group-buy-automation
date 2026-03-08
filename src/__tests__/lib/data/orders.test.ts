import { describe, it, expect } from 'vitest';
import {
  getOrders,
  getOrderById,
  getOrdersByDealId,
  createOrder,
  updateOrderStatus,
} from '@/lib/data/orders';

describe('orders data layer', () => {
  it('getOrders returns an array', () => {
    const orders = getOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it('createOrder creates and returns order with id+createdAt', () => {
    const order = createOrder({
      dealId: 'deal-001',
      dealTitle: 'Test',
      customerName: '홍길동',
      customerPhone: '010-1234-5678',
      quantity: 2,
      totalPrice: 105800,
      status: 'pending',
    });

    expect(order.id).toBeDefined();
    expect(order.createdAt).toBeDefined();
    expect(order.customerName).toBe('홍길동');
    expect(order.quantity).toBe(2);
  });

  it('getOrderById finds created order', () => {
    const order = createOrder({
      dealId: 'deal-002',
      dealTitle: 'Test2',
      customerName: '김철수',
      customerPhone: '010-9999-8888',
      quantity: 1,
      totalPrice: 29900,
      status: 'pending',
    });

    const found = getOrderById(order.id);
    expect(found).toBeDefined();
    expect(found!.customerName).toBe('김철수');
  });

  it('getOrderById returns undefined for missing id', () => {
    expect(getOrderById('nonexistent')).toBeUndefined();
  });

  it('getOrdersByDealId filters by dealId', () => {
    const orders = getOrdersByDealId('deal-001');
    expect(orders.length).toBeGreaterThanOrEqual(1);
    orders.forEach((o) => expect(o.dealId).toBe('deal-001'));
  });

  it('updateOrderStatus changes status', () => {
    const order = createOrder({
      dealId: 'deal-003',
      dealTitle: 'Test3',
      customerName: '이영희',
      customerPhone: '010-5555-6666',
      quantity: 1,
      totalPrice: 39900,
      status: 'pending',
    });

    const updated = updateOrderStatus(order.id, 'confirmed');
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('confirmed');
  });

  it('updateOrderStatus returns null for missing id', () => {
    expect(updateOrderStatus('nonexistent', 'confirmed')).toBeNull();
  });
});
