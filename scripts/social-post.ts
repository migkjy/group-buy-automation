import { isMockMode, loadJson, saveJson, log, retryAsync, formatKRW } from './utils';
import type { TrendingProduct, SocialPost } from './types';

const REQUIRED_ENV_CLAUDE = ['ANTHROPIC_API_KEY'];
const REQUIRED_ENV_BUFFER = ['BUFFER_ACCESS_TOKEN'];

// --- Mock Promotion Text ---
function generateMockPromotion(product: TrendingProduct): SocialPost[] {
  const topProduct = product.products[0];
  if (!topProduct) return [];

  const instagram: SocialPost = {
    platform: 'instagram',
    text:
      `지금 핫한 ${product.keyword}!\n\n` +
      `${topProduct.title}\n` +
      `공구가: ${formatKRW(Math.round(topProduct.price * 0.85))}\n` +
      `(정가 ${formatKRW(topProduct.price)}에서 15% 할인!)\n\n` +
      `이번 주 일요일까지만!\n` +
      `프로필 링크에서 바로 주문하세요`,
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
    text:
      `[공동구매] ${product.keyword} 특가!\n\n` +
      `${topProduct.title}\n` +
      `공구가: ${formatKRW(Math.round(topProduct.price * 0.85))}\n` +
      `마감: 이번 주 일요일\n\n` +
      `주문하기 -> 링크`,
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
  const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      access_token: token,
      text: post.text + '\n\n' + post.hashtags.join(' '),
      profile_ids: '',
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
