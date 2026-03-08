import * as fs from 'fs';
import * as path from 'path';
import { loadJson, saveJson, log, formatKRW, generateId } from './utils';
import type { Order, GroupBuyDeal, PurchaseOrder } from './types';

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
function aggregateOrders(
  orders: Order[],
  deals: GroupBuyDeal[]
): Map<string, { deal: GroupBuyDeal; orders: Order[]; totalQty: number }> {
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

  for (const [_dealId, { deal, orders: dealOrders, totalQty }] of aggregated) {
    log('ORDER', `\n--- 공구: ${deal.product.title} ---`);
    log('ORDER', `  주문 건수: ${dealOrders.length}건, 총 수량: ${totalQty}개`);
    log('ORDER', `  최소 수량: ${deal.minQuantity}개`);

    if (totalQty < deal.minQuantity) {
      log('ORDER', `  최소 수량 미달! (${totalQty}/${deal.minQuantity}) — 발주 보류`);
      continue;
    }

    log('ORDER', `  최소 수량 충족 — 발주서 생성`);

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

    const csv = generateCsv(po);
    const csvPath = `data/purchase-orders/${po.poNumber}.csv`;
    const absPath = path.resolve(__dirname, '..', csvPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, csv, 'utf-8');

    log('ORDER', `  발주서 저장: ${csvPath}`);
    log('ORDER', `  공급사: ${deal.supplierName} (${deal.supplierEmail})`);
    log('ORDER', `  금액: ${formatKRW(po.totalAmount)}`);

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
