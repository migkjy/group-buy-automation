# Group Buy Automation Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete group-buy (공동구매) automation pipeline with trending product discovery, SNS promotion, Kakao notification, auto-ordering, and delivery tracking — all scripts runnable independently with mock fallback when API keys are absent.

**Architecture:** Each script is a standalone TypeScript module in `scripts/`. They share common types from `scripts/types.ts` and utilities from `scripts/utils.ts`. A pipeline orchestrator (`scripts/pipeline.ts`) chains them together via CLI. All external API calls are wrapped with mock fallback — if env vars are missing, scripts log mock output instead of failing.

**Tech Stack:** TypeScript (executed via `npx tsx`), node-fetch for HTTP, exceljs for Excel generation, dotenv for env loading, Commander for CLI.

---

## Dependency Note

**IMPORTANT:** Another PL manages `package.json`. Do NOT modify it. Instead, list all required dependencies in `scripts/DEPENDENCIES.md` for the other PL to install.

---

### Task 1: Shared Types and Utilities

**Files:**
- Create: `scripts/types.ts`
- Create: `scripts/utils.ts`
- Create: `scripts/.env.example`
- Create: `scripts/DEPENDENCIES.md`

**Step 1: Create shared types**

```typescript
// scripts/types.ts

export interface TrendingProduct {
  rank: number;
  keyword: string;
  category: string;
  searchVolume: number;
  growthRate: number; // percentage
  products: NaverProduct[];
  trendScore: number;
}

export interface NaverProduct {
  title: string;
  link: string;
  image: string;
  price: number;
  mallName: string;
  reviewCount: number;
  category1: string;
  category2: string;
}

export interface GroupBuyDeal {
  id: string;
  product: NaverProduct;
  originalPrice: number;
  groupBuyPrice: number;
  minQuantity: number;
  currentOrders: number;
  deadline: string; // ISO date
  status: 'active' | 'closed' | 'cancelled';
  supplierEmail: string;
  supplierName: string;
}

export interface Order {
  orderId: string;
  dealId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  address: string;
  orderedAt: string;
  trackingNumber?: string;
  carrier?: string;
  deliveryStatus?: DeliveryStatus;
}

export type DeliveryStatus =
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface SocialPost {
  platform: 'instagram' | 'kakao_channel';
  text: string;
  hashtags: string[];
  imageCaption: string;
  scheduledAt?: string;
}

export interface KakaoNotification {
  templateCode: string;
  recipientPhone: string;
  variables: Record<string, string>;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface PurchaseOrder {
  poNumber: string;
  supplierName: string;
  supplierEmail: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PipelineResult {
  step: string;
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: string;
}
```

**Step 2: Create utility module**

```typescript
// scripts/utils.ts
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env from scripts directory
config({ path: path.join(__dirname, '.env') });

export function isMockMode(requiredEnvVars: string[]): boolean {
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.log(`[MOCK MODE] Missing env vars: ${missing.join(', ')}`);
    console.log('[MOCK MODE] Running with mock data.\n');
    return true;
  }
  return false;
}

export function saveJson(filePath: string, data: unknown): void {
  const absPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[OK] Saved: ${absPath}`);
}

