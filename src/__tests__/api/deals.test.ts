import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/deals/route';

describe('GET /api/deals', () => {
  it('returns array of deals with 200', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(3);
  });

  it('each deal has required fields', async () => {
    const response = await GET();
    const data = await response.json();
    const deal = data[0];
    expect(deal).toHaveProperty('id');
    expect(deal).toHaveProperty('title');
    expect(deal).toHaveProperty('groupPrice');
    expect(deal).toHaveProperty('status');
  });
});
