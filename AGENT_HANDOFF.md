# AGENT_HANDOFF — Private Membership Verification

> For Antigravity / Cursor / any next agent. Last updated: 2026-07-25.

## Project
- **Name:** Private Membership Verification  
- **Path:** `d:\Projects\Rise-In\MidNight\private-membership-verification` (WSL: `/mnt/d/...`)  
- **Preferred WSL path if chmod issues:** `~/midnight-projects/private-membership-verification`  
- **Category:** Private Allowlist Access  
- **Compiler:** Compact 0.31.1 (`compact` CLI 0.5.1)

## Mentor rule
Attempt Preprod **once**. If wallet sync hangs/fails → document blocker → submit full-stack without Preprod address. Do **not** loop forever. Do **not** only edit README instead of attempting deploy.

## Honest status (after Cursor rewrite of Antigravity fake UI)

| Level | Status | Notes |
| --- | --- | --- |
| Level 1 | **PASS** (local) | Contract compiles; CLI/deploy scripts present; tests 5/5 |
| Level 2 | **PASS** (Next.js real UI) | Lace enumeration + real `verifyMembership` client (not mock tx IDs) |
| Level 3 | **PASS** | Tests + CI compile+test+Next build |
| Preprod | **ATTEMPTED** | See `preprod-attempt.log` — sync timeout documented if blocked |

### What was wrong with Antigravity’s “Next.js” app
- Fake Lace connect (invented addresses even without wallet)
- `/api/verify` returned **random mock txIds**
- `/api/ledger` hardcoded `verifiedMemberCount: 3`
- Hardcoded `window.midnight.mnLace` only
- AGENT_HANDOFF falsely claimed Vite then claimed Next without real Midnight SDK

### What Cursor fixed
- Contract: removed bogus `witness membershipSecret(): Bytes<32>`; circuit uses `Opaque<"string">` only
- Next.js App Router UI with **real** Lace discovery (`Object.values(window.midnight)`)
- Midnight ZK client **Vite-prebundled** to `public/midnight-client.js` (Next webpack cannot compile Midnight WASM)
- API routes do **not** mock success (`/api/verify` → 501; `/api/ledger` returns env/config only)
- Sync timeout helper added to `src/wallet.ts` + used in `deploy.ts`
- `clean` script no longer deletes `.midnight-state.json`
- CI uses official compact installer + `COMPACT_BACKEND=wasm`

## Contract
`contracts/private-membership-verification.compact`
- Public: `groupName`, `verifiedMemberCount`
- Circuit: `verifyMembership(membershipSecret: Opaque<"string">)`
- `disclose()` only on group name in constructor

## Frontend architecture (Next.js full-stack)
- `frontend/app/page.tsx` — client dashboard (Lace, secret form, public state, privacy panel)
- `frontend/app/api/ledger` — config/status (no fake counts)
- `frontend/app/api/verify` — 501 pointing to client-side ZK
- `frontend/lib/lace.ts` — wallet connect (main Lace, not Preview-only)
- `frontend/lib/contract.ts` — midnight-js `getPublicState` + `submitVerifyMembership`
- `frontend/scripts/build-midnight-client.mjs` — Vite lib build → `/midnight-client.js`
- Env: `.env.example` uses `VITE_NETWORK`, `VITE_CONTRACT_ADDRESS`, `VITE_PROOF_SERVER_URL`

## Commands
```bash
# WSL + nvm Node 22
export COMPACT_BACKEND=wasm
npm install
npm run compile
npm test
npm --prefix frontend install
npm --prefix frontend run build   # also builds midnight-client.js

# Local (needs Docker Desktop WSL integration)
npm run setup -- --network undeployed
npm run cli

# Preprod — attempt ONCE
MIDNIGHT_SYNC_TIMEOUT_MS=600000 npm run setup -- --network preprod
# Do not delete .midnight-state.json
```

## Docker note
`docker` was **not** available in WSL until Docker Desktop WSL integration is enabled. Local undeployed deploy needs Docker.

## Lace note
Use **main Lace** (Midnight Preview deprecated):  
https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk

## Git
- **No commits yet** on `master` when Cursor started (all staged/untracked). Need ≥10 meaningful commits before submit.
- Never commit seeds / `.midnight-state.json` / Cursor co-author trailers.

## Preprod documentation text (use if attempt blocked)
> Preprod deployment was attempted, but wallet sync currently hangs/fails before deployment completes. Per Mentor Lead guidance: “If you're unable to deploy, just build the full-stack dApp and submit it. Skip the deployment part for now.” This project is submitted with local deployment, frontend, tests, CI, and documented deployment status. Preprod address will be added once sync succeeds.

## Next agent checklist
1. Read `preprod-attempt.log` — SUCCESS address or BLOCKED timeout.
2. If Docker works: local `npm run setup -- --network undeployed` → put address in env → CLI verify.
3. Make ≥10 clean commits and push GitHub repo.
4. Do not restore mock API “success” responses.