export function loadJson<T>(filePath: string): T | null {
  const absPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(absPath)) {
    console.log(`[WARN] File not found: ${absPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(absPath, 'utf-8')) as T;
}

export function log(step: string, message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${step}] ${message}`);
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      log('RETRY', `Attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Unreachable');
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${ts}-${rand}`;
}
```

**Step 3: Create .env.example**

```
# scripts/.env.example

# 네이버 API (https://developers.naver.com/)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Claude API (홍보 문구 생성)
ANTHROPIC_API_KEY=

# Buffer API (SNS 예약 발행)
BUFFER_ACCESS_TOKEN=

# 카카오 비즈메시지 (https://business.kakao.com/)
KAKAO_REST_API_KEY=
KAKAO_SENDER_KEY=

# 스마트택배 API (https://tracking.sweettracker.co.kr/)
SWEETTRACKER_API_KEY=
```

**Step 4: Create DEPENDENCIES.md**

```markdown
# Group Buy Pipeline - Required Dependencies

These packages are needed by the scripts in `scripts/`.
Ask the other PL managing `package.json` to install them.

## Runtime Dependencies
- `dotenv` - .env file loading
- `commander` - CLI argument parsing

## Dev Dependencies
- `tsx` - TypeScript execution (if not already installed)
- `typescript` - Type checking
- `@types/node` - Node.js type definitions

## Notes
- All HTTP calls use native `fetch` (Node 18+)
- Excel generation uses simple CSV (no extra deps)
- Scripts are designed to run with `npx tsx scripts/<name>.ts`
```

**Step 5: Commit**

```bash
git add scripts/types.ts scripts/utils.ts scripts/.env.example scripts/DEPENDENCIES.md
git commit -m "feat(group-buy): add shared types, utils, env template, and dependency list"
```

---

### Task 2: Trending Product Discovery Script

**Files:**
- Create: `scripts/trend-discovery.ts`

**Step 1: Create the trend discovery script**

```typescript
// scripts/trend-discovery.ts
import { isMockMode, saveJson, log, retryAsync, generateId } from './utils';
import type { TrendingProduct, NaverProduct } from './types';

const REQUIRED_ENV = ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'];

// --- Mock Data ---
function getMockTrendingProducts(): TrendingProduct[] {
  const mockProducts: TrendingProduct[] = [
    {
      rank: 1,
      keyword: '무선청소기',
      category: '가전',
      searchVolume: 152000,
      growthRate: 34.5,
      trendScore: 92,
      products: [
        {
          title: '다이슨 V15 디텍트 무선청소기',
          link: 'https://example.com/product/1',
          image: 'https://example.com/img/1.jpg',
          price: 899000,
          mallName: '다이슨 공식스토어',
          reviewCount: 3421,
          category1: '가전',
          category2: '청소기',
        },
        {
          title: '삼성 비스포크 제트 무선청소기',
          link: 'https://example.com/product/2',
          image: 'https://example.com/img/2.jpg',
          price: 699000,
          mallName: '삼성전자',
          reviewCount: 2890,
          category1: '가전',
          category2: '청소기',
        },
      ],
    },
    {
      rank: 2,
      keyword: '에어프라이어',
      category: '주방',
      searchVolume: 98000,
      growthRate: 28.2,
      trendScore: 85,
      products: [
        {
          title: '필립스 에어프라이어 XXL',
          link: 'https://example.com/product/3',
          image: 'https://example.com/img/3.jpg',
          price: 329000,
          mallName: '필립스 공식몰',
          reviewCount: 5621,
          category1: '주방',
          category2: '에어프라이어',
        },
      ],
    },
    {
      rank: 3,
      keyword: '선크림',
      category: '뷰티',
      searchVolume: 210000,
      growthRate: 45.1,
      trendScore: 88,
      products: [
        {
          title: '아이소이 선크림 SPF50+',
          link: 'https://example.com/product/4',
          image: 'https://example.com/img/4.jpg',
          price: 28000,
          mallName: '아이소이',
          reviewCount: 8920,
          category1: '뷰티',
          category2: '선케어',
        },
      ],
    },
  ];
  return mockProducts;
}

// --- Naver API Integration ---
async function searchNaverShopping(keyword: string): Promise<NaverProduct[]> {
  const clientId = process.env.NAVER_CLIENT_ID!;
  const clientSecret = process.env.NAVER_CLIENT_SECRET!;

  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(keyword)}&display=10&sort=sim`;

  const response = await retryAsync(() =>
    fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })
  );

  if (!response.ok) {
    throw new Error(`Naver API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    items: Array<{
      title: string;
      link: string;
      image: string;
      lprice: string;
      mallName: string;
      category1: string;
      category2: string;
    }>;
  };

  return data.items.map((item) => ({
    title: item.title.replace(/<\/?b>/g, ''),
    link: item.link,
    image: item.image,
    price: parseInt(item.lprice, 10),
    mallName: item.mallName,
    reviewCount: 0, // Naver Shopping API doesn't return review count directly
    category1: item.category1,
    category2: item.category2,
  }));
}

function calculateTrendScore(searchVolume: number, growthRate: number, avgReviews: number): number {
  // Weighted score: 40% growth rate, 35% search volume, 25% reviews
  const growthScore = Math.min(growthRate / 50, 1) * 40;
  const volumeScore = Math.min(searchVolume / 200000, 1) * 35;
  const reviewScore = Math.min(avgReviews / 5000, 1) * 25;
  return Math.round(growthScore + volumeScore + reviewScore);
}

// --- Trending Keywords (hardcoded categories for demo) ---
const TRENDING_CATEGORIES = [
  { keyword: '무선청소기', category: '가전' },
  { keyword: '에어프라이어', category: '주방' },
  { keyword: '선크림', category: '뷰티' },
  { keyword: '캠핑의자', category: '아웃도어' },
  { keyword: '단백질쉐이크', category: '건강' },
];

