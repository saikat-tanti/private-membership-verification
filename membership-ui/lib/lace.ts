// Midnight wallet connector helpers.
// Enumerate window.midnight (UUID keys). Do not hardcode mnLace only.
// Main Lace Chrome Store — Midnight Preview is deprecated.

export interface ServiceUriConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
  networkId?: string;
}

export interface WalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey?: string;
}

export interface DAppConnectorWalletAPI {
  state(): Promise<WalletState>;
  balanceAndProveTransaction(tx: unknown, newCoins?: unknown[]): Promise<unknown>;
  submitTransaction(tx: unknown): Promise<string>;
  balanceUnsealedTransaction?(
    tx: unknown,
    opts?: { payFees?: boolean },
  ): Promise<{ tx: unknown }>;
}

export interface InjectedWallet {
  apiVersion: string;
  name?: string;
  icon?: string;
  rdns?: string;
  enable?: () => Promise<DAppConnectorWalletAPI>;
  isEnabled?: () => Promise<boolean>;
  serviceUriConfig?: () => Promise<ServiceUriConfig>;
  connect?: (networkId?: string) => Promise<ConnectedWalletAPI>;
}

export interface ConnectedWalletAPI {
  getConfiguration(): Promise<ServiceUriConfig>;
  getConnectionStatus?(): Promise<{ status: string; networkId?: string }>;
  getShieldedAddresses(): Promise<{
    shieldedAddress: string;
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey?: string;
  }>;
  balanceAndProveTransaction?(tx: unknown, newCoins?: unknown[]): Promise<unknown>;
  balanceUnsealedTransaction?(
    tx: unknown,
    opts?: { payFees?: boolean },
  ): Promise<{ tx: unknown }>;
  submitTransaction(tx: unknown): Promise<string>;
}

declare global {
  interface Window {
    midnight?: Record<string, InjectedWallet | undefined>;
  }
}

export const LACE_STORE_URL =
  'https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk';

function looksLikeWallet(value: unknown): value is InjectedWallet {
  if (!value || typeof value !== 'object') return false;
  const w = value as InjectedWallet;
  if (typeof w.apiVersion !== 'string') return false;
  return typeof w.enable === 'function' || typeof w.connect === 'function';
}

export function listWallets(): InjectedWallet[] {
  const injected = window.midnight;
  if (!injected) return [];
  return Object.values(injected).filter(looksLikeWallet);
}

export function selectWallet(): InjectedWallet | null {
  const wallets = listWallets();
  if (wallets.length === 0) return null;
  const lace = wallets.find((w) => {
    const label = `${w.name ?? ''} ${w.rdns ?? ''}`.toLowerCase();
    return label.includes('lace');
  });
  return lace ?? wallets[0] ?? null;
}

export function getConnector(): InjectedWallet | null {
  const named = window.midnight?.mnLace;
  if (looksLikeWallet(named)) return named;
  return selectWallet();
}

export function isLaceInstalled(): boolean {
  return listWallets().length > 0;
}

export function waitForLace(timeoutMs = 5000, intervalMs = 200): Promise<boolean> {
  if (isLaceInstalled()) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (isLaceInstalled()) {
        window.clearInterval(timer);
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        resolve(false);
      }
    }, intervalMs);
  });
}

export interface ConnectedWallet {
  api: DAppConnectorWalletAPI;
  state: WalletState;
  uris: ServiceUriConfig;
  walletName?: string;
}

function adaptConnectedApi(connected: ConnectedWalletAPI, state: WalletState): DAppConnectorWalletAPI {
  return {
    state: async () => state,
    balanceAndProveTransaction: async (tx, newCoins = []) => {
      if (typeof connected.balanceAndProveTransaction === 'function') {
        return connected.balanceAndProveTransaction(tx, newCoins);
      }
      if (typeof connected.balanceUnsealedTransaction === 'function') {
        const result = await connected.balanceUnsealedTransaction(tx, { payFees: true });
        return result.tx;
      }
      throw new Error('Wallet missing balanceAndProveTransaction.');
    },
    submitTransaction: (tx) => connected.submitTransaction(tx),
    balanceUnsealedTransaction: connected.balanceUnsealedTransaction?.bind(connected),
  };
}

export async function connectLace(networkId: string = 'undeployed'): Promise<ConnectedWallet> {
  const connector = getConnector();
  if (!connector) {
    throw new Error(
      'No Midnight wallet found. Install main Lace, enable Midnight, then reload.',
    );
  }

  if (typeof connector.connect === 'function') {
    const connected = await connector.connect(networkId);
    const status = await connected.getConnectionStatus?.();
    if (status && status.status !== 'connected') {
      throw new Error(`Wallet connection status: ${status.status}`);
    }
    const [uris, shielded] = await Promise.all([
      connected.getConfiguration(),
      connected.getShieldedAddresses(),
    ]);
    const state: WalletState = {
      address: shielded.shieldedAddress,
      coinPublicKey: shielded.shieldedCoinPublicKey,
      encryptionPublicKey: shielded.shieldedEncryptionPublicKey,
    };
    return {
      api: adaptConnectedApi(connected, state),
      state,
      uris,
      walletName: connector.name,
    };
  }

  if (typeof connector.enable === 'function') {
    const api = await connector.enable();
    const uris =
      typeof connector.serviceUriConfig === 'function'
        ? await connector.serviceUriConfig()
        : {
            indexerUri: '',
            indexerWsUri: '',
            proverServerUri: '',
            substrateNodeUri: '',
          };
    const state = await api.state();
    return { api, state, uris, walletName: connector.name };
  }

  throw new Error('Injected wallet does not support connect() or enable().');
}
