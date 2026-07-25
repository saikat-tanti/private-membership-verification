'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/lib/wallet-context';
import { loadConfig, networkLabel } from '@/lib/config';
import { shortAddr } from '@/lib/utils';
import { clearActivity, pushActivity } from '@/lib/activity';
import { LACE_STORE_URL } from '@/lib/lace';

const LOCAL_DEPLOYED =
  '1786cf52d30966919b2c4d052e874160a355f428f9e6941dd26057615e93c19b';

export default function SettingsPage() {
  const {
    config,
    wallet,
    connecting,
    laceInstalled,
    connect,
    disconnect,
    walletError,
    refreshPublicState,
    setContractAddress,
    clearContractAddressOverride,
  } = useWallet();

  const [addressDraft, setAddressDraft] = useState(config.contractAddress ?? '');

  useEffect(() => {
    setAddressDraft(config.contractAddress ?? '');
  }, [config.contractAddress]);

  const onSaveContract = (e: FormEvent) => {
    e.preventDefault();
    setContractAddress(addressDraft);
    void refreshPublicState();
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Network, contract, and wallet configuration for this Private Membership workspace."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="font-display text-xl">Contract address</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Paste the deployed contract address from local setup (or Preprod when available). Saved
            in this browser and applied immediately — no restart required.
          </p>
          <form onSubmit={onSaveContract} className="mt-5 space-y-3">
            <div>
              <label htmlFor="contract" className="mb-1 block text-sm text-[var(--ink-muted)]">
                Deployed contract address
              </label>
              <Input
                id="contract"
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                placeholder="64-char hex contract address"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="accent">
                Save address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddressDraft(LOCAL_DEPLOYED);
                  setContractAddress(LOCAL_DEPLOYED);
                  void refreshPublicState();
                }}
              >
                Use local deploy
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearContractAddressOverride();
                  setAddressDraft(loadConfig().contractAddress ?? '');
                }}
              >
                Reset override
              </Button>
            </div>
          </form>
          <p className="mt-4 break-all font-mono text-xs text-[var(--ink-faint)]">
            Active: {config.contractAddress ?? 'not set'}
          </p>
        </Surface>

        <Surface>
          <h2 className="font-display text-xl">Environment</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Network</dt>
              <dd className="text-right font-medium">{networkLabel(config.network)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Indexer</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs">
                {config.indexerUri ?? wallet?.uris.indexerUri ?? '—'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Proof server</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs">
                {config.proverUri ?? '—'}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-[var(--ink-muted)]">
            Defaults come from <code className="font-mono">frontend/.env.local</code>. Contract
            address can also be overridden above.
          </p>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Lace wallet</h2>
            <Badge tone={wallet ? 'ok' : laceInstalled ? 'warn' : 'danger'}>
              {wallet ? 'Connected' : laceInstalled ? 'Detected' : 'Missing'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            On localhost, Lace auto-connects when the extension is available. Disconnecting disables
            auto-connect until you connect again.
          </p>
          {wallet ? (
            <div className="mt-5 space-y-3">
              <p className="break-all font-mono text-xs">{shortAddr(wallet.state.address, 18, 10)}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={disconnect}>
                  Disconnect
                </Button>
                <Button variant="ghost" onClick={() => void refreshPublicState()}>
                  Refresh ledger
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {laceInstalled ? (
                <Button variant="accent" onClick={() => void connect()} disabled={connecting}>
                  {connecting ? 'Connecting…' : 'Connect Lace'}
                </Button>
              ) : (
                <a
                  href={LACE_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
                >
                  Install Lace
                </a>
              )}
            </div>
          )}
          {walletError ? <p className="mt-3 text-sm text-[var(--danger)]">{walletError}</p> : null}
        </Surface>

        <Surface>
          <h2 className="font-display text-xl">Workspace data</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Activity logs and sponsor roster are stored in this browser only.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              clearActivity();
              pushActivity('settings_update', 'Activity log cleared from settings');
            }}
          >
            Clear activity log
          </Button>
        </Surface>
      </div>
    </div>
  );
}