async function discoverTrends(): Promise<TrendingProduct[]> {
  const useMock = isMockMode(REQUIRED_ENV);

  if (useMock) {
    log('TREND', '트렌딩 상품 발굴 시작 (MOCK MODE)');
    const products = getMockTrendingProducts();
    log('TREND', `${products.length}개 트렌딩 키워드 발견`);
    products.forEach((p) => {
      log('TREND', `  #${p.rank} ${p.keyword} (${p.category}) — 트렌드 점수: ${p.trendScore}, 검색량: ${p.searchVolume.toLocaleString()}`);
    });
    saveJson('data/trending-products.json', products);
    return products;
  }

  log('TREND', '트렌딩 상품 발굴 시작 (LIVE MODE)');
  const results: TrendingProduct[] = [];

  for (let i = 0; i < TRENDING_CATEGORIES.length; i++) {
    const { keyword, category } = TRENDING_CATEGORIES[i];
    log('TREND', `검색 중: ${keyword}...`);

    try {
      const products = await searchNaverShopping(keyword);
      const avgReviews = products.reduce((sum, p) => sum + p.reviewCount, 0) / (products.length || 1);
      // Simulated growth rate (would come from Datalab in production)
      const growthRate = Math.random() * 50 + 10;
      const searchVolume = Math.floor(Math.random() * 200000 + 50000);
      const trendScore = calculateTrendScore(searchVolume, growthRate, avgReviews);

      results.push({
        rank: i + 1,
        keyword,
        category,
        searchVolume,
        growthRate: Math.round(growthRate * 10) / 10,
        products: products.slice(0, 5),
        trendScore,
      });

      log('TREND', `  ${keyword}: ${products.length}개 상품, 트렌드 점수 ${trendScore}`);
    } catch (err) {
      log('TREND', `  [ERROR] ${keyword}: ${(err as Error).message}`);
    }

    // Rate limiting
    if (i < TRENDING_CATEGORIES.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  results.sort((a, b) => b.trendScore - a.trendScore);
  results.forEach((r, i) => (r.rank = i + 1));

  saveJson('data/trending-products.json', results);
  log('TREND', `완료: ${results.length}개 트렌딩 카테고리 저장됨`);
  return results;
}

// --- Entry Point ---
if (require.main === module) {
  discoverTrends()
    .then(() => log('TREND', '트렌딩 발굴 완료!'))
    .catch((err) => {
      log('TREND', `[FATAL] ${(err as Error).message}`);
      process.exit(1);
    });
}

export { discoverTrends };
```

**Step 2: Commit**

```bash
git add scripts/trend-discovery.ts
git commit -m "feat(group-buy): add trending product discovery with Naver API + mock fallback"
```

---

### Task 3: SNS Auto-Promotion Script

**Files:**
- Create: `scripts/social-post.ts`

**Step 1: Create the social post script**

```typescript
// scripts/social-post.ts
import { isMockMode, loadJson, saveJson, log, retryAsync, formatKRW } from './utils';
import type { TrendingProduct, SocialPost, GroupBuyDeal } from './types';

const REQUIRED_ENV_CLAUDE = ['ANTHROPIC_API_KEY'];
const REQUIRED_ENV_BUFFER = ['BUFFER_ACCESS_TOKEN'];

// --- Mock Promotion Text ---
function generateMockPromotion(product: TrendingProduct): SocialPost[] {
  const topProduct = product.products[0];
  if (!topProduct) return [];

  const instagram: SocialPost = {
    platform: 'instagram',
    text: `🔥 지금 핫한 ${product.keyword}!\n\n` +
      `✅ ${topProduct.title}\n` +
      `💰 공구가: ${formatKRW(Math.round(topProduct.price * 0.85))}\n` +
      `(정가 ${formatKRW(topProduct.price)}에서 15% 할인!)\n\n` +
      `⏰ 이번 주 일요일까지만!\n` +
      `👆 프로필 링크에서 바로 주문하세요`,
    hashtags: [
      `#${product.keyword}`,
      '#공동구매',
      '#공구',
      '#최저가',
      `#${product.category}`,
      '#오늘의공구',
      '#공구스타그램',
    ],
    imageCaption: `${product.keyword} 공동구매 — 한정 수량 특가!`,
  };

  const kakao: SocialPost = {
    platform: 'kakao_channel',
    text: `[공동구매] ${product.keyword} 특가!\n\n` +
      `${topProduct.title}\n` +
      `공구가: ${formatKRW(Math.round(topProduct.price * 0.85))}\n` +
      `마감: 이번 주 일요일\n\n` +
      `주문하기 👉 링크`,
    hashtags: [],
    imageCaption: `${product.keyword} 공구 특가`,
  };

  return [instagram, kakao];
}

// --- Claude API for Promotion Copy ---
async function generateWithClaude(product: TrendingProduct): Promise<SocialPost[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const topProduct = product.products[0];
  if (!topProduct) return [];

  const prompt = `당신은 한국 공동구매(공구) 전문 마케터입니다.
아래 상품 정보로 인스타그램용, 카카오 채널용 홍보 텍스트를 각각 작성해주세요.

상품: ${topProduct.title}
카테고리: ${product.category}
정가: ${formatKRW(topProduct.price)}
공구가: ${formatKRW(Math.round(topProduct.price * 0.85))} (15% 할인)
트렌드 키워드: ${product.keyword}
검색량: ${product.searchVolume.toLocaleString()}

요구사항:
1. 인스타그램: hook으로 시작, 이모지 활용, 해시태그 7개, CTA 포함
2. 카카오 채널: 간결하고 정보 중심, 링크 유도

JSON 형식으로 응답:
{
  "instagram": { "text": "...", "hashtags": ["..."], "imageCaption": "..." },
  "kakao": { "text": "...", "hashtags": [], "imageCaption": "..." }
}`;

  const response = await retryAsync(() =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  );

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const text = result.content[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as {
    instagram: { text: string; hashtags: string[]; imageCaption: string };
    kakao: { text: string; hashtags: string[]; imageCaption: string };
  };

  return [
    { platform: 'instagram' as const, ...parsed.instagram },
    { platform: 'kakao_channel' as const, ...parsed.kakao },
  ];
}

// --- Buffer API for Scheduling ---
async function scheduleToBuffer(post: SocialPost): Promise<void> {
  if (isMockMode(REQUIRED_ENV_BUFFER)) {
    log('SOCIAL', `[MOCK] Buffer 예약: ${post.platform} — "${post.text.substring(0, 50)}..."`);
    return;
  }

  const token = process.env.BUFFER_ACCESS_TOKEN!;
  // Buffer API v1 create update
  const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      access_token: token,
      text: post.text + '\n\n' + post.hashtags.join(' '),
      profile_ids: '', // Would need actual profile IDs
      scheduled_at: post.scheduledAt || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Buffer API error: ${response.status}`);
  }
  log('SOCIAL', `Buffer 예약 완료: ${post.platform}`);
}

// --- Main ---
async function createSocialPosts(): Promise<SocialPost[]> {
  log('SOCIAL', 'SNS 홍보 문구 생성 시작');

  const trending = loadJson<TrendingProduct[]>('data/trending-products.json');
  if (!trending || trending.length === 0) {
    log('SOCIAL', '[ERROR] data/trending-products.json 없음. trend-discovery.ts를 먼저 실행하세요.');
    return [];
  }

  const allPosts: SocialPost[] = [];
  const useMockClaude = isMockMode(REQUIRED_ENV_CLAUDE);

  for (const product of trending.slice(0, 3)) {
    log('SOCIAL', `홍보 문구 생성: ${product.keyword}`);

    let posts: SocialPost[];
    if (useMockClaude) {
      posts = generateMockPromotion(product);
    } else {
      try {
        posts = await generateWithClaude(product);
      } catch (err) {
        log('SOCIAL', `[ERROR] Claude API 실패, mock 사용: ${(err as Error).message}`);
        posts = generateMockPromotion(product);
      }
    }

    for (const post of posts) {
      console.log(`\n--- ${post.platform.toUpperCase()} ---`);
      console.log(post.text);
      if (post.hashtags.length > 0) {
        console.log('\n' + post.hashtags.join(' '));
      }
      console.log(`캡션: ${post.imageCaption}`);
      allPosts.push(post);
    }
  }

  saveJson('data/social-posts.json', allPosts);
  log('SOCIAL', `완료: ${allPosts.length}개 홍보 문구 생성됨`);
  return allPosts;
}

if (require.main === module) {
  createSocialPosts()
    .then(() => log('SOCIAL', 'SNS 홍보 생성 완료!'))
    .catch((err) => {
      log('SOCIAL', `[FATAL] ${(err as Error).message}`);
      process.exit(1);
    });
}

export { createSocialPosts };
```

**Step 2: Commit**

```bash
git add scripts/social-post.ts
git commit -m "feat(group-buy): add SNS auto-promotion with Claude API + Buffer + mock fallback"
```

---

### Task 4: Kakao Notification Script

**Files:**
- Create: `scripts/kakao-notification.ts`

**Step 1: Create the Kakao notification script**

```typescript
// scripts/kakao-notification.ts
import { isMockMode, log, retryAsync } from './utils';
import type { KakaoNotification, Order, GroupBuyDeal } from './types';

const REQUIRED_ENV = ['KAKAO_REST_API_KEY', 'KAKAO_SENDER_KEY'];

// --- Templates ---
const TEMPLATES = {
  ORDER_CONFIRM: {
    code: 'ORDER_CONFIRM',
    title: '주문 확인',
    buildMessage: (vars: Record<string, string>) =>
      `[주문 확인]\n\n` +
      `${vars.customerName}님, 주문이 접수되었습니다.\n\n` +
      `상품: ${vars.productName}\n` +
      `수량: ${vars.quantity}개\n` +
      `결제금액: ${vars.totalPrice}\n` +
      `주문번호: ${vars.orderId}\n\n` +
      `공구 마감 후 순차 발송됩니다.`,
  },
  SHIPPING_START: {
    code: 'SHIPPING_START',
    title: '배송 시작',
    buildMessage: (vars: Record<string, string>) =>
      `[배송 시작]\n\n` +
      `${vars.customerName}님, 주문하신 상품이 발송되었습니다.\n\n` +
      `상품: ${vars.productName}\n` +
      `택배사: ${vars.carrier}\n` +
      `운송장: ${vars.trackingNumber}\n\n` +
      `배송 조회: ${vars.trackingUrl}`,
  },
  SHIPPING_COMPLETE: {
    code: 'SHIPPING_COMPLETE',
    title: '배송 완료',
    buildMessage: (vars: Record<string, string>) =>
      `[배송 완료]\n\n` +
      `${vars.customerName}님, 상품이 배송 완료되었습니다.\n\n` +
      `상품: ${vars.productName}\n` +
      `수령일: ${vars.deliveryDate}\n\n` +
      `이용해 주셔서 감사합니다! 다음 공구도 기대해주세요 🎉`,
  },
  DEAL_CLOSING: {
    code: 'DEAL_CLOSING',
    title: '공구 마감 임박',
    buildMessage: (vars: Record<string, string>) =>
      `[마감 임박]\n\n` +
      `${vars.customerName}님, 관심 있으셨던 공구가 곧 마감됩니다!\n\n` +
      `상품: ${vars.productName}\n` +
      `공구가: ${vars.groupBuyPrice}\n` +
      `마감: ${vars.deadline}\n` +
      `현재 주문: ${vars.currentOrders}건\n\n` +
      `주문하기 👉 ${vars.orderUrl}`,
  },
} as const;

type TemplateKey = keyof typeof TEMPLATES;

// --- Kakao Biz Message API ---
async function sendKakaoAlimtalk(notification: KakaoNotification): Promise<boolean> {
  const useMock = isMockMode(REQUIRED_ENV);

  if (useMock) {
    const template = TEMPLATES[notification.templateCode as TemplateKey];
    const message = template
      ? template.buildMessage(notification.variables)
      : `[${notification.templateCode}] ${JSON.stringify(notification.variables)}`;

    log('KAKAO', `[MOCK] 알림톡 발송:`);
    log('KAKAO', `  수신: ${notification.recipientPhone}`);
    log('KAKAO', `  템플릿: ${notification.templateCode}`);
    console.log(message);
    console.log('---');
    return true;
  }

  const apiKey = process.env.KAKAO_REST_API_KEY!;
  const senderKey = process.env.KAKAO_SENDER_KEY!;

  const template = TEMPLATES[notification.templateCode as TemplateKey];
  if (!template) {
    log('KAKAO', `[ERROR] Unknown template: ${notification.templateCode}`);
    return false;
  }

  const message = template.buildMessage(notification.variables);

  // Kakao Biz Message API
  const response = await retryAsync(() =>
    fetch('https://bizapi.kakao.com/v2/sender/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        senderKey,
        templateCode: notification.templateCode,
        recipientNo: notification.recipientPhone,
        message,
      }),
    })
  );

  if (!response.ok) {
    log('KAKAO', `[ERROR] 알림톡 발송 실패: ${response.status}`);
    return false;
  }

  log('KAKAO', `알림톡 발송 완료: ${notification.recipientPhone} (${notification.templateCode})`);
  return true;
}

// --- Convenience Functions ---
async function sendOrderConfirmation(order: Order, productName: string): Promise<boolean> {
  return sendKakaoAlimtalk({
    templateCode: 'ORDER_CONFIRM',
    recipientPhone: order.customerPhone,
    variables: {
      customerName: order.customerName,
      productName,
      quantity: String(order.quantity),
      totalPrice: new Intl.NumberFormat('ko-KR').format(order.totalPrice) + '원',
      orderId: order.orderId,
    },
    status: 'pending',
  });
}

async function sendShippingNotification(order: Order, productName: string): Promise<boolean> {
  return sendKakaoAlimtalk({
    templateCode: 'SHIPPING_START',
    recipientPhone: order.customerPhone,
    variables: {
      customerName: order.customerName,
      productName,
      carrier: order.carrier || '택배사',
      trackingNumber: order.trackingNumber || '',
      trackingUrl: `https://trace.cjlogistics.com/web/detail.jsp?slipno=${order.trackingNumber || ''}`,
    },
    status: 'pending',
  });
}

