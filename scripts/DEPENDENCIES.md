# Group Buy Pipeline - Required Dependencies

These packages are needed by the scripts in `scripts/`.
Ask the other PL managing `package.json` to install them.

## Runtime Dependencies
- `dotenv` - .env file loading
- `commander` - CLI argument parsing

## Dev Dependencies
- `tsx` - TypeScript execution (if not already installed)
- `typescript` - Type checking
- `@types/node` - Node.js type definitions

## Notes
- All HTTP calls use native `fetch` (Node 18+)
- Excel generation uses simple CSV (no extra deps)
- Scripts are designed to run with `npx tsx scripts/<name>.ts`
