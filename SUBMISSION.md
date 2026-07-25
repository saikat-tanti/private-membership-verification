# Submission Text — Private Membership Verification

## Copy/paste for mentors

```text
Project: Private Membership Verification

GitHub Repository:
<paste your repo URL>

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

## Screenshot checklist
- [ ] `npm run compile` showing `verifyMembership`
- [ ] Local deploy success + contract address
- [ ] CLI or `npm run demo:verify` / public state read
- [ ] Frontend UI at http://localhost:3000
- [ ] GitHub repo page
- [ ] GitHub Actions CI green
- [ ] Optional: Preprod sync timeout log (`preprod-attempt.log`)

## Do not commit
`.midnight-state.json`, `.env.local`, wallet seeds, `node_modules/`, `frontend/.next/`, `contracts/managed/`