async function sendDealClosingAlert(
  phone: string,
  customerName: string,
  deal: GroupBuyDeal
): Promise<boolean> {
  return sendKakaoAlimtalk({
    templateCode: 'DEAL_CLOSING',
    recipientPhone: phone,
    variables: {
      customerName,
      productName: deal.product.title,
      groupBuyPrice: new Intl.NumberFormat('ko-KR').format(deal.groupBuyPrice) + '원',
      deadline: new Date(deal.deadline).toLocaleDateString('ko-KR'),
      currentOrders: String(deal.currentOrders),
      orderUrl: 'https://example.com/deals/' + deal.id,
    },
    status: 'pending',
  });
}

// --- Demo Entry Point ---
async function runDemo(): Promise<void> {
  log('KAKAO', '카카오 알림톡 데모 시작');

  const mockOrder: Order = {
    orderId: 'ORD-20260308-001',
    dealId: 'DEAL-001',
    customerName: '김철수',
    customerPhone: '01012345678',
    quantity: 2,
    totalPrice: 56000,
    address: '서울시 강남구 테헤란로 123',
    orderedAt: new Date().toISOString(),
    trackingNumber: '1234567890',
    carrier: 'CJ대한통운',
  };

  await sendOrderConfirmation(mockOrder, '에어프라이어 공구');
  await sendShippingNotification(mockOrder, '에어프라이어 공구');

  const mockDeal: GroupBuyDeal = {
    id: 'DEAL-001',
    product: {
      title: '필립스 에어프라이어 XXL',
      link: '',
      image: '',
      price: 329000,
      mallName: '필립스',
      reviewCount: 5621,
      category1: '주방',
      category2: '에어프라이어',
    },
    originalPrice: 329000,
    groupBuyPrice: 279000,
    minQuantity: 10,
    currentOrders: 8,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    supplierEmail: 'supplier@example.com',
    supplierName: '필립스 유통',
  };

  await sendDealClosingAlert('01098765432', '박영희', mockDeal);

  log('KAKAO', '데모 완료!');
}

