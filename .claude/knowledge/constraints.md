# Constraints — Group Buy Automation

## 필수 준수 규칙
1. **TDD 강제** — 테스트 먼저 작성, 구현, 통과 순서
2. **ralph-loop 강제** — /ralph-loop 스킬 사용
3. **빌드 확인 후 커밋** — `npm run build` 성공 필수
4. **Vercel CLI 배포 금지** — Git push로만 배포
5. **conventional commits** — 영어, feat/fix/chore/docs 접두사
6. **한국어 UI** — 사용자 대면 텍스트 전부 한국어

## 금지 사항
- `vercel deploy` / `vercel --prod` 사용 금지
- 새 Vercel 프로젝트 생성 금지
- DROP/TRUNCATE/파괴적 명령 금지
- `.env` 파일 커밋 금지
- 10개 초과 샘플/더미 데이터 생성 금지

## MVP 제약
- DB 없음 — JSON 파일 기반 (data/ 디렉토리)
- 인증/로그인 없음
- 모든 API 키 선택사항 (미설정 시 mock 동작)

## 브랜치 전략
- main 브랜치 단일 사용
- staging/production 브랜치 없음

## PL 소통
- 완료 보고: `scripts/project-reply.sh "메시지" "group-buy-automation"`
- 보고에 프로젝트명 접두사 필수: `[group-buy-automation] ...`
