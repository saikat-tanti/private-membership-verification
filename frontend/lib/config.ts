export type NetworkId = 'undeployed' | 'preview' | 'preprod';

const NETWORK_IDS: readonly NetworkId[] = ['undeployed', 'preview', 'preprod'];

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

function readEnv(key: string): string | undefined {
  // Support both VITE_* (submission .env.example) and NEXT_PUBLIC_* (Next.js).
  if (typeof process === 'undefined') return undefined;
  return (
    process.env[key] ??
    process.env[`NEXT_PUBLIC_${key}`] ??
    process.env[key.replace(/^VITE_/, 'NEXT_PUBLIC_')]
  );
}

export function loadConfig(): AppConfig {
  const rawNetwork = (readEnv('VITE_NETWORK') ?? readEnv('VITE_MIDNIGHT_NETWORK') ?? 'undeployed').trim();
  const network: NetworkId = isNetworkId(rawNetwork) ? rawNetwork : 'undeployed';

  return {
    network,
    contractAddress: orNull(readEnv('VITE_CONTRACT_ADDRESS')),
    indexerUri: orNull(readEnv('VITE_INDEXER_URI')),
    indexerWsUri: orNull(readEnv('VITE_INDEXER_WS_URI')),
    proverUri: orNull(readEnv('VITE_PROOF_SERVER_URL') ?? readEnv('VITE_PROVER_URI')),
  };
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