if (require.main === module) {
  runDemo().catch((err) => {
    log('KAKAO', `[FATAL] ${(err as Error).message}`);
    process.exit(1);
  });
}

export { sendOrderConfirmation, sendShippingNotification, sendDealClosingAlert, sendKakaoAlimtalk };
```

**Step 2: Commit**

```bash
git add scripts/kakao-notification.ts
git commit -m "feat(group-buy): add Kakao alimtalk notification with 4 templates + mock mode"
```

---

### Task 5: Auto-Order Script

**Files:**
- Create: `scripts/auto-order.ts`

**Step 1: Create the auto-order script**

```typescript
// scripts/auto-order.ts
import * as fs from 'fs';
import * as path from 'path';
import { loadJson, saveJson, log, formatKRW, generateId } from './utils';
import type { Order, GroupBuyDeal, PurchaseOrder, PurchaseOrderItem } from './types';

// --- Mock Data ---
function getMockOrders(): Order[] {
  return [
    {
      orderId: 'ORD-001',
      dealId: 'DEAL-001',
      customerName: '김철수',
      customerPhone: '01012345678',
      quantity: 2,
      totalPrice: 558000,
      address: '서울시 강남구 테헤란로 123',
      orderedAt: '2026-03-07T10:00:00Z',
    },
    {
      orderId: 'ORD-002',
      dealId: 'DEAL-001',
      customerName: '이영희',
      customerPhone: '01098765432',
      quantity: 1,
      totalPrice: 279000,
      address: '서울시 서초구 반포대로 45',
      orderedAt: '2026-03-07T11:30:00Z',
    },
    {
      orderId: 'ORD-003',
      dealId: 'DEAL-001',
      customerName: '박민수',
      customerPhone: '01055556666',
      quantity: 3,
      totalPrice: 837000,
      address: '경기도 성남시 분당구 판교로 200',
      orderedAt: '2026-03-07T14:00:00Z',
    },
    {
      orderId: 'ORD-004',
      dealId: 'DEAL-002',
      customerName: '최수진',
      customerPhone: '01077778888',
      quantity: 1,
      totalPrice: 899000,
      address: '서울시 마포구 월드컵로 100',
      orderedAt: '2026-03-07T15:00:00Z',
    },
  ];
}

