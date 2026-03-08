import { log, saveJson } from './utils';
import { discoverTrends } from './trend-discovery';
import { createSocialPosts } from './social-post';
import { processAutoOrders } from './auto-order';
import { trackDeliveries } from './delivery-tracker';
import type { PipelineResult } from './types';

type StepName = 'trend' | 'social' | 'order' | 'delivery' | 'all';

const STEPS: Record<Exclude<StepName, 'all'>, { name: string; fn: () => Promise<unknown> }> = {
  trend: { name: '트렌딩 상품 발굴', fn: discoverTrends },
  social: { name: 'SNS 홍보 문구 생성', fn: createSocialPosts },
  order: { name: '발주 자동화', fn: processAutoOrders },
  delivery: { name: '배송 추적', fn: trackDeliveries },
};

async function runStep(
  stepKey: string,
  step: { name: string; fn: () => Promise<unknown> }
): Promise<PipelineResult> {
  log('PIPELINE', `=== ${step.name} 시작 ===`);
  const start = Date.now();

  try {
    const data = await step.fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log('PIPELINE', `=== ${step.name} 완료 (${elapsed}s) ===\n`);

    return {
      step: stepKey,
      success: true,
      message: `${step.name} 완료 (${elapsed}s)`,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const message = (err as Error).message;
    log('PIPELINE', `=== ${step.name} 실패 (${elapsed}s): ${message} ===\n`);

    return {
      step: stepKey,
      success: false,
      message: `${step.name} 실패: ${message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function runPipeline(stepArg: StepName): Promise<void> {
  console.log('');
  log('PIPELINE', '========================================');
  log('PIPELINE', '  공구 자동화 파이프라인 시작');
  log('PIPELINE', '========================================');
  console.log('');

  const results: PipelineResult[] = [];

  if (stepArg === 'all') {
    for (const [key, step] of Object.entries(STEPS)) {
      const result = await runStep(key, step);
      results.push(result);
      if (!result.success) {
        log('PIPELINE', `${step.name} 실패 — 후속 단계 계속 진행`);
      }
    }
  } else {
    const step = STEPS[stepArg];
    if (!step) {
      console.error(`Unknown step: ${stepArg}`);
      console.error('Available: trend | social | order | delivery | all');
      process.exit(1);
    }
    const result = await runStep(stepArg, step);
    results.push(result);
  }

  // Summary
  console.log('');
  log('PIPELINE', '========================================');
  log('PIPELINE', '  파이프라인 실행 결과');
  log('PIPELINE', '========================================');

  for (const r of results) {
    const icon = r.success ? '[OK]' : '[FAIL]';
    log('PIPELINE', `  ${icon} ${r.message}`);
  }

  const successCount = results.filter((r) => r.success).length;
  log('PIPELINE', `\n  결과: ${successCount}/${results.length} 성공`);

  saveJson('data/pipeline-log.json', results);
}

// --- CLI ---
const args = process.argv.slice(2);
let stepArg: StepName = 'all';

for (const arg of args) {
  if (arg.startsWith('--step=')) {
    stepArg = arg.split('=')[1] as StepName;
  }
}

// Also support: npx tsx scripts/pipeline.ts trend
if (args.length > 0 && !args[0].startsWith('-')) {
  stepArg = args[0] as StepName;
}

runPipeline(stepArg).catch((err) => {
  log('PIPELINE', `[FATAL] ${(err as Error).message}`);
  process.exit(1);
});
