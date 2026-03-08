import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/data/orders';
import { getDealById, updateDeal } from '@/lib/data/deals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, dealTitle, customerName, customerPhone, quantity, selectedOptions, totalPrice, status } = body;

    // Validate required fields
    if (!dealId || !customerName || !customerPhone || !quantity) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Verify deal exists and is active
    const deal = getDealById(dealId);
    if (!deal) {
      return NextResponse.json(
        { success: false, error: '해당 공구를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (deal.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '현재 참여할 수 없는 공구입니다.' },
        { status: 400 }
      );
    }

    // Check quantity bounds
    if (quantity < deal.minQuantity || quantity > deal.maxQuantity - deal.currentOrders) {
      return NextResponse.json(
        { success: false, error: '주문 수량이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    // Create order
    const order = createOrder({
      dealId,
      dealTitle: dealTitle || deal.title,
      customerName,
      customerPhone,
      quantity,
      selectedOptions,
      totalPrice: totalPrice || deal.groupPrice * quantity,
      status: status || 'pending',
    });

    // Update deal's current orders count
    updateDeal(dealId, {
      currentOrders: deal.currentOrders + quantity,
    });

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '주문 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
