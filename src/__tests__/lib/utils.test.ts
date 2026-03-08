import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatPrice,
  calculateTimeLeft,
  generateId,
  cn,
  slugify,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('formats Korean won with comma separator', () => {
    expect(formatPrice(52900)).toBe('52,900원');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0원');
  });
});

describe('calculateTimeLeft', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns time remaining for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T00:00:00Z'));

    const result = calculateTimeLeft('2026-03-09T12:30:45Z');
    expect(result.expired).toBe(false);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(12);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(45);
  });

  it('returns expired for past date', () => {
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const result = calculateTimeLeft(pastDate);
    expect(result.expired).toBe(true);
    expect(result.days).toBe(0);
  });
});

describe('generateId', () => {
  it('returns a UUID string', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('returns unique values', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles Korean text', () => {
    expect(slugify('무선 이어폰')).toBe('무선-이어폰');
  });

  it('removes special characters', () => {
    expect(slugify('price: $100!')).toBe('price-100');
  });
});