function getMockDeals(): GroupBuyDeal[] {
  return [
    {
      id: 'DEAL-001',
      product: {
        title: '필립스 에어프라이어 XXL',
        link: '',
        image: '',
        price: 329000,
        mallName: '필립스',
        reviewCount: 5621,
        category1: '주방',
        category2: '에어프라이어',
      },
      originalPrice: 329000,
      groupBuyPrice: 279000,
      minQuantity: 5,
      currentOrders: 6,
      deadline: '2026-03-09T23:59:59Z',
      status: 'active',
      supplierEmail: 'order@philips-kr.com',
      supplierName: '필립스코리아 유통',
    },
    {
      id: 'DEAL-002',
      product: {
        title: '다이슨 V15 디텍트 무선청소기',
        link: '',
        image: '',
        price: 1050000,
        mallName: '다이슨',
        reviewCount: 3421,
        category1: '가전',
        category2: '청소기',
      },
      originalPrice: 1050000,
      groupBuyPrice: 899000,
      minQuantity: 3,
      currentOrders: 1,
      deadline: '2026-03-10T23:59:59Z',
      status: 'active',
      supplierEmail: 'wholesale@dyson-kr.com',
      supplierName: '다이슨코리아',
    },
  ];
}

// --- Order Aggregation ---
function aggregateOrders(orders: Order[], deals: GroupBuyDeal[]): Map<string, { deal: GroupBuyDeal; orders: Order[]; totalQty: number }> {
  const grouped = new Map<string, { deal: GroupBuyDeal; orders: Order[]; totalQty: number }>();

  for (const deal of deals) {
    const dealOrders = orders.filter((o) => o.dealId === deal.id);
    const totalQty = dealOrders.reduce((sum, o) => sum + o.quantity, 0);
    grouped.set(deal.id, { deal, orders: dealOrders, totalQty });
  }

  return grouped;
}

// --- CSV Generation ---
function generateCsv(po: PurchaseOrder): string {
  const header = '상품명,수량,단가,소계';
  const rows = po.items.map(
    (item) => `"${item.productName}",${item.quantity},${item.unitPrice},${item.subtotal}`
  );
  const footer = `\n합계,,,${po.totalAmount}`;

  return [
    `발주서 번호: ${po.poNumber}`,
    `공급사: ${po.supplierName}`,
    `이메일: ${po.supplierEmail}`,
    `생성일: ${po.createdAt}`,
    '',
    header,
    ...rows,
    footer,
  ].join('\n');
}

// --- Main ---
async function processAutoOrders(): Promise<PurchaseOrder[]> {
  log('ORDER', '발주 자동화 시작');

  // Load or use mock data
  let orders = loadJson<Order[]>('data/orders.json');
  let deals = loadJson<GroupBuyDeal[]>('data/deals.json');

  if (!orders || orders.length === 0) {
    log('ORDER', '[MOCK] data/orders.json 없음 — mock 데이터 사용');
    orders = getMockOrders();
    saveJson('data/orders.json', orders);
  }

  if (!deals || deals.length === 0) {
    log('ORDER', '[MOCK] data/deals.json 없음 — mock 데이터 사용');
    deals = getMockDeals();
    saveJson('data/deals.json', deals);
  }

  const aggregated = aggregateOrders(orders, deals);
  const purchaseOrders: PurchaseOrder[] = [];

  for (const [dealId, { deal, orders: dealOrders, totalQty }] of aggregated) {
    log('ORDER', `\n--- 공구: ${deal.product.title} ---`);
    log('ORDER', `  주문 건수: ${dealOrders.length}건, 총 수량: ${totalQty}개`);
    log('ORDER', `  최소 수량: ${deal.minQuantity}개`);

    if (totalQty < deal.minQuantity) {
      log('ORDER', `  ⚠️ 최소 수량 미달! (${totalQty}/${deal.minQuantity}) — 발주 보류`);
      continue;
    }

    log('ORDER', `  ✅ 최소 수량 충족 — 발주서 생성`);

    const po: PurchaseOrder = {
      poNumber: generateId('PO'),
      supplierName: deal.supplierName,
      supplierEmail: deal.supplierEmail,
      items: [
        {
          productName: deal.product.title,
          quantity: totalQty,
          unitPrice: deal.groupBuyPrice,
          subtotal: totalQty * deal.groupBuyPrice,
        },
      ],
      totalAmount: totalQty * deal.groupBuyPrice,
      createdAt: new Date().toISOString(),
    };

    purchaseOrders.push(po);

    // Generate CSV file
    const csv = generateCsv(po);
    const csvPath = `data/purchase-orders/${po.poNumber}.csv`;
    const absPath = path.resolve(__dirname, '..', csvPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, csv, 'utf-8');

    log('ORDER', `  발주서 저장: ${csvPath}`);
    log('ORDER', `  공급사: ${deal.supplierName} (${deal.supplierEmail})`);
    log('ORDER', `  금액: ${formatKRW(po.totalAmount)}`);

    // Print CSV preview
    console.log('\n' + csv + '\n');
  }

  saveJson('data/purchase-orders-summary.json', purchaseOrders);
  log('ORDER', `\n발주 완료: ${purchaseOrders.length}건 발주서 생성`);
  return purchaseOrders;
}

