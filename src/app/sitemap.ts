import { MetadataRoute } from 'next';
import { getDeals } from '@/lib/data/deals';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const deals = getDeals().filter((d) => d.status === 'active' || d.status === 'upcoming');

  const dealPages = deals.map((deal) => ({
    url: `/deals/${deal.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: '/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: '/deals',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...dealPages,
  ];
}
