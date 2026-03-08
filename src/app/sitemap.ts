import { MetadataRoute } from 'next';
import { getDeals } from '@/lib/data/deals';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://group-buy-automation.vercel.app';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const deals = getDeals().filter((d) => d.status === 'active' || d.status === 'upcoming');

  const dealPages = deals.map((deal) => ({
    url: `${BASE_URL}/deals/${deal.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...dealPages,
  ];
}
