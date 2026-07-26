# Submission Text — Private Membership Verification

## Copy/paste for mentors

```text
Project: Private Membership Verification

GitHub Repository:
https://github.com/saikat-tanti/private-membership-verification

Live Demo (Vercel):
https://private-membership-verification.vercel.app/
(confirmed live)

Demo Video (YouTube):
<paste after upload>

Description:
Private Membership Verification is a Midnight dApp where a user proves they know a private membership/allowlist secret without revealing that secret or their identity. The public ledger exposes only the group name and the total verified-member count.

Privacy Model:
Public state includes groupName and verifiedMemberCount. The membershipSecret is a private Opaque circuit input to verifyMembership and is never disclosed. Observers can see that a verification happened and the aggregate count, but cannot learn the secret or who verified.

Level Coverage:
- Level 1: Compact 0.31.1 contract, compile, managed artifacts, local undeployed deploy, CLI.
- Level 2: Next.js App Router frontend with Lace connect/disconnect, env contract address, private secret form, verifyMembership, public state panel.
- Level 3: Automated tests, GitHub Actions CI (compile + test + frontend build), Privacy Model, Product Proposal (Private Allowlist Access), Submission Checklist.

Local undeployed contract:
1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
Group: VIP Founders Club

Preprod Status:
Preprod deployment was attempted, but wallet sync currently hangs/fails before deployment completes. Per Mentor Lead guidance: “If you're unable to deploy, just build the full-stack dApp and submit it. Skip the deployment part for now.” This project is submitted with local deployment, frontend, tests, CI, and documented deployment status. Preprod address will be added once sync succeeds.
```

## YouTube — title
```text
Private Membership Verification | Midnight ZK Allowlist dApp (Lace Wallet Demo)
```

## YouTube — description
```text
Private Membership Verification is a privacy-preserving allowlist dApp on the Midnight Network.

Prove you know a private membership secret with a zero-knowledge circuit — without revealing the secret or your identity. The public ledger only shows the group name and verified member count.

🔗 GitHub: https://github.com/saikat-tanti/private-membership-verification
🌐 Live demo: https://private-membership-verification.vercel.app/
📄 Compact contract: verifyMembership (membershipSecret stays private)

In this video:
0:00 — Landing page
0:20 — Lace wallet connect (auto-connect on localhost)
0:40 — Dashboard (network, group, verified count)
1:00 — Membership proof UI + public ledger
1:30 — Sponsors, Logs, Settings (contract address)
2:00 — Privacy model (what stays private vs public)

Stack: Compact 0.31.1 · Next.js 16 · Lace · Midnight Network
Category: Private Allowlist Access

#MidnightNetwork #ZeroKnowledge #LaceWallet #Web3 #Privacy #Compact #Allowlist
```

## Screenshot checklist
- [x] Landing / Dashboard / Membership / Sponsors / Logs / Settings (`membership-ui/public/*.png`)
- [ ] `npm run compile` showing `verifyMembership`
- [ ] Local deploy success + contract address
- [ ] CLI or `npm run demo:verify` / public state read
- [ ] GitHub repo page
- [ ] GitHub Actions CI green
- [ ] Vercel live URL in README
- [ ] YouTube URL in README
- [ ] Optional: Preprod sync timeout log (`preprod-attempt.log`)

## Do not commit
`.midnight-state.json`, `.env.local`, wallet seeds, `node_modules/`, `membership-ui/.next/`, `contract/src/managed/`
