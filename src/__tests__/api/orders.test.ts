import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/orders/route';

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/orders', () => {
  it('creates order with valid data (201)', async () => {
    const res = await POST(
      makeRequest({
        dealId: 'deal-002',
        dealTitle: '올리브유',
        customerName: '테스트',
        customerPhone: '010-1111-2222',
        quantity: 1,
        totalPrice: 29900,
        status: 'pending',
      })
    );
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.orderId).toBeDefined();
  });

  it('rejects missing required fields (400)', async () => {
    const res = await POST(
      makeRequest({
        dealId: 'deal-002',
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('rejects non-existent deal (404)', async () => {
    const res = await POST(
      makeRequest({
        dealId: 'nonexistent',
        customerName: '테스트',
        customerPhone: '010-1111-2222',
        quantity: 1,
      })
    );
    expect(res.status).toBe(404);
  });

  it('rejects invalid quantity (400)', async () => {
    const res = await POST(
      makeRequest({
        dealId: 'deal-003',
        customerName: '테스트',
        customerPhone: '010-1111-2222',
        quantity: 99999,
      })
    );
    expect(res.status).toBe(400);
  });
});
