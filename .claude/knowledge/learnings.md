# Learnings — Group Buy Automation

## 기술적 교훈
- Next.js 16 + React 19 사용 중 — 최신 API 사용 가능
- JSON 파일 기반 데이터는 동시 쓰기 시 충돌 가능 — MVP 한계
- Recharts 3은 클라이언트 컴포넌트에서만 동작 ("use client" 필수)

## 개발 팁
- 환경변수 미설정 시 mock 모드 동작하므로 로컬 개발에 API 키 불필요
- `data/` 디렉토리는 .gitignore됨 — 런타임 생성 데이터 저장소
- 파이프라인 스크립트는 `npx tsx`로 실행 (ts-node 아님)
