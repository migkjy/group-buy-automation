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
function getMockDeliveryStatus(
  trackingNumber: string
): { status: DeliveryStatus; location: string; updatedAt: string } {
  const statuses: Array<{ status: DeliveryStatus; location: string }> = [
    { status: 'preparing', location: '물류센터' },
    { status: 'shipped', location: '서울 집배센터' },
    { status: 'in_transit', location: '경기 허브터미널' },
    { status: 'out_for_delivery', location: '강남 배송센터' },
    { status: 'delivered', location: '수령완료' },
  ];

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
    log('DELIVERY', `[MOCK] ${trackingNumber} -> ${mock.status} (${mock.location})`);
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
    log('DELIVERY', '[WARN] data/orders.json 없음 — mock 주문 사용');
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
    log(
      'DELIVERY',
      `${order.orderId} (${order.customerName}): ${prev || 'unknown'} -> ${result.status} [${result.location}]`
    );

    if (prev && prev !== result.status) {
      log('DELIVERY', `  상태 변경 감지 -> 카카오 알림톡 발송`);
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
