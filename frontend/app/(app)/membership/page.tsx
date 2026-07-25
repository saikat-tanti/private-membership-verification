'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/lib/wallet-context';
import { pushActivity } from '@/lib/activity';
import type { ConnectedWallet } from '@/lib/lace';
import type { AppConfig } from '@/lib/config';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; txId: string; blockHeight: number }
  | { kind: 'error'; message: string };

async function contractApi(): Promise<{
  submitVerifyMembership: (
    config: AppConfig,
    wallet: ConnectedWallet,
    secret: string,
  ) => Promise<{ txId: string; blockHeight: number }>;
}> {
  const loader = new Function('return import("/midnight-client.js")') as () => Promise<{
    submitVerifyMembership: (
      config: AppConfig,
      wallet: ConnectedWallet,
      secret: string,
    ) => Promise<{ txId: string; blockHeight: number }>;
  }>;
  return loader();
}

export default function MembershipPage() {
  const { config, wallet, connect, connecting, publicState, refreshPublicState } = useWallet();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setStatus({ kind: 'submitting' });
    pushActivity('verify_attempt', 'Membership verification submitted');
    try {
      const { submitVerifyMembership } = await contractApi();
      const { txId, blockHeight } = await submitVerifyMembership(config, wallet, secret);
      setStatus({ kind: 'success', txId, blockHeight });
      setSecret('');
      pushActivity('verify_success', 'Membership verified on-chain', `tx ${txId}`);
      void refreshPublicState();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      pushActivity('verify_error', 'Verification failed', message);
    }
  };

  const disabled = wallet === null || !config.contractAddress || status.kind === 'submitting';

  return (
    <div>
      <PageHeader
        title="Membership"
        description="Prove you belong to the private allowlist. Your secret never leaves the ZK circuit as a public value."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl">Verify membership</h2>
            <Badge tone={wallet ? 'ok' : 'warn'}>{wallet ? 'Wallet ready' : 'Wallet required'}</Badge>
          </div>

          {!wallet ? (
            <div className="mb-5 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-2)]/60 p-4 text-sm text-[var(--ink-muted)]">
              Connect Lace to sign and prove the membership circuit.
              <div className="mt-3">
                <Button variant="accent" size="sm" onClick={() => void connect()} disabled={connecting}>
                  {connecting ? 'Connecting…' : 'Connect Lace'}
                </Button>
              </div>
            </div>
          ) : null}

          <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
            <div>
              <label htmlFor="secret" className="mb-1.5 block text-sm text-[var(--ink-muted)]">
                Private membership secret
              </label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="allowlist-code-…"
                  autoComplete="off"
                  disabled={status.kind === 'submitting'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSecret((v) => !v)}
                  aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" variant="accent" disabled={disabled || !secret.trim()}>
              {status.kind === 'submitting' ? 'Proving…' : 'Verify membership'}
            </Button>
          </form>

          {!config.contractAddress ? (
            <p className="mt-4 text-sm text-[var(--warn)]">
              Set VITE_CONTRACT_ADDRESS, then restart the app.
            </p>
          ) : null}
          {status.kind === 'success' ? (
            <p className="mt-4 text-sm text-[var(--ok)]">
              Verified. tx {status.txId.slice(0, 16)}… · block {status.blockHeight}
            </p>
          ) : null}
          {status.kind === 'error' ? (
            <p className="mt-4 text-sm text-[var(--danger)]">{status.message}</p>
          ) : null}
        </Surface>

        <Surface>
          <h2 className="font-display text-xl">Public ledger</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-[var(--ink-faint)]">Group name</dt>
              <dd className="mt-1 text-base font-medium">{publicState?.groupName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-faint)]">Verified member count</dt>
              <dd className="mt-1 text-base font-medium">
                {publicState ? publicState.verifiedMemberCount.toString() : '—'}
              </dd>
            </div>
          </dl>
          <div className="mt-8 border-t border-[var(--line)] pt-4 text-sm text-[var(--ink-muted)]">
            <p className="font-medium text-[var(--ink)]">Stays private</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Membership secret / allowlist code</li>
              <li>Member identity</li>
            </ul>
          </div>
        </Surface>
      </div>
    </div>
  );
}
