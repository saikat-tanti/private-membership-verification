# Private Membership Verification — Preview status

## Target network

**Preview** via **1AM** (Rise-In July migration — Preprod down).

```powershell
Copy-Item membership-ui/.env.preview membership-ui/.env.local -Force
npm run dev
```

Open **http://localhost:3000/**.

## Contract address

**`67dc390b3d1a7771f1235e6338d09a8f452a7099ae5d6ef1ae701250da74af78`**

- Network: Preview  
- Deployed via **1AM** (Settings → Deploy on Preview)  
- Indexer: verified `ContractDeploy`  
- Constructor group: `VIP Founders Club`  
- Explorer: https://preview.midnightexplorer.com/contracts/0x67dc390b3d1a7771f1235e6338d09a8f452a7099ae5d6ef1ae701250da74af78

## Quick verify

1. Unlock **1AM** → **Preview** → synced  
2. Connect → Membership → verify with any secret  
3. Public `verifiedMemberCount` increments  

## Vercel production env

```
VITE_NETWORK=preview
VITE_NETWORK_ID=preview
VITE_CONTRACT_ADDRESS=67dc390b3d1a7771f1235e6338d09a8f452a7099ae5d6ef1ae701250da74af78
VITE_INDEXER_URI=https://indexer.preview.midnight.network/api/v4/graphql
VITE_INDEXER_WS_URI=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PROOF_SERVER_URL=https://proof-server.preview.midnight.network
```

(Use a same-origin `/proof-server` rewrite on Vercel if the browser hits CORS.)

Faucet: https://faucet.preview.midnight.network/
