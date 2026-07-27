# Vercel deploy checklist — Private Membership Verification

## One-time project setup
1. https://vercel.com/new → Import `saikat-tanti/private-membership-verification`
2. **Root Directory**: `membership-ui` (critical — set in Vercel Settings -> General -> Root Directory)
3. Framework: Next.js
4. Env vars (Production + Preview):

```
VITE_NETWORK=undeployed
VITE_CONTRACT_ADDRESS=1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
VITE_PROOF_SERVER_URL=http://localhost:6300
NODE_OPTIONS=--max-old-space-size=4096
```

5. Ensure `contract/src/managed/private-membership-verification/` is **committed** (required by `prebuild` → midnight-client bundle).
6. Deploy → paste the URL into `README.md` badges.

## Why the previous build failed
`[copy-contract-assets] managed contract missing` means Vercel didn’t have compiled Compact output. That folder was gitignored; it must be in the repo for frontend deploys.

## CLI
```bash
cd membership-ui
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```

## After deploy
- [ ] Open live URL — landing loads
- [ ] Lace connect works in browser with extension
- [ ] Settings shows contract address
- [ ] Update README Live Demo + YouTube links
- [ ] Record demo video (title/description in chat / SUBMISSION.md)
