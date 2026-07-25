'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { loadConfig, networkLabel } from '../lib/config';
import { connectLace, waitForLace, type ConnectedWallet, LACE_STORE_URL } from '../lib/lace';

type PublicState = {
  groupName: string;
  verifiedMemberCount: bigint;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; txId: string; blockHeight: number }
  | { kind: 'error'; message: string };

async function contractApi(): Promise<{
  getPublicState: (
    config: ReturnType<typeof loadConfig>,
    indexer: string,
    indexerWs: string,
  ) => Promise<PublicState | null>;
  submitVerifyMembership: (
    config: ReturnType<typeof loadConfig>,
    wallet: ConnectedWallet,
    secret: string,
  ) => Promise<{ txId: string; blockHeight: number }>;
}> {
  // Runtime dynamic import — avoids Next/TS resolving Midnight WASM packages at build time.
  const loader = new Function('return import("/midnight-client.js")') as () => Promise<{
    getPublicState: (
      config: ReturnType<typeof loadConfig>,
      indexer: string,
      indexerWs: string,
    ) => Promise<PublicState | null>;
    submitVerifyMembership: (
      config: ReturnType<typeof loadConfig>,
      wallet: ConnectedWallet,
      secret: string,
    ) => Promise<{ txId: string; blockHeight: number }>;
  }>;
  return loader();
}

function shortAddr(addr: string) {
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 12)}…${addr.slice(-6)}`;
}

export default function Home() {
  const config = useMemo(() => loadConfig(), []);
  const [laceInstalled, setLaceInstalled] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => {
    let cancelled = false;
    void waitForLace().then((found) => {
      if (!cancelled) setLaceInstalled(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPublicState = useCallback(async () => {
    if (!config.contractAddress) {
      setStateError('No contract address configured (set VITE_CONTRACT_ADDRESS).');
      return;
    }
    const indexer = config.indexerUri ?? wallet?.uris.indexerUri;
    const indexerWs = config.indexerWsUri ?? wallet?.uris.indexerWsUri;
    if (!indexer || !indexerWs) {
      setStateError('No indexer URI. Connect Lace or set VITE_INDEXER_URI / VITE_INDEXER_WS_URI.');
      return;
    }
    setStateLoading(true);
    setStateError(null);
    try {
      const { getPublicState } = await contractApi();
      const s = await getPublicState(config, indexer, indexerWs);
      setPublicState(s);
    } catch (err) {
      setStateError(err instanceof Error ? err.message : String(err));
    } finally {
      setStateLoading(false);
    }
  }, [config, wallet]);

  useEffect(() => {
    const haveIndexer = config.indexerUri !== null || wallet !== null;
    if (config.contractAddress && haveIndexer) {
      void refreshPublicState();
    }
  }, [config.contractAddress, config.indexerUri, wallet, refreshPublicState]);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setWalletError(null);
    try {
      const w = await connectLace(config.network);
      setWallet(w);
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  }, [config.network]);

  const handleDisconnect = () => {
    setWallet(null);
    setStatus({ kind: 'idle' });
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setStatus({ kind: 'submitting' });
    try {
      const { submitVerifyMembership } = await contractApi();
      const { txId, blockHeight } = await submitVerifyMembership(config, wallet, secret);
      setStatus({ kind: 'success', txId, blockHeight });
      setSecret('');
      void refreshPublicState();
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const verifyDisabled = wallet === null || !config.contractAddress || status.kind === 'submitting';

  return (
    <main className="app">
      <header className="app__header">
        <p className="eyebrow">Private Allowlist Access</p>
        <h1>Private Membership Verification</h1>
        <p className="app__subtitle">
          Prove you belong — without revealing who you are or your membership secret.
        </p>
        <div className="app__meta">
          <span className="badge">{networkLabel(config.network)}</span>
          <span className="badge badge--muted">
            {config.contractAddress
              ? `Contract ${config.contractAddress.slice(0, 10)}…`
              : 'No contract configured'}
          </span>
        </div>
      </header>

      <div className="grid">
        <section className="panel">
          <header className="panel__header">
            <h2>Wallet</h2>
            <span className={`status-dot ${wallet ? 'on' : 'off'}`} />
            <span>{wallet ? 'Connected' : 'Disconnected'}</span>
          </header>
          {!laceInstalled && (
            <p className="hint warn">
              Midnight wallet not detected. Install main{' '}
              <a href={LACE_STORE_URL} target="_blank" rel="noreferrer">
                Lace
              </a>{' '}
              (Preview is deprecated), enable Midnight, then reload.
            </p>
          )}
          {wallet ? (
            <>
              <div className="kv">
                <span>Address</span>
                <code title={wallet.state.address}>{shortAddr(wallet.state.address)}</code>
              </div>
              <button className="btn ghost" onClick={handleDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="btn" onClick={handleConnect} disabled={connecting || !laceInstalled}>
              {connecting ? 'Connecting…' : 'Connect Lace'}
            </button>
          )}
          {walletError && <p className="hint error">{walletError}</p>}
        </section>

        <section className="panel">
          <header className="panel__header">
            <h2>Membership Proof</h2>
          </header>
          <form onSubmit={handleVerify}>
            <label htmlFor="secret">Private Membership Secret</label>
            <div className="secret-row">
              <input
                id="secret"
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="e.g. allowlist-code-4F9K2"
                disabled={verifyDisabled && status.kind !== 'submitting'}
              />
              <button type="button" className="btn ghost" onClick={() => setShowSecret((v) => !v)}>
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <button className="btn" type="submit" disabled={verifyDisabled || !secret.trim()}>
              {status.kind === 'submitting' ? 'Verifying…' : 'Verify Membership'}
            </button>
          </form>
          {!config.contractAddress && (
            <p className="hint warn">Set VITE_CONTRACT_ADDRESS to the deployed contract, then reload.</p>
          )}
          {wallet === null && config.contractAddress && (
            <p className="hint">Connect your Lace wallet to verify membership.</p>
          )}
          {status.kind === 'success' && (
            <p className="hint ok">
              Verified. tx {status.txId.slice(0, 14)}… · block {status.blockHeight}
            </p>
          )}
          {status.kind === 'error' && <p className="hint error">{status.message}</p>}
        </section>

        <section className="panel">
          <header className="panel__header">
            <h2>Public Ledger State</h2>
            <button className="btn ghost" onClick={() => void refreshPublicState()} disabled={stateLoading}>
              {stateLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </header>
          {publicState ? (
            <>
              <div className="kv">
                <span>Group Name</span>
                <strong>{publicState.groupName}</strong>
              </div>
              <div className="kv">
                <span>Public Verified Member Count</span>
                <strong>{publicState.verifiedMemberCount.toString()}</strong>
              </div>
            </>
          ) : (
            <p className="hint">No state yet.</p>
          )}
          {stateError && <p className="hint error">{stateError}</p>}
        </section>
      </div>

      <section className="panel privacy">
        <h2>What stays private</h2>
        <ul>
          <li>Membership secret / allowlist proof code</li>
          <li>Member identity (not written to the contract ledger)</li>
        </ul>
        <h2>What is public</h2>
        <ul>
          <li>Group / community name</li>
          <li>Total verified member count</li>
          <li>That a valid verification transaction occurred</li>
        </ul>
      </section>

      <footer className="app__footer">
        <p>
          Preprod deploy is attempted once; if wallet sync blocks, the full-stack app is submitted
          with local verification and documented status (mentor guidance).
        </p>
      </footer>
    </main>
  );
}
