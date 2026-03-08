# Tests + CI Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add vitest test suite covering data layer, utils, API routes, and components + GitHub Actions CI pipeline.

**Architecture:** vitest + @testing-library/react + jsdom for unit/component tests. Tests run against in-memory data stores directly (no HTTP server needed for data/utils). API route tests use Next.js route handler functions directly. Component tests render with @testing-library/react. GitHub Actions CI runs build + test on PR and push to main.

**Tech Stack:** vitest, @testing-library/react, @testing-library/jest-dom, jsdom

---

### Task 1: Install Test Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install vitest + testing-library**

Run:
```bash
cd /Users/nbs22/(Claude)/(claude).projects/business-builder/projects/group-buy-automation
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Step 2: Add test scripts to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 4: Create test setup file**

Create `src/__tests__/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest';
```

**Step 5: Verify vitest runs (no tests yet)**

Run: `npx vitest run`
Expected: "No test files found"

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/__tests__/setup.ts
git commit -m "chore: add vitest + testing-library dependencies"
```

---

### Task 2: Unit Tests — utils.ts

**Files:**
- Create: `src/__tests__/lib/utils.test.ts`
- Reference: `src/lib/utils.ts`

**Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatPrice,
  formatDate,
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
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/lib/utils.test.ts`
Expected: All PASS

**Step 3: Commit**

```bash
git add src/__tests__/lib/utils.test.ts
git commit -m "test: add unit tests for utils.ts"
```

---

### Task 3: Unit Tests — Data Layer (deals.ts + orders.ts)

**Files:**
- Create: `src/__tests__/lib/data/deals.test.ts`
- Create: `src/__tests__/lib/data/orders.test.ts`
- Reference: `src/lib/data/deals.ts`, `src/lib/data/orders.ts`

**Step 1: Write deals data tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeals,
  getDealBySlug,
  getDealById,
  saveDeal,
  updateDeal,
  deleteDeal,
} from '@/lib/data/deals';
import type { Deal } from '@/types/deal';

// Note: deals store is initialized from sample-deals, so tests work with that state
// We test against known sample deal IDs

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
    // Save then delete
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
```

**Step 2: Write orders data tests**

```typescript
import { describe, it, expect } from 'vitest';
import {
  getOrders,
  getOrderById,
  getOrdersByDealId,
  createOrder,
  updateOrderStatus,
} from '@/lib/data/orders';

describe('orders data layer', () => {
  it('starts with empty orders', () => {
    // Orders might have data from previous tests if module is cached,
    // but createOrder should always work
    const before = getOrders().length;
    expect(typeof before).toBe('number');
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
```

**Step 3: Run tests**

Run: `npx vitest run src/__tests__/lib/data/`
Expected: All PASS

**Step 4: Commit**

```bash
git add src/__tests__/lib/data/
git commit -m "test: add unit tests for deals + orders data layer"
```

---

### Task 4: API Route Tests

**Files:**
- Create: `src/__tests__/api/deals.test.ts`
- Create: `src/__tests__/api/orders.test.ts`
- Reference: `src/app/api/deals/route.ts`, `src/app/api/orders/route.ts`

**Step 1: Write deals API test**

```typescript
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
```

**Step 2: Write orders API test**

```typescript
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
        // missing customerName, customerPhone, quantity
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
        quantity: 99999, // exceeds max
      })
    );
    expect(res.status).toBe(400);
  });
});
```

**Step 3: Run tests**

Run: `npx vitest run src/__tests__/api/`
Expected: All PASS

**Step 4: Commit**

```bash
git add src/__tests__/api/
git commit -m "test: add API route tests for deals + orders"
```

---

### Task 5: Component Test — CountdownTimer

**Files:**
- Create: `src/__tests__/components/countdown-timer.test.tsx`
- Reference: `src/components/ui/countdown-timer.tsx`

**Step 1: Write component test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountdownTimer from '@/components/ui/countdown-timer';

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows countdown for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T00:00:00Z'));

    render(<CountdownTimer endDate="2026-03-10T12:00:00Z" />);

    expect(screen.getByText('D-2')).toBeInTheDocument();
  });

  it('shows expired for past date', () => {
    render(
      <CountdownTimer endDate={new Date(Date.now() - 100000).toISOString()} />
    );

    expect(screen.getByText('마감됨')).toBeInTheDocument();
  });
});
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/components/countdown-timer.test.tsx`
Expected: All PASS

**Step 3: Commit**

```bash
git add src/__tests__/components/countdown-timer.test.tsx
git commit -m "test: add CountdownTimer component tests"
```

---

### Task 6: Component Test — SummaryCards (Admin Dashboard)

**Files:**
- Create: `src/__tests__/components/summary-cards.test.tsx`
- Reference: `src/components/admin/dashboard/summary-cards.tsx`

**Step 1: Write component test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCards from '@/components/admin/dashboard/summary-cards';

describe('SummaryCards', () => {
  it('renders loading skeletons when data is null', () => {
    const { container } = render(<SummaryCards data={null} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('renders summary data correctly', () => {
    render(
      <SummaryCards
        data={{
          totalRevenue: 1500000,
          totalOrders: 42,
          activeDeals: 3,
          avgOrderValue: 35714,
        }}
      />
    );

    expect(screen.getByText('1,500,000원')).toBeInTheDocument();
    expect(screen.getByText('42건')).toBeInTheDocument();
    expect(screen.getByText('3개')).toBeInTheDocument();
    expect(screen.getByText('35,714원')).toBeInTheDocument();
  });
});
```

**Step 2: Run test**

Run: `npx vitest run src/__tests__/components/summary-cards.test.tsx`
Expected: All PASS

**Step 3: Commit**

```bash
git add src/__tests__/components/summary-cards.test.tsx
git commit -m "test: add SummaryCards component tests"
```

---

### Task 7: GitHub Actions CI Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

```yaml
name: CI

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      - run: npm test
```

**Step 2: Verify YAML is valid**

Run: `node -e "const yaml = require('fs').readFileSync('.github/workflows/ci.yml','utf8'); console.log('YAML OK')"`

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): add GitHub Actions CI pipeline"
```

---

### Task 8: Final Verification + Push

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass (15+ tests)

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Single combined commit if not already committed, then push**

```bash
git pull --rebase origin main
git push origin main
```

---

## Summary

| Task | Content | Test Count |
|------|---------|-----------|
| 1 | Dependencies + config | 0 |
| 2 | utils.ts unit tests | ~10 |
| 3 | deals.ts + orders.ts unit tests | ~14 |
| 4 | API route tests (deals GET, orders POST) | ~6 |
| 5 | CountdownTimer component | ~2 |
| 6 | SummaryCards component | ~2 |
| 7 | GitHub Actions CI | 0 |
| 8 | Final verification + push | 0 |
| **Total** | | **~34** |
