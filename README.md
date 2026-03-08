# 공구마켓 (Group Buy Automation)

공동구매/공구판매 자동화 플랫폼. 딜 관리, 주문 수집, 배송 추적, SNS 홍보 자동화, 트렌드 상품 발굴까지 공동구매 운영 전 과정을 자동화합니다.

## 주요 기능

- **딜(공구) 관리**: 상품 등록, 가격 설정, 마감 관리, 상태 변경
- **주문 수집**: 고객 주문 접수, 주문 확인, 결제 추적
- **관리자 대시보드**: 매출/주문/딜 현황 차트 (Recharts)
- **자동화 파이프라인**: 트렌드 발굴 → SNS 홍보 → 발주서 생성 → 배송 추적
- **알림**: 카카오 알림톡 자동 발송 (주문확인/배송/마감임박)

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4, Geist Font |
| Charts | Recharts 3 |
| Data | JSON 파일 기반 (MVP) |
| Test | Vitest, Testing Library |
| Lint | ESLint 9 |
| Deploy | Vercel (Git 연동 자동 배포) |

## 로컬 개발 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (선택 — 없어도 mock 모드로 동작)
cp .env.example .env
cp scripts/.env.example scripts/.env

# 3. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인.

## 환경변수

루트 `.env.example` 참조. 모든 변수는 **선택**이며, 미설정 시 mock 데이터로 동작합니다.

| 변수 | 용도 | 필수 |
|------|------|------|
| `NAVER_CLIENT_ID` | 네이버 검색 API — 트렌드 상품 발굴 | 선택 |
| `NAVER_CLIENT_SECRET` | 네이버 검색 API Secret | 선택 |
| `ANTHROPIC_API_KEY` | Claude API — SNS 홍보 문구 자동 생성 | 선택 |
| `BUFFER_ACCESS_TOKEN` | Buffer API — SNS 예약 발행 | 선택 |
| `KAKAO_REST_API_KEY` | 카카오 비즈메시지 — 알림톡 발송 | 선택 |
| `KAKAO_SENDER_KEY` | 카카오 발신 프로필 키 | 선택 |
| `SWEETTRACKER_API_KEY` | 스마트택배 API — 배송 추적 | 선택 |

## 프로젝트 구조

```
group-buy-automation/
├── src/
│   ├── app/
│   │   ├── page.tsx                # 홈 — 진행중 공구 + 참여 방법
│   │   ├── deals/                  # 공구 목록 + 상세 페이지
│   │   │   └── [slug]/             # 개별 딜 상세 + 주문 폼
│   │   ├── orders/                 # 주문 조회
│   │   │   └── [orderId]/          # 주문 상세 + 확인
│   │   ├── admin/                  # 관리자 영역
│   │   │   ├── deals/              # 딜 CRUD (목록/등록/수정)
│   │   │   ├── dashboard/          # 매출·주문·딜 차트 대시보드
│   │   │   └── orders/             # 주문 관리
│   │   └── api/                    # API Routes
│   │       ├── deals/              # 딜 CRUD API
│   │       ├── orders/             # 주문 API
│   │       └── admin/stats/        # 대시보드 통계 API
│   ├── components/
│   │   ├── admin/                  # 관리자 컴포넌트 (폼, 삭제 버튼)
│   │   │   └── dashboard/          # 차트 컴포넌트 (매출/딜진행/주문상태)
│   │   ├── deals/                  # 딜 카드, 상세, 주문 폼
│   │   ├── orders/                 # 주문 관련 컴포넌트
│   │   └── ui/                     # 공통 UI (카운트다운, 가격, 진행바, 뱃지)
│   ├── lib/
│   │   ├── data/                   # JSON 데이터 읽기/쓰기
│   │   └── utils.ts                # 유틸리티 (가격 포맷 등)
│   ├── types/                      # TypeScript 타입 정의
│   └── __tests__/                  # 테스트 파일
├── scripts/                        # 자동화 파이프라인 스크립트
├── data/                           # JSON 데이터 저장소 (MVP)
├── docs/                           # 설계 문서, 플랜
└── public/                         # 정적 파일
```

## 관리자 대시보드

`/admin/dashboard` 에서 접근. 4개 차트로 운영 현황을 한눈에 파악합니다.

- **요약 카드**: 총 매출, 총 주문 수, 활성 딜 수, 평균 주문 금액
- **일별 매출 차트**: 날짜별 매출 + 주문 수 추이 (BarChart)
- **딜 진행률 차트**: 각 딜의 목표 대비 현재 주문 달성률 (BarChart)
- **주문 상태 차트**: 대기/확인/취소 비율 (PieChart)

## 자동화 파이프라인

`scripts/` 디렉토리의 스크립트들로 공동구매 운영을 자동화합니다.

| 스크립트 | 기능 |
|----------|------|
| `trend-discovery.ts` | 네이버 API로 트렌딩 상품 발굴 + 트렌드 점수 계산 |
| `social-post.ts` | Claude API로 인스타그램/카카오 채널 홍보 문구 자동 생성 |
| `kakao-notification.ts` | 카카오 알림톡 발송 (주문확인/배송시작/배송완료/마감임박) |
| `auto-order.ts` | 주문 집계 + 공급사별 발주서(CSV) 자동 생성 |
| `delivery-tracker.ts` | 스마트택배 API 배송 추적 + 상태 변경 시 알림톡 |
| `pipeline.ts` | 전체 파이프라인 오케스트레이터 (CLI) |

### 파이프라인 실행

```bash
# 전체 파이프라인 실행
npx tsx scripts/pipeline.ts

# 특정 단계만 실행
npx tsx scripts/pipeline.ts --step=trend
npx tsx scripts/pipeline.ts --step=social
npx tsx scripts/pipeline.ts --step=order
npx tsx scripts/pipeline.ts --step=delivery

# 개별 스크립트 직접 실행
npx tsx scripts/trend-discovery.ts
```

실행 결과는 `data/` 디렉토리에 JSON/CSV로 저장됩니다.

## 스크립트 및 테스트

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 테스트 실행
npm test

# 테스트 워치 모드
npm run test:watch

# 린트
npm run lint
```

## 배포

Vercel에 GitHub 레포(`migkjy/group-buy-automation`)가 연결되어 있으며, `main` 브랜치 push 시 자동 배포됩니다.

- Vercel CLI 직접 배포는 사용하지 않습니다
- 환경변수는 Vercel 대시보드에서 설정합니다

## 라이선스

Private 프로젝트
