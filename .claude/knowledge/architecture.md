# Architecture — Group Buy Automation

## 전체 구조
Next.js 16 App Router 기반 풀스택 애플리케이션. JSON 파일 기반 데이터 저장 (MVP).

## 라우트 구조
```
src/app/
├── page.tsx                    # 홈 — 진행중 공구 + 참여 방법
├── deals/                      # 공구 목록
│   └── [slug]/                 # 딜 상세 + 주문 폼
├── orders/                     # 주문 조회
│   └── [orderId]/              # 주문 상세
├── admin/
│   ├── deals/                  # 딜 CRUD (목록/등록/수정)
│   ├── dashboard/              # 매출·주문·딜 차트 대시보드
│   └── orders/                 # 주문 관리
├── api/
│   ├── deals/                  # 딜 CRUD API
│   ├── orders/                 # 주문 API
│   └── admin/stats/            # 대시보드 통계 API
├── robots.ts                   # SEO
└── sitemap.ts                  # SEO
```

## 데이터 레이어
- `data/deals.json` — 딜(공구) 데이터
- `data/orders.json` — 주문 데이터
- `src/lib/data/` — JSON 읽기/쓰기 유틸
- `src/types/` — TypeScript 타입 정의

## 컴포넌트 구조
```
src/components/
├── admin/          # 관리자 (폼, 삭제 버튼)
│   └── dashboard/  # 차트 (매출/딜진행/주문상태) — Recharts
├── deals/          # 딜 카드, 상세, 주문 폼
├── orders/         # 주문 관련
└── ui/             # 공통 UI (카운트다운, 가격, 진행바, 뱃지)
```

## 자동화 파이프라인 (`scripts/`)
1. **trend-discovery.ts** — 네이버 API 트렌딩 상품 발굴
2. **social-post.ts** — Claude API SNS 홍보 문구 생성
3. **kakao-notification.ts** — 카카오 알림톡 발송
4. **auto-order.ts** — 주문 집계 + 발주서(CSV) 생성
5. **delivery-tracker.ts** — 스마트택배 API 배송 추적
6. **pipeline.ts** — 전체 오케스트레이터 (CLI)

## 배포
- Vercel + GitHub 연동 (main push 자동 배포)
- 환경변수는 Vercel 대시보드에서 설정
