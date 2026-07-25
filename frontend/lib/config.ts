export type NetworkId = 'undeployed' | 'preview' | 'preprod';

const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'];

export const CONTRACT_OVERRIDE_KEY = 'pmv:contract-address';

function isNetworkId(v: string): v is NetworkId {
  return (NETWORK_IDS as readonly string[]).includes(v);
}

export interface AppConfig {
  network: NetworkId;
  contractAddress: string | null;
  indexerUri: string | null;
  indexerWsUri: string | null;
  proverUri: string | null;
}

function orNull(v: string | undefined | null): string | null {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : null;
}

/**
 * Next/webpack only inlines env vars accessed with static keys
 * (`process.env.VITE_FOO`), not `process.env[key]`.
 */
function envConfig(): AppConfig {
  const rawNetwork = (
    process.env.VITE_NETWORK ??
    process.env.NEXT_PUBLIC_VITE_NETWORK ??
    process.env.VITE_MIDNIGHT_NETWORK ??
    process.env.NEXT_PUBLIC_NETWORK ??
    'undeployed'
  ).trim();
  const network: NetworkId = isNetworkId(rawNetwork) ? rawNetwork : 'undeployed';

  return {
    network,
    contractAddress: orNull(
      process.env.VITE_CONTRACT_ADDRESS ??
        process.env.NEXT_PUBLIC_VITE_CONTRACT_ADDRESS ??
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    ),
    indexerUri: orNull(
      process.env.VITE_INDEXER_URI ?? process.env.NEXT_PUBLIC_VITE_INDEXER_URI,
    ),
    indexerWsUri: orNull(
      process.env.VITE_INDEXER_WS_URI ?? process.env.NEXT_PUBLIC_VITE_INDEXER_WS_URI,
    ),
    proverUri: orNull(
      process.env.VITE_PROOF_SERVER_URL ??
        process.env.NEXT_PUBLIC_VITE_PROOF_SERVER_URL ??
        process.env.VITE_PROVER_URI,
    ),
  };
}

function readContractOverride(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return orNull(window.localStorage.getItem(CONTRACT_OVERRIDE_KEY));
  } catch {
    return null;
  }
}

export function loadConfig(): AppConfig {
  const base = envConfig();
  const override = readContractOverride();
  return {
    ...base,
    contractAddress: override ?? base.contractAddress,
  };
}

export function saveContractAddressOverride(address: string | null): void {
  if (typeof window === 'undefined') return;
  const cleaned = orNull(address);
  if (cleaned) {
    window.localStorage.setItem(CONTRACT_OVERRIDE_KEY, cleaned);
  } else {
    window.localStorage.removeItem(CONTRACT_OVERRIDE_KEY);
  }
  window.dispatchEvent(new CustomEvent('pmv:config'));
}

export function networkLabel(n: NetworkId): string {
  switch (n) {
    case 'undeployed':
      return 'Local devnet';
    case 'preview':
      return 'Preview testnet';
    case 'preprod':
      return 'Preprod testnet';
  }
}
