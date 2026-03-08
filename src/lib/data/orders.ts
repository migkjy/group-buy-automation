import fs from 'fs';
import path from 'path';
import { Order } from '@/types/order';
import { generateId } from '@/lib/utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrdersFile(): Order[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
    return [];
  }
  const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeOrdersFile(orders: Order[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getOrders(): Order[] {
  return readOrdersFile();
}

export function getOrderById(id: string): Order | undefined {
  return readOrdersFile().find((o) => o.id === id);
}

export function getOrdersByDealId(dealId: string): Order[] {
  return readOrdersFile().filter((o) => o.dealId === dealId);
}

export function createOrder(
  order: Omit<Order, 'id' | 'createdAt'>
): Order {
  const orders = readOrdersFile();
  const newOrder: Order = {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  writeOrdersFile(orders);
  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: Order['status']
): Order | null {
  const orders = readOrdersFile();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index].status = status;
  writeOrdersFile(orders);
  return orders[index];
}
