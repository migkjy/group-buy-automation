import { Deal } from '@/types/deal';
import { sampleDeals } from './sample-deals';

// In-memory store (initialized from sample data)
// Vercel serverless: no persistent fs write, so use memory
let dealsStore: Deal[] = [...sampleDeals];

export function getDeals(): Deal[] {
  return dealsStore;
}

export function getDealBySlug(slug: string): Deal | undefined {
  return dealsStore.find((d) => d.slug === slug);
}

export function getDealById(id: string): Deal | undefined {
  return dealsStore.find((d) => d.id === id);
}

export function saveDeal(deal: Deal): void {
  dealsStore.push(deal);
}

export function updateDeal(id: string, updates: Partial<Deal>): Deal | null {
  const index = dealsStore.findIndex((d) => d.id === id);
  if (index === -1) return null;
  dealsStore[index] = { ...dealsStore[index], ...updates };
  return dealsStore[index];
}

export function deleteDeal(id: string): boolean {
  const before = dealsStore.length;
  dealsStore = dealsStore.filter((d) => d.id !== id);
  return dealsStore.length < before;
}
