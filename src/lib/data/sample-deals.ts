import { Deal } from '@/types/deal';

const now = new Date();
const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const sampleDeals: Deal[] = [
  {
    id: 'deal-001',
    slug: 'wireless-bluetooth-earbuds-pro',
    title: '무선 블루투스 이어폰 프로 5세대',
    description:
      '최신 블루투스 5.3 기술로 끊김 없는 사운드를 경험하세요. 액티브 노이즈 캔슬링, 36시간 배터리, IPX5 방수 등급. 일반 매장가 대비 41% 할인된 공구 특가로 만나보세요.',
    originalPrice: 89000,
    groupPrice: 52900,
    discountRate: 41,
    images: ['/images/earbuds-1.jpg', '/images/earbuds-2.jpg'],
    category: '테크',
    supplier: '사운드코리아',
    minQuantity: 1,
    maxQuantity: 100,
    currentOrders: 47,
    startDate: twoDaysAgo.toISOString(),
    endDate: threeDaysLater.toISOString(),
    status: 'active',
    options: [
      { name: '색상', values: ['블랙', '화이트', '네이비'] },
    ],
  },
  {
    id: 'deal-002',
    slug: 'premium-extra-virgin-olive-oil-set',
    title: '프리미엄 엑스트라 버진 올리브유 세트 (500ml x 2)',
    description:
      '이탈리아 남부 풀리아 지방에서 직수입한 프리미엄 올리브유. 콜드프레스 방식으로 추출하여 풍부한 풍미와 영양소를 그대로 담았습니다. 2병 세트 공구 특가!',
    originalPrice: 45000,
    groupPrice: 29900,
    discountRate: 34,
    images: ['/images/oliveoil-1.jpg', '/images/oliveoil-2.jpg'],
    category: '식품',
    supplier: '올리브팜',
    minQuantity: 1,
    maxQuantity: 200,
    currentOrders: 128,
    startDate: twoDaysAgo.toISOString(),
    endDate: fiveDaysLater.toISOString(),
    status: 'active',
    options: [
      { name: '용량', values: ['500ml x 2', '1L x 1'] },
    ],
  },
  {
    id: 'deal-003',
    slug: 'lightweight-folding-camping-chair',
    title: '경량 폴딩 캠핑 의자 (알루미늄 프레임)',
    description:
      '무게 단 1.2kg의 초경량 캠핑 의자. 항공급 알루미늄 프레임과 600D 옥스포드 원단으로 내구성이 뛰어납니다. 캠핑, 피크닉, 낚시 등 야외 활동에 최적. 전용 수납백 포함.',
    originalPrice: 68000,
    groupPrice: 39900,
    discountRate: 41,
    images: ['/images/chair-1.jpg', '/images/chair-2.jpg'],
    category: '아웃도어',
    supplier: '캠핑마스터',
    minQuantity: 1,
    maxQuantity: 150,
    currentOrders: 63,
    startDate: twoDaysAgo.toISOString(),
    endDate: sevenDaysLater.toISOString(),
    status: 'active',
    options: [
      { name: '컬러', values: ['카키', '네이비', '버건디', '블랙'] },
    ],
  },
];
