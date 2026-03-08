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
      `이용해 주셔서 감사합니다! 다음 공구도 기대해주세요`,
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
      `주문하기 -> ${vars.orderUrl}`,
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
