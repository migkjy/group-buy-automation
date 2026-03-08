import { NextRequest, NextResponse } from 'next/server';
import { getDeals, saveDeal } from '@/lib/data/deals';
import { generateId, slugify } from '@/lib/utils';
import type { Deal } from '@/types/deal';

export async function GET() {
  const deals = getDeals();
  return NextResponse.json(deals);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, originalPrice, groupPrice, discountRate, images, category, supplier, minQuantity, maxQuantity, startDate, endDate, status, options } = body;

    if (!title || !originalPrice || !groupPrice) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (groupPrice >= originalPrice) {
      return NextResponse.json(
        { error: '공구가는 원가보다 낮아야 합니다.' },
        { status: 400 }
      );
    }

    const deal: Deal = {
      id: generateId(),
      slug: slugify(title) || `deal-${Date.now()}`,
      title,
      description: description || '',
      originalPrice,
      groupPrice,
      discountRate: discountRate || Math.round((1 - groupPrice / originalPrice) * 100),
      images: images || [],
      category: category || '기타',
      supplier: supplier || '',
      minQuantity: minQuantity || 1,
      maxQuantity: maxQuantity || 100,
      currentOrders: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: status || 'active',
      options: options || undefined,
    };

    saveDeal(deal);
    return NextResponse.json(deal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '공구 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