if (require.main === module) {
  processAutoOrders().catch((err) => {
    log('ORDER', `[FATAL] ${(err as Error).message}`);
    process.exit(1);
  });
}

export { processAutoOrders };
```

**Step 2: Commit**

```bash
git add scripts/auto-order.ts
git commit -m "feat(group-buy): add auto-order aggregation with CSV purchase order generation"
```

---

### Task 6: Delivery Tracker Script

**Files:**
- Create: `scripts/delivery-tracker.ts`

**Step 1: Create the delivery tracker script**

```typescript
// scripts/delivery-tracker.ts
import { isMockMode, loadJson, saveJson, log, retryAsync } from './utils';
import { sendShippingNotification } from './kakao-notification';
import type { Order, DeliveryStatus } from './types';

const REQUIRED_ENV = ['SWEETTRACKER_API_KEY'];

// --- Carrier Codes ---
const CARRIERS: Record<string, string> = {
  'CJ대한통운': '04',
  '한진택배': '05',
  '롯데택배': '08',
  '우체국택배': '01',
  '로젠택배': '06',
};

// --- Mock Delivery Status ---
function getMockDeliveryStatus(trackingNumber: string): { status: DeliveryStatus; location: string; updatedAt: string } {
  const statuses: Array<{ status: DeliveryStatus; location: string }> = [
    { status: 'preparing', location: '물류센터' },
    { status: 'shipped', location: '서울 집배센터' },
    { status: 'in_transit', location: '경기 허브터미널' },
    { status: 'out_for_delivery', location: '강남 배송센터' },
    { status: 'delivered', location: '수령완료' },
  ];

  // Deterministic mock based on tracking number
  const idx = parseInt(trackingNumber.slice(-1), 10) % statuses.length;
  return {
    ...statuses[idx],
    updatedAt: new Date().toISOString(),
  };
}

