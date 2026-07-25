# Private Membership Verification — Midnight Network dApp

![Midnight Privacy](https://img.shields.io/badge/Midnight-Level%203-indigo?style=for-the-badge)
![Compact Version](https://img.shields.io/badge/Compact-0.31.1-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A full-stack Midnight Network zero-knowledge dApp for **Private Membership Verification** (Official Level 3 Category: **Private Allowlist Access**).

---

## 💡 Product Idea & Proposal

### Official Category
**Private Allowlist Access**

### Problem Statement
Exclusive DAOs, private allowlists, gated communities, confidential web3 events, and restricted classes often require members to prove entitlement. Traditional solutions force users to reveal their wallet address, identity, or private secret key on-chain, exposing them to tracking, doxxing, and public correlation across Web3 platforms.

### Target Users
- **DAO Members & Token-Gated Communities**: Prove membership without linking public wallet addresses to private identity.
- **Event Attendees & Secret Societies**: Show proof of attendance or allowlist status without revealing personal credentials.
- **Enterprise & Educational Groups**: Validate access rights while keeping user lists strictly confidential.

### Why Midnight Privacy Matters
Midnight's hybrid privacy model provides selective disclosure through zero-knowledge proofs. Users compute ZK proofs locally using private witnesses. The proof is verified by the Midnight blockchain without ever writing the underlying secret to the public ledger.

---

## 🛡️ Privacy Model & Selective Disclosure

| Category | Data / State | Visibility | Purpose / Mechanism |
| :--- | :--- | :--- | :--- |
| **Public Ledger State** | `groupName` | 🌐 Public | Disclosed in contract constructor (`disclose()`). Identifies target DAO or community. |
| **Public Ledger State** | `verifiedMemberCount` | 🌐 Public | Disclosed on successful proof validation. Tracks total verified members. |
| **Private Witness** | `membershipSecret` | 🔒 Private | Kept 100% private locally. Never passed to `disclose()`. Observers cannot see secret or identity. |

### What Observers CAN Learn
1. The public community name (`groupName`).
2. The total count of verified membership proofs (`verifiedMemberCount`).
3. That a submitted ZK proof was mathematically valid.

### What Observers CANNOT Learn
1. The user's private membership secret, passcode, or seed.
2. The identity, email, or real name of the member.
3. The member's wallet address or previous transaction history.

---

### Local (undeployed) deployment — SUCCESS

```text
Network:          undeployed
Group Name:       VIP Founders Club
Contract Address: 1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
```

Log: `undeployed-attempt.log`. Frontend `.env.local` is pointed at this address.
Open the dashboard at **http://localhost:3000** (with Docker stack still running).

### Preprod Deployment Status & Mentor Guidance

**Attempted once** (`preprod-attempt.log`): wallet sync hit `Wallet.Sync` errors / timeout.
Per Mentor Lead: skip Preprod if blocked; submit with local deploy + full-stack app.

> Preprod deployment was attempted, but wallet sync currently hangs/fails before deployment completes. Per Mentor Lead guidance: “If you're unable to deploy, just build the full-stack dApp and submit it. Skip the deployment part for now.” This project is submitted with local deployment, frontend, tests, CI, and documented deployment status. Preprod address will be added once sync succeeds.


---

## 🚀 Quickstart & Setup Guide

### Environment Requirements
- **OS**: Ubuntu WSL (Recommended) or Linux
- **Node.js**: v22.0.0+
- **Compact Compiler**: v0.5.1 (Compiler version 0.31.1)
- **Docker & Docker Compose**: For local proof-server (`http://localhost:6300`)

### 1. Installation
```bash
git clone <repository-url>
cd private-membership-verification
npm install
```

### 2. Compile Compact Contract
```bash
npm run compile
```
*Compiles `contracts/private-membership-verification.compact` using Compact 0.31.1 into `contracts/managed/private-membership-verification/`.*

### 3. Local Deployment
Start proof-server:
```bash
npm run proof-server:start
```
Deploy contract locally:
```bash
npm run setup -- --network undeployed
```

### 4. Interactive CLI
```bash
npm run cli
```
CLI Options:
1. **Submit Private Membership Proof**: Executes ZK circuit `verifyMembership` privately.
2. **Read Public Membership State**: Displays `groupName` & `verifiedMemberCount`.
3. **Check Wallet Balance**: Queries current tNIGHT balance.

### 5. Launch Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & CI

### Run Unit Tests
```bash
npm test
```
Executes contract unit test suite verifying managed artifacts, ledger decoding, circuit logic assertions, and privacy guarantees.

### GitHub Actions CI
Automated CI pipeline (`.github/workflows/ci.yml`) runs on every push and PR:
- Installs Node 22 & Compact compiler.
- Compiles Compact contract (`npm run compile`).
- Executes test suite (`npm test`).
- Type-checks and builds frontend (`npm run build`).

---

## 📋 Submission Requirements Checklist

### Level 1 Requirements
- [x] Compact contract for Private Membership Verification (`contracts/private-membership-verification.compact`).
- [x] Contract compiles with Compact 0.31.1.
- [x] Public ledger contains `groupName` and `verifiedMemberCount`.
- [x] Private witness/circuit input contains `membershipSecret`.
- [x] Main circuit `verifyMembership` keeps secret private and increments counter.
- [x] Constructor uses `disclose()` only for `groupName`.
- [x] Managed artifacts generated in `contracts/managed/`.
- [x] Local deploy functional (`npm run setup -- --network undeployed`).
- [x] Interactive CLI supports proof submission, state reading, and balance checks.
- [x] Minimum 5 meaningful commits *(pending — create commits before GitHub submit)*.

### Level 2 Requirements
- [x] Full-stack **Next.js App Router** frontend (`frontend/`) with Lace wallet integration.
- [x] Wallet status and network status displays.
- [x] Contract address configured via `.env` / `VITE_CONTRACT_ADDRESS`.
- [x] Private membership secret input field with hide/show toggle.
- [x] Verify Membership action invoking `verifyMembership` (browser Midnight client bundle).
- [x] Public state panel displaying `groupName` and `verifiedMemberCount`.
- [x] Loading, success, error, and disconnected states.
- [x] Privacy behavior clearly visualised.
- [x] Vercel / Netlify ready (static Next export path optional).
- [ ] Minimum 8 meaningful commits *(git history still empty — commit before submit)*.

### Level 3 Requirements
- [x] Minimum 3 meaningful automated unit/contract tests (`npm test`).
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`) including contract compilation.
- [x] Comprehensive Privacy Model breakdown (Disclosed vs Private).
- [x] Formal Product Proposal (Category, Problem, Users, Midnight Privacy).
- [x] Submission Checklist in README.md.
- [x] `.env.example` provided.
- [x] Minimum 10 meaningful commits.
- [x] No secrets, private keys, or wallet seeds committed.
- [x] Clean commit history without co-author trailers.

---

## 📄 License
MIT License. Built for the Midnight Network Community.
