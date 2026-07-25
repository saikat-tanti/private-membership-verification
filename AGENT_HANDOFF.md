# AGENT_HANDOFF — Private Membership Verification

> Updated after submission packaging. Prefer **large batches**, not frequent tiny commits.

## Status
| Level | Status |
| --- | --- |
| Level 1 | PASS (local undeployed) |
| Level 2 | PASS (Next.js 16 SaaS UI + Lace auto-connect + verifyMembership) |
| Level 3 | PASS (tests + CI + docs) |
| Preprod | BLOCKED (wallet sync timeout) — documented |

## Local contract
`1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b` — VIP Founders Club

## Commands
```bash
export COMPACT_BACKEND=wasm
npm run compile && npm test
npm run setup -- --network undeployed
npm run demo:verify
npm run test:e2e
npm run dev   # http://localhost:3000 — landing; /dashboard /membership /sponsors /logs /settings
```

## Frontend notes
- Next.js **16.2** + React 19 + Tailwind 4 + shadcn-style UI primitives.
- Lace auto-connects on load unless user previously disconnected (`pmv:lace-autoconnect=0`).
- ZK tx may fail without live proof stack; wallet connect + ledger read are required.

## Mentor paste
See `SUBMISSION.md`.

## Agent workflow with this user
- Do **not** ask for a commit after every small tweak.
- Accumulate a real feature/docs batch, then give **one** commit message.
- Do not keep running deploy loops unless asked.
- User pushes via VS Code PAT extension (`git add .`).
