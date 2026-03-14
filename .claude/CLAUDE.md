# Group Buy Automation — PL 세션 규칙

## 프로젝트 개요
공구판매(공동구매) 자동화 플랫폼 MVP. 딜 관리, 주문 수집, 대시보드, 자동화 파이프라인.

## 기술 스택
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Recharts 3 (차트), Vitest + Testing Library (테스트)
- JSON 파일 기반 데이터 (MVP) — `data/` 디렉토리
- 배포: Vercel (GitHub 연동, main push 자동 배포)

## 개발 규칙
- **TDD 강제**: 테스트 먼저 → 구현 → 통과
- **ralph-loop 강제**: /ralph-loop 스킬 사용
- 한국어 UI, 영어 conventional commits
- `npm run build` 성공 확인 후 커밋
- main 브랜치 직접 push (staging/production 브랜치 없음)
- Vercel CLI 배포 금지 — Git push로만 배포

## 테스트/린트
```bash
npm test          # vitest run
npm run lint      # eslint
npm run build     # next build
```

## 환경변수
- 모든 API 키 선택사항 — 미설정 시 mock 모드 동작
- `.env.example` 참조 (Naver, Claude, Buffer, Kakao, SweetTracker)
- 실제 키는 `.claude/knowledge/api-keys.md` 참조 (gitignored)

## 자동화 파이프라인
`scripts/` 디렉토리: trend-discovery, social-post, kakao-notification, auto-order, delivery-tracker, pipeline (오케스트레이터)
```bash
npx tsx scripts/pipeline.ts              # 전체 실행
npx tsx scripts/pipeline.ts --step=trend # 단계별 실행
```

## 자비스 세션 소통
```bash
scripts/project-reply.sh "메시지" "group-buy-automation"
```

## 참조
- `knowledge/architecture.md` — 아키텍처 상세
- `knowledge/constraints.md` — 제약사항/금지사항
- `knowledge/api-keys.md` — API 키 (gitignored)
- `knowledge/history.md` — 작업 이력
- `knowledge/learnings.md` — 교훈/팁
