import * as fs from 'fs';
import * as path from 'path';

// Load .env from scripts directory (dotenv is optional)
try {
  const { config } = require('dotenv');
  config({ path: path.join(__dirname, '.env') });
} catch {
  // dotenv not installed — env vars must be set externally
}

export function isMockMode(requiredEnvVars: string[]): boolean {
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.log(`[MOCK MODE] Missing env vars: ${missing.join(', ')}`);
    console.log('[MOCK MODE] Running with mock data.\n');
    return true;
  }
  return false;
}

export function saveJson(filePath: string, data: unknown): void {
  const absPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[OK] Saved: ${absPath}`);
}

export function loadJson<T>(filePath: string): T | null {
  const absPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(absPath)) {
    console.log(`[WARN] File not found: ${absPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(absPath, 'utf-8')) as T;
}

export function log(step: string, message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${step}] ${message}`);
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      log('RETRY', `Attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Unreachable');
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${ts}-${rand}`;
}
