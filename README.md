# Private Membership Verification
> A privacy-preserving zero-knowledge allowlist membership dApp on the Midnight Network — prove you belong without revealing your secret or identity.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel)](https://private-membership-verification.vercel.app/)
[![Demo Video](https://img.shields.io/badge/YouTube-Demo_Video-FF0000?style=flat-square&logo=youtube)](https://youtu.be/REPLACE_WITH_YOUR_VIDEO_ID)
[![CI/CD Pipeline](https://github.com/saikat-tanti/private-membership-verification/actions/workflows/ci.yml/badge.svg)](https://github.com/saikat-tanti/private-membership-verification/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Local_Undeployed-0f6b63?style=flat-square)](https://midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-0.31.1-06b6d4?style=flat-square)](https://docs.midnight.network)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22+-10b981?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Live Demo, Video & Repository
- **Live Web Application**: [https://private-membership-verification.vercel.app/](https://private-membership-verification.vercel.app/)
- **YouTube Demo Video**: [https://youtu.be/REPLACE_WITH_YOUR_VIDEO_ID](https://youtu.be/REPLACE_WITH_YOUR_VIDEO_ID) *(paste your upload URL before mentor submit)*
- **GitHub Repository**: [https://github.com/saikat-tanti/private-membership-verification](https://github.com/saikat-tanti/private-membership-verification)
- **CI/CD Workflow**: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — installs Compact **0.31.1**, runs `npm run compile`, `npm test`, and builds the Next.js frontend

---

## Challenge Requirements & Passing Checklist
- [x] **Fully Functional Privacy dApp**: Midnight ZK allowlist — private `membershipSecret`, public `groupName` + `verifiedMemberCount`
- [x] **Live Demo Deployment**: [https://private-membership-verification.vercel.app/](https://private-membership-verification.vercel.app/)
- [x] **Demo Video (Lace Wallet + Membership UI)**: Lace connect + Membership / Dashboard / Settings walkthrough *(add YouTube link above)*
- [x] **Passing Test Suite**: 15 Node test cases (`npm test`)
- [x] **CI/CD Pipeline Running**: GitHub Actions — **Compact compile** + tests + Next.js build
- [x] **Public GitHub Repository**: [saikat-tanti/private-membership-verification](https://github.com/saikat-tanti/private-membership-verification)
- [x] **Deployed Smart Contract (local undeployed)**: `1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b`
- [x] **Browser Wallet Integration**: Lace via `window.midnight` enumeration (`connect` / legacy `enable`)
- [x] **Lace Wallet Connect / Disconnect Lifecycle**: Auto-connect on localhost + Settings session controls
- [x] **Meaningful commit history** on `main` (well above Level 3 minimum)
- [x] **Preprod status documented**: Wallet sync blocked; mentor guidance followed (full-stack first)

---

## Product Idea / Proposal — Private Allowlist Access

**Official Level 3 category:** Private Allowlist Access

Exclusive DAOs, gated communities, and private cohorts need members to prove entitlement. Traditional flows force users to expose wallet identity or allowlist secrets on-chain.

**Private Membership Verification** lets a member prove knowledge of a private membership secret. The Midnight ledger only learns the **group name** and the **aggregate verified-member count**.

| Audience | Value |
| --- | --- |
| DAO / allowlist operators | Public growth signal without doxxing members |
| Members | Prove belonging without revealing the secret or identity |
| Sponsors | Track sponsored seats off-chain while proofs stay private |

---

## Privacy Model — What Observers Can / Cannot Learn

### What an observer CANNOT learn
1. **Membership secret / allowlist code** — private `Opaque<"string">` circuit input to `verifyMembership`; `disclose()` is never called on it
2. **Member identity / who verified** — not written to the public ledger
3. **Wallet ↔ secret linkage** — observers see that a valid verification occurred, not the witness

### What an observer CAN learn
1. **Group name** (`groupName`) — disclosed in the constructor via `disclose()`
2. **Verified member count** (`verifiedMemberCount`) — increments on successful `verifyMembership`
3. **That a valid ZK verification occurred**

---

## Contract & Deployment Details

| Environment | Location / Address | Notes |
| --- | --- | --- |
| **Live Web App** | [private-membership-verification.vercel.app](https://private-membership-verification.vercel.app/) | Next.js 16 SaaS UI |
| **Demo Video** | YouTube *(replace badge link)* | Lace + Membership UI |
| **Local undeployed contract** | `1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b` | Group: **VIP Founders Club** |
| **CI/CD** | [GitHub Actions](https://github.com/saikat-tanti/private-membership-verification/actions) | Compact compile + tests + Next build |
| **Preprod** | **BLOCKED / WAIVED** | Mentor guidance — see below |

### Preprod status (mentor guidance)
> If you're unable to deploy, just build the full-stack dApp and submit it. Skip the deployment part for now.

Preprod deploy was attempted; wallet sync hit `Wallet.Sync` errors / timeout before deployment could complete. **No Preprod contract address is claimed.** This submission includes local undeployed deploy, full-stack frontend (live on Vercel), tests, and CI. Preprod address can be added later when sync succeeds.

### Switching to Preprod later
When you have a Preprod contract address and funded Lace wallet:

1. Set in `frontend/.env.local` (or Vercel env):
   ```env
   VITE_NETWORK=preprod
   VITE_CONTRACT_ADDRESS=<preprod-contract-address>
   VITE_PROOF_SERVER_URL=https://proof-server.preprod.midnight.network
   ```
2. Or paste the address in **Settings** and connect Lace on Preprod.
3. Redeploy / restart the frontend.

---

## App Routes

| Route | Purpose |
| --- | --- |
| `/` | Brand landing |
| `/dashboard` | Network, wallet, group, verified count |
| `/membership` | Private secret → `verifyMembership` + public ledger |
| `/sponsors` | Sponsor seat roster for the allowlist |
| `/logs` | Local activity (wallet / verify / sponsors) |
| `/settings` | Contract address, Lace, env |

---

## Lace Wallet Connector

```typescript
// Enumerate window.midnight (UUID keys). Prefer Lace; support connect(network) + enable().
const wallets = Object.values(window.midnight ?? {}).filter(looksLikeWallet);
const lace = wallets.find((w) => `${w.name ?? ''} ${w.rdns ?? ''}`.toLowerCase().includes('lace'));
const connected = await (lace ?? wallets[0]).connect('undeployed'); // or enable() on legacy API
```

On localhost the app **auto-connects** Lace when present. Disconnecting disables auto-connect until you connect again (Settings).

---

## Quickstart & Local Installation

### Requirements
- **Node.js 22+**
- **Midnight Compact** compiler toolchain **0.5.x** selecting compiler **0.31.1** (`COMPACT_BACKEND=wasm` recommended)
- **Docker** (local proof server / undeployed stack)
- Prefer **Ubuntu WSL** for Compact — on Windows, `compact` in PATH may resolve to the OS file-compression utility, not Midnight Compact. Use WSL: `~/.local/bin/compact`

```bash
git clone https://github.com/saikat-tanti/private-membership-verification.git
cd private-membership-verification
npm install
npm run frontend:install

# Compile Compact contract (WSL / Linux with Midnight Compact on PATH)
export COMPACT_BACKEND=wasm
npm run compile
# Or: compact compile contracts/private-membership-verification.compact \
#        contracts/managed/private-membership-verification

# Local stack + deploy (Docker required)
npm run setup -- --network undeployed

# Frontend
cp frontend/.env.example frontend/.env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or the live demo: [https://private-membership-verification.vercel.app/](https://private-membership-verification.vercel.app/).

### Frontend env (`frontend/.env.local`)
```env
VITE_NETWORK=undeployed
VITE_CONTRACT_ADDRESS=1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
VITE_PROOF_SERVER_URL=http://localhost:6300
VITE_INDEXER_URI=http://127.0.0.1:8088/api/v4/graphql
VITE_INDEXER_WS_URI=ws://127.0.0.1:8088/api/v4/graphql/ws
```

Or paste the address in **Settings → Use local deploy** (no restart).

### Useful scripts
| Command | Purpose |
| --- | --- |
| `npm run compile` | Compile Compact contract → `contracts/managed/` |
| `npm test` | Contract / privacy / network tests |
| `npm run setup -- --network undeployed` | Docker stack + deploy |
| `npm run cli` / `npm run demo:verify` | Membership proof helpers |
| `npm run dev` | Next.js app (port 3000) |
| `npm run build` | Production build (root typecheck + frontend) |

---

## Automated Test Suite

```bash
npm test
```

Expected (summary):
```text
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

---

## Level 1 / 2 / 3 Submission Checklist

### Level 1 — New Moon
- [x] Compact toolchain documented (0.31.1 / WSL note)
- [x] Custom Compact contract (not hello-world): `contracts/private-membership-verification.compact`
- [x] Public ledger: `groupName`, `verifiedMemberCount`
- [x] Private circuit input: `membershipSecret` (`Opaque<"string">`)
- [x] `disclose()` only for `groupName` in constructor
- [x] Compiles with Compact **0.31.1** → `contracts/managed/private-membership-verification/`
- [x] Local undeployed deploy address documented
- [x] README setup + product idea + privacy explanation
- [x] Preprod blocked/waived per mentor guidance
- [x] ≥5 meaningful commits

### Level 2 — Waxing Crescent
- [x] Next.js 16 frontend builds and is live on Vercel
- [x] Lace connect / disconnect + status visible
- [x] Network + contract address via env / Settings
- [x] UI wired to `verifyMembership` (browser Midnight client)
- [x] Loading / success / error states on Membership
- [x] Public state panel (`groupName`, `verifiedMemberCount`)
- [x] README privacy claim + local frontend run instructions
- [x] README explains Preprod switch when address is available
- [x] ≥8 meaningful commits

### Level 3 — First Quarter
- [x] Official category: **Private Allowlist Access**
- [x] ≥3 meaningful tests (15 passing)
- [x] CI runs **contract compile** + tests + frontend build
- [x] Privacy Model + Product Proposal + Level checklists in README
- [x] Polished multi-page demo UI
- [x] ≥10 meaningful commits
- [x] No committed secrets / wallet seeds / `.midnight-state.json`

---

## Deploy (already live)

Live: **[https://private-membership-verification.vercel.app/](https://private-membership-verification.vercel.app/)**

Root Directory on Vercel: `frontend`. Env: `VITE_NETWORK`, `VITE_CONTRACT_ADDRESS`, optional indexer/proof URLs. See `VERCEL.md`.

> Lace ZK submit against **local undeployed** needs your Docker stack. The Vercel UI demonstrates landing, dashboard, Lace connect, membership form, sponsors, logs, and settings.

---

## Platform Screenshots

### Landing
![Private Membership landing](frontend/public/landing.png)

### Dashboard
![Dashboard](frontend/public/dashboard.png)

### Membership verification
![Membership](frontend/public/membership.png)

### Sponsors
![Sponsors](frontend/public/sponsor.png)

### Activity logs
![Logs](frontend/public/log.png)

### Settings (contract + Lace)
![Settings](frontend/public/settings.png)

---

## License
MIT — see [LICENSE](LICENSE). Built for the Midnight Network community.
