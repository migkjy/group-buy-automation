import fs from 'fs';
import path from 'path';
import { Deal } from '@/types/deal';
import { sampleDeals } from './sample-deals';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDealsFile(): Deal[] {
  ensureDataDir();
  if (!fs.existsSync(DEALS_FILE)) {
    fs.writeFileSync(DEALS_FILE, JSON.stringify(sampleDeals, null, 2));
    return sampleDeals;
  }
  const raw = fs.readFileSync(DEALS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDealsFile(deals: Deal[]) {
  ensureDataDir();
  fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
}

export function getDeals(): Deal[] {
  return readDealsFile();
}

export function getDealBySlug(slug: string): Deal | undefined {
  return readDealsFile().find((d) => d.slug === slug);
}

export function getDealById(id: string): Deal | undefined {
  return readDealsFile().find((d) => d.id === id);
}

export function saveDeal(deal: Deal): void {
  const deals = readDealsFile();
  deals.push(deal);
  writeDealsFile(deals);
}

export function updateDeal(id: string, updates: Partial<Deal>): Deal | null {
  const deals = readDealsFile();
  const index = deals.findIndex((d) => d.id === id);
  if (index === -1) return null;
  deals[index] = { ...deals[index], ...updates };
  writeDealsFile(deals);
  return deals[index];
}

export function deleteDeal(id: string): boolean {
  const deals = readDealsFile();
  const filtered = deals.filter((d) => d.id !== id);
  if (filtered.length === deals.length) return false;
  writeDealsFile(filtered);
  return true;
}
