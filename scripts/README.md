# Group Buy Automation Pipeline Scripts

공동구매(공구) 자동화 파이프라인 스크립트 모음.

## Scripts

| Script | Description |
|--------|-------------|
| `trend-discovery.ts` | 네이버 API로 트렌딩 상품 발굴 + 트렌드 점수 계산 |
| `social-post.ts` | Claude API로 인스타그램/카카오 채널 홍보 문구 자동 생성 |
| `kakao-notification.ts` | 카카오 알림톡 발송 (주문확인/배송시작/배송완료/마감임박) |
| `auto-order.ts` | 주문 집계 + 공급사별 발주서(CSV) 자동 생성 |
| `delivery-tracker.ts` | 스마트택배 API 배송 추적 + 상태 변경 시 알림톡 |
| `pipeline.ts` | 전체 파이프라인 오케스트레이터 (CLI) |

## Usage

```bash
# 개별 스크립트 실행
npx tsx scripts/trend-discovery.ts
npx tsx scripts/social-post.ts
npx tsx scripts/kakao-notification.ts
npx tsx scripts/auto-order.ts
npx tsx scripts/delivery-tracker.ts

# 파이프라인 전체 실행
npx tsx scripts/pipeline.ts

# 특정 단계만 실행
npx tsx scripts/pipeline.ts --step=trend
npx tsx scripts/pipeline.ts --step=social
npx tsx scripts/pipeline.ts --step=order
npx tsx scripts/pipeline.ts --step=delivery

# 또는 positional argument
npx tsx scripts/pipeline.ts trend
```

## Mock Mode

API 키가 없으면 자동으로 mock 데이터로 동작합니다.
`.env.example`을 `.env`로 복사 후 키를 입력하면 실제 API를 사용합니다.

```bash
cp scripts/.env.example scripts/.env
# 키 입력 후 실행
```

## Data Files

실행 결과는 `data/` 디렉토리에 저장됩니다:

- `data/trending-products.json` - 트렌딩 상품 목록
- `data/social-posts.json` - 생성된 SNS 홍보 문구
- `data/orders.json` - 주문 데이터
- `data/deals.json` - 공구 딜 데이터
- `data/purchase-orders/` - 발주서 CSV 파일
- `data/purchase-orders-summary.json` - 발주 요약
- `data/pipeline-log.json` - 파이프라인 실행 로그
