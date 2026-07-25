'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadConfig, type AppConfig } from '@/lib/config';
import { pushActivity } from '@/lib/activity';
import {
  connectLace,
  waitForLace,
  type ConnectedWallet,
  LACE_STORE_URL,
  isLaceInstalled,
} from '@/lib/lace';

const AUTOCONNECT_KEY = 'pmv:lace-autoconnect';

type PublicState = {
  groupName: string;
  verifiedMemberCount: bigint;
};

type WalletContextValue = {
  config: AppConfig;
  laceInstalled: boolean;
  laceReady: boolean;
  wallet: ConnectedWallet | null;
  connecting: boolean;
  walletError: string | null;
  publicState: PublicState | null;
  stateLoading: boolean;
  stateError: string | null;
  laceStoreUrl: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshPublicState: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

async function contractApi(): Promise<{
  getPublicState: (
    config: AppConfig,
    indexer: string,
    indexerWs: string,
  ) => Promise<PublicState | null>;
}> {
  const loader = new Function('return import("/midnight-client.js")') as () => Promise<{
    getPublicState: (
      config: AppConfig,
      indexer: string,
      indexerWs: string,
    ) => Promise<PublicState | null>;
  }>;
  return loader();
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => loadConfig(), []);
  const [laceInstalled, setLaceInstalled] = useState(false);
  const [laceReady, setLaceReady] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

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

  const connect = useCallback(async () => {
    setConnecting(true);
    setWalletError(null);
    try {
      const w = await connectLace(config.network);
      setWallet(w);
      window.localStorage.setItem(AUTOCONNECT_KEY, '1');
      pushActivity(
        'wallet_connect',
        'Lace wallet connected',
        w.state.address,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setWalletError(message);
      pushActivity('wallet_disconnect', 'Wallet connect failed', message);
    } finally {
      setConnecting(false);
    }
  }, [config.network]);

  const disconnect = useCallback(() => {
    setWallet(null);
    window.localStorage.setItem(AUTOCONNECT_KEY, '0');
    pushActivity('wallet_disconnect', 'Lace wallet disconnected');
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const found = await waitForLace();
      if (cancelled) return;
      setLaceInstalled(found || isLaceInstalled());
      setLaceReady(true);

      const auto = window.localStorage.getItem(AUTOCONNECT_KEY);
      // Auto-connect on first visit and whenever user previously connected.
      if (found && auto !== '0') {
        setConnecting(true);
        try {
          const w = await connectLace(config.network);
          if (!cancelled) {
            setWallet(w);
            window.localStorage.setItem(AUTOCONNECT_KEY, '1');
            pushActivity('wallet_connect', 'Lace auto-connected', w.state.address);
          }
        } catch (err) {
          if (!cancelled) {
            setWalletError(err instanceof Error ? err.message : String(err));
          }
        } finally {
          if (!cancelled) setConnecting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config.network]);

  useEffect(() => {
    const haveIndexer = config.indexerUri !== null || wallet !== null;
    if (config.contractAddress && haveIndexer) {
      void refreshPublicState();
    }
  }, [config.contractAddress, config.indexerUri, wallet, refreshPublicState]);

  const value = useMemo<WalletContextValue>(
    () => ({
      config,
      laceInstalled,
      laceReady,
      wallet,
      connecting,
      walletError,
      publicState,
      stateLoading,
      stateError,
      laceStoreUrl: LACE_STORE_URL,
      connect,
      disconnect,
      refreshPublicState,
    }),
    [
      config,
      laceInstalled,
      laceReady,
      wallet,
      connecting,
      walletError,
      publicState,
      stateLoading,
      stateError,
      connect,
      disconnect,
      refreshPublicState,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
