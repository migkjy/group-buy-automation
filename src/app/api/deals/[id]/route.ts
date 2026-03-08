import { NextRequest, NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/data/deals';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const deal = getDealById(id);
  if (!deal) {
    return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json(deal);
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateDeal(id, body);
    if (!updated) {
      return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: '수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const success = deleteDeal(id);
  if (!success) {
    return NextResponse.json({ error: '공구를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
