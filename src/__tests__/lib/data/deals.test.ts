import { describe, it, expect } from 'vitest';
import {
  getDeals,
  getDealBySlug,
  getDealById,
  saveDeal,
  updateDeal,
  deleteDeal,
} from '@/lib/data/deals';
import type { Deal } from '@/types/deal';

describe('deals data layer', () => {
  it('getDeals returns array with sample deals', () => {
    const deals = getDeals();
    expect(Array.isArray(deals)).toBe(true);
    expect(deals.length).toBeGreaterThanOrEqual(3);
  });

  it('getDealById finds sample deal', () => {
    const deal = getDealById('deal-001');
    expect(deal).toBeDefined();
    expect(deal!.id).toBe('deal-001');
    expect(deal!.title).toContain('블루투스');
  });

  it('getDealById returns undefined for missing id', () => {
    expect(getDealById('nonexistent')).toBeUndefined();
  });

  it('getDealBySlug finds sample deal', () => {
    const deal = getDealBySlug('wireless-bluetooth-earbuds-pro');
    expect(deal).toBeDefined();
    expect(deal!.id).toBe('deal-001');
  });

  it('getDealBySlug returns undefined for missing slug', () => {
    expect(getDealBySlug('no-such-slug')).toBeUndefined();
  });

  it('saveDeal adds a new deal', () => {
    const before = getDeals().length;
    const newDeal: Deal = {
      id: 'test-deal-save',
      slug: 'test-deal-save',
      title: 'Test Deal',
      description: 'desc',
      originalPrice: 10000,
      groupPrice: 5000,
      discountRate: 50,
      images: [],
      category: '기타',
      supplier: 'test',
      minQuantity: 1,
      maxQuantity: 10,
      currentOrders: 0,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active',
    };
    saveDeal(newDeal);
    expect(getDeals().length).toBe(before + 1);
    expect(getDealById('test-deal-save')).toBeDefined();
  });

  it('updateDeal modifies existing deal', () => {
    const updated = updateDeal('deal-001', { title: 'Updated Title' });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe('Updated Title');
  });

  it('updateDeal returns null for missing id', () => {
    expect(updateDeal('nonexistent', { title: 'x' })).toBeNull();
  });

  it('deleteDeal removes a deal', () => {
    const tempDeal: Deal = {
      id: 'test-deal-delete',
      slug: 'test-deal-delete',
      title: 'To Delete',
      description: '',
      originalPrice: 1000,
      groupPrice: 500,
      discountRate: 50,
      images: [],
      category: '기타',
      supplier: '',
      minQuantity: 1,
      maxQuantity: 10,
      currentOrders: 0,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: 'active',
    };
    saveDeal(tempDeal);
    expect(deleteDeal('test-deal-delete')).toBe(true);
    expect(getDealById('test-deal-delete')).toBeUndefined();
  });

  it('deleteDeal returns false for missing id', () => {
    expect(deleteDeal('nonexistent')).toBe(false);
  });
});
