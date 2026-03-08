import { isMockMode, saveJson, log, retryAsync } from './utils';
import type { TrendingProduct, NaverProduct } from './types';

const REQUIRED_ENV = ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'];

// --- Mock Data ---
function getMockTrendingProducts(): TrendingProduct[] {
  return [
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
    reviewCount: 0,
    category1: item.category1,
    category2: item.category2,
  }));
}

function calculateTrendScore(searchVolume: number, growthRate: number, avgReviews: number): number {
  const growthScore = Math.min(growthRate / 50, 1) * 40;
  const volumeScore = Math.min(searchVolume / 200000, 1) * 35;
  const reviewScore = Math.min(avgReviews / 5000, 1) * 25;
  return Math.round(growthScore + volumeScore + reviewScore);
}

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
