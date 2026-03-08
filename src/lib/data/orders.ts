import { Order } from '@/types/order';
import { generateId } from '@/lib/utils';

// In-memory store
// Vercel serverless: no persistent fs write, so use memory
let ordersStore: Order[] = [];

export function getOrders(): Order[] {
  return ordersStore;
}

export function getOrderById(id: string): Order | undefined {
  return ordersStore.find((o) => o.id === id);
}

export function getOrdersByDealId(dealId: string): Order[] {
  return ordersStore.filter((o) => o.dealId === dealId);
}

export function createOrder(
  order: Omit<Order, 'id' | 'createdAt'>
): Order {
  const newOrder: Order = {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  ordersStore.push(newOrder);
  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: Order['status']
): Order | null {
  const index = ordersStore.findIndex((o) => o.id === id);
  if (index === -1) return null;
  ordersStore[index].status = status;
  return ordersStore[index];
}
