# AGENT_HANDOFF — Private Membership Verification

> Last updated: 2026-07-25 (after local undeployed success + first GitHub commit)

## Project
- **Name:** Private Membership Verification  
- **Path:** `d:\Projects\Rise-In\MidNight\private-membership-verification`  
- **Category:** Private Allowlist Access  
- **Compiler:** Compact 0.31.1  

## Status

| Level | Status | Notes |
| --- | --- | --- |
| Level 1 | **PASS** | Contract + local undeployed deploy + CLI |
| Level 2 | **PASS** | Next.js App Router + real Lace + verifyMembership client |
| Level 3 | **PASS** (except commit count) | Tests + CI OK; need ≥10 commits via successive pushes |
| Preprod | **BLOCKED** | 10-min sync timeout / `Wallet.Sync` — see `preprod-attempt.log` |

## Local undeployed (SUCCESS)
```text
Group Name:       VIP Founders Club
Contract Address: 1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
```
Frontend: `frontend/.env.local` (gitignored) points at this address.  
Dev UI: `npm run dev` → http://localhost:3000  
One-shot proof: `npm run demo:verify`

## Mentor rule
Attempt Preprod once. If blocked, document and submit full-stack. Do not loop forever.

## Remaining for submission
1. Reach ≥10 meaningful commits (user commits with VS Code PAT extension after each Cursor change batch).
2. Push remote GitHub repo if not already.
3. Screenshots: compile, undeployed deploy, CLI/demo verify, frontend UI, CI green, Preprod blocker log.
4. Do not commit `.midnight-state.json`, `.env.local`, seeds, `node_modules`, `.next`.

## Key commands
```bash
export COMPACT_BACKEND=wasm
export PATH="$HOME/bin:$PATH"   # docker.exe wrapper if needed
npm run compile && npm test
npm run setup -- --network undeployed
npm run demo:verify
npm run dev
```
