import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDealBySlug } from '@/lib/data/deals';
import DealDetail from '@/components/deals/deal-detail';
import OrderForm from '@/components/deals/order-form';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) return { title: '공구를 찾을 수 없습니다' };

  return {
    title: deal.title,
    description: deal.description,
    openGraph: {
      title: deal.title,
      description: deal.description,
      type: 'website',
      locale: 'ko_KR',
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function DealPage({ params }: Props) {
  const { slug } = await params;
  const deal = getDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.description,
    category: deal.category,
    offers: {
      '@type': 'Offer',
      price: deal.groupPrice,
      priceCurrency: 'KRW',
      availability:
        deal.status === 'active'
          ? 'https://schema.org/InStock'
          : deal.status === 'sold_out'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/PreOrder',
      validThrough: deal.endDate,
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DealDetail deal={deal} />
        <div className="lg:sticky lg:top-20 lg:self-start">
          <OrderForm deal={deal} />
        </div>
      </div>
    </div>
  );
}
