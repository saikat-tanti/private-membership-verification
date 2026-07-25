# Vercel deploy checklist — Private Membership Verification

## One-time project setup
1. https://vercel.com/new → Import `saikat-tanti/private-membership-verification`
2. **Root Directory**: `frontend` (critical)
3. Framework: Next.js
4. Env vars (Production + Preview):

```
VITE_NETWORK=undeployed
VITE_CONTRACT_ADDRESS=1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b
VITE_PROOF_SERVER_URL=http://localhost:6300
```

5. Deploy → paste the URL into `README.md` badges (replace `private-membership-verification.vercel.app` if Vercel assigns a different slug).

## CLI
```bash
cd frontend
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