// --- SweetTracker API ---
async function getDeliveryStatus(
  carrier: string,
  trackingNumber: string
): Promise<{ status: DeliveryStatus; location: string; updatedAt: string }> {
  const useMock = isMockMode(REQUIRED_ENV);

  if (useMock) {
    const mock = getMockDeliveryStatus(trackingNumber);
    log('DELIVERY', `[MOCK] ${trackingNumber} → ${mock.status} (${mock.location})`);
    return mock;
  }

  const apiKey = process.env.SWEETTRACKER_API_KEY!;
  const carrierCode = CARRIERS[carrier] || '04';

  const url = `https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${apiKey}&t_code=${carrierCode}&t_invoice=${trackingNumber}`;

  const response = await retryAsync(() => fetch(url));

  if (!response.ok) {
    throw new Error(`SweetTracker API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    completeYN: string;
    trackingDetails: Array<{
      where: string;
      kind: string;
      timeString: string;
    }>;
  };

  const latest = data.trackingDetails?.[data.trackingDetails.length - 1];
  let status: DeliveryStatus = 'preparing';

  if (data.completeYN === 'Y') {
    status = 'delivered';
  } else if (latest?.kind?.includes('배달출발')) {
    status = 'out_for_delivery';
  } else if (latest?.kind?.includes('발송')) {
    status = 'shipped';
  } else if (data.trackingDetails?.length > 0) {
    status = 'in_transit';
  }

  return {
    status,
    location: latest?.where || '알 수 없음',
    updatedAt: latest?.timeString || new Date().toISOString(),
  };
}

// --- Main ---
async function trackDeliveries(): Promise<void> {
  log('DELIVERY', '배송 추적 시작');

  let orders = loadJson<Order[]>('data/orders.json');
  if (!orders || orders.length === 0) {
    log('DELIVERY', '[WARN] data/orders.json 없음');
    // Create mock orders with tracking info
    orders = [
      {
        orderId: 'ORD-001',
        dealId: 'DEAL-001',
        customerName: '김철수',
        customerPhone: '01012345678',
        quantity: 2,
        totalPrice: 558000,
        address: '서울시 강남구',
        orderedAt: '2026-03-07T10:00:00Z',
        trackingNumber: '1234567890',
        carrier: 'CJ대한통운',
      },
      {
        orderId: 'ORD-002',
        dealId: 'DEAL-001',
        customerName: '이영희',
        customerPhone: '01098765432',
        quantity: 1,
        totalPrice: 279000,
        address: '서울시 서초구',
        orderedAt: '2026-03-07T11:30:00Z',
        trackingNumber: '9876543211',
        carrier: 'CJ대한통운',
      },
    ];
  }

  const tracked = orders.filter((o) => o.trackingNumber && o.carrier);
  if (tracked.length === 0) {
    log('DELIVERY', '추적할 주문 없음 (운송장 미입력)');
    return;
  }

  log('DELIVERY', `추적 대상: ${tracked.length}건`);

  for (const order of tracked) {
    const prev = order.deliveryStatus;
    const result = await getDeliveryStatus(order.carrier!, order.trackingNumber!);

    order.deliveryStatus = result.status;
    log('DELIVERY', `${order.orderId} (${order.customerName}): ${prev || 'unknown'} → ${result.status} [${result.location}]`);

    // Notify on status change
    if (prev && prev !== result.status) {
      log('DELIVERY', `  상태 변경 감지 → 카카오 알림톡 발송`);
      await sendShippingNotification(order, '공구 상품');
    }
  }

  saveJson('data/orders.json', orders);
  log('DELIVERY', '배송 추적 완료');
}

if (require.main === module) {
  trackDeliveries().catch((err) => {
    log('DELIVERY', `[FATAL] ${(err as Error).message}`);
    process.exit(1);
  });
}

export { trackDeliveries, getDeliveryStatus };
```

**Step 2: Commit**

```bash
git add scripts/delivery-tracker.ts
git commit -m "feat(group-buy): add delivery tracking with SweetTracker API + auto Kakao alerts"
```

---

### Task 7: Pipeline Orchestrator

**Files:**
- Create: `scripts/pipeline.ts`

**Step 1: Create the pipeline orchestrator**

```typescript
// scripts/pipeline.ts
import { log, saveJson } from './utils';
import { discoverTrends } from './trend-discovery';
import { createSocialPosts } from './social-post';
import { processAutoOrders } from './auto-order';
import { trackDeliveries } from './delivery-tracker';
import type { PipelineResult } from './types';

type StepName = 'trend' | 'social' | 'order' | 'delivery' | 'all';

const STEPS: Record<Exclude<StepName, 'all'>, { name: string; fn: () => Promise<unknown> }> = {
  trend: { name: '트렌딩 상품 발굴', fn: discoverTrends },
  social: { name: 'SNS 홍보 문구 생성', fn: createSocialPosts },
  order: { name: '발주 자동화', fn: processAutoOrders },
  delivery: { name: '배송 추적', fn: trackDeliveries },
};

async function runStep(stepKey: string, step: { name: string; fn: () => Promise<unknown> }): Promise<PipelineResult> {
  log('PIPELINE', `=== ${step.name} 시작 ===`);
  const start = Date.now();

  try {
    const data = await step.fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log('PIPELINE', `=== ${step.name} 완료 (${elapsed}s) ===\n`);

    return {
      step: stepKey,
      success: true,
      message: `${step.name} 완료 (${elapsed}s)`,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const message = (err as Error).message;
    log('PIPELINE', `=== ${step.name} 실패 (${elapsed}s): ${message} ===\n`);

    return {
      step: stepKey,
      success: false,
      message: `${step.name} 실패: ${message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function runPipeline(stepArg: StepName): Promise<void> {
  console.log('');
  log('PIPELINE', '╔══════════════════════════════════╗');
  log('PIPELINE', '║  공구 자동화 파이프라인 시작     ║');
  log('PIPELINE', '╚══════════════════════════════════╝');
  console.log('');

  const results: PipelineResult[] = [];

  if (stepArg === 'all') {
    for (const [key, step] of Object.entries(STEPS)) {
      const result = await runStep(key, step);
      results.push(result);
      if (!result.success) {
        log('PIPELINE', `⚠️ ${step.name} 실패 — 후속 단계 계속 진행`);
      }
    }
  } else {
    const step = STEPS[stepArg];
    if (!step) {
      console.error(`Unknown step: ${stepArg}`);
      console.error('Available: trend | social | order | delivery | all');
      process.exit(1);
    }
    const result = await runStep(stepArg, step);
    results.push(result);
  }

  // Summary
  console.log('');
  log('PIPELINE', '╔══════════════════════════════════╗');
  log('PIPELINE', '║  파이프라인 실행 결과            ║');
  log('PIPELINE', '╚══════════════════════════════════╝');

  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    log('PIPELINE', `  ${icon} ${r.message}`);
  }

  const successCount = results.filter((r) => r.success).length;
  log('PIPELINE', `\n  결과: ${successCount}/${results.length} 성공`);

  saveJson('data/pipeline-log.json', results);
}

// --- CLI ---
const args = process.argv.slice(2);
let stepArg: StepName = 'all';

for (const arg of args) {
  if (arg.startsWith('--step=')) {
    stepArg = arg.split('=')[1] as StepName;
  }
}

// Also support: npx tsx scripts/pipeline.ts trend
if (args.length > 0 && !args[0].startsWith('-')) {
  stepArg = args[0] as StepName;
}

runPipeline(stepArg).catch((err) => {
  log('PIPELINE', `[FATAL] ${(err as Error).message}`);
  process.exit(1);
});
```

**Step 2: Commit**

```bash
git add scripts/pipeline.ts
git commit -m "feat(group-buy): add pipeline orchestrator with CLI step selection"
```

---

### Task 8: Final Verification and README

**Files:**
- Create: `scripts/README.md`

**Step 1: Create README**

Write a README documenting all scripts, usage, and mock mode behavior.

**Step 2: Run verification**

```bash
cd projects/group-buy-automation
npx tsx scripts/pipeline.ts --step=trend
```

Expected: Mock mode runs, saves data/trending-products.json.

**Step 3: Final commit**

```bash
git add scripts/README.md
git commit -m "docs(group-buy): add pipeline README with usage instructions"
```
