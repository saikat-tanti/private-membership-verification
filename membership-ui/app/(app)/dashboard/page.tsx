'use client';

import Link from 'next/link';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet-context';
import { networkLabel } from '@/lib/config';
import { shortAddr } from '@/lib/utils';

export default function DashboardPage() {
  const {
    config,
    wallet,
    connecting,
    publicState,
    stateLoading,
    stateError,
    refreshPublicState,
    laceInstalled,
  } = useWallet();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational overview for private allowlist verification on Midnight."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshPublicState()}
            disabled={stateLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${stateLoading ? 'animate-spin' : ''}`} />
            Refresh ledger
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">Network</p>
          <p className="mt-2 font-display text-2xl">{networkLabel(config.network)}</p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">Wallet</p>
          <p className="mt-2 font-display text-2xl">
            {wallet ? 'Connected' : connecting ? 'Connecting' : 'Offline'}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--ink-muted)]">
            {wallet ? shortAddr(wallet.state.address, 14, 8) : laceInstalled ? 'Lace detected' : 'Lace not found'}
          </p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">Group</p>
          <p className="mt-2 font-display text-2xl truncate">
            {publicState?.groupName ?? '—'}
          </p>
        </Surface>
        <Surface>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            Verified members
          </p>
          <p className="mt-2 font-display text-2xl">
            {publicState ? publicState.verifiedMemberCount.toString() : '—'}
          </p>
        </Surface>
      </div>

      {stateError ? (
        <p className="mt-4 text-sm text-[var(--danger)]">{stateError}</p>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Surface>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Membership proofs</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Submit a private membership secret. Only the public verified count changes.
              </p>
            </div>
            <Badge tone="accent">ZK</Badge>
          </div>
          <Link
            href="/membership"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-deep)] hover:underline"
          >
            Open membership <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Surface>

        <Surface>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Sponsored seats</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Track organizations funding private allowlist capacity for your group.
              </p>
            </div>
            <Badge tone="neutral">Ops</Badge>
          </div>
          <Link
            href="/sponsors"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-deep)] hover:underline"
          >
            Manage sponsors <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Surface>
      </div>

      <Surface className="mt-4">
        <h2 className="font-display text-xl">Contract</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ink-faint)]">Address</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {config.contractAddress ?? 'Not configured'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ink-faint)]">Proof server</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {config.proverUri ?? 'Wallet / default'}
            </dd>
          </div>
        </dl>
      </Surface>
    </div>
  );
}
