// Client-only Midnight contract integration.
// Membership secret is a private witness — never disclosed on-chain.

import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Generated Compact output — copied to public/managed and also importable via alias.
import { Contract, ledger } from '@contract/contract/index.js';

import type { AppConfig } from './config';
import type { ConnectedWallet } from './lace';

const PRIVATE_STATE_ID = 'privateMembershipVerificationState';

export interface PublicState {
  groupName: string;
  verifiedMemberCount: bigint;
}

function resolveUris(config: AppConfig, wallet: ConnectedWallet) {
  return {
    indexer: config.indexerUri ?? wallet.uris.indexerUri,
    indexerWs: config.indexerWsUri ?? wallet.uris.indexerWsUri,
    prover: config.proverUri ?? wallet.uris.proverServerUri,
  };
}

export async function getPublicState(
  config: AppConfig,
  indexerUri: string,
  indexerWsUri: string,
): Promise<PublicState | null> {
  if (!config.contractAddress) {
    throw new Error('No contract address configured (set VITE_CONTRACT_ADDRESS).');
  }
  const publicDataProvider = indexerPublicDataProvider(indexerUri, indexerWsUri);
  const contractState = await publicDataProvider.queryContractState(config.contractAddress);
  if (!contractState) return null;

  const state = ledger(contractState.data);
  const groupName =
    typeof state.groupName === 'string'
      ? state.groupName
      : new TextDecoder().decode(state.groupName as Uint8Array);
  return { groupName, verifiedMemberCount: state.verifiedMemberCount as bigint };
}

function buildWalletProvider(wallet: ConnectedWallet) {
  return {
    getCoinPublicKey: () => wallet.state.coinPublicKey,
    getEncryptionPublicKey: () => wallet.state.encryptionPublicKey ?? '',
    balanceTx: (tx: unknown, newCoins: unknown[] = []) =>
      wallet.api.balanceAndProveTransaction(tx, newCoins),
    submitTx: (tx: unknown) => wallet.api.submitTransaction(tx),
  };
}

export async function submitVerifyMembership(
  config: AppConfig,
  wallet: ConnectedWallet,
  membershipSecret: string,
): Promise<{ txId: string; blockHeight: number }> {
  if (!config.contractAddress) {
    throw new Error('No contract address configured (set VITE_CONTRACT_ADDRESS).');
  }
  if (membershipSecret.trim().length === 0) {
    throw new Error('Membership secret is required.');
  }

  setNetworkId(config.network as never);
  const uris = resolveUris(config, wallet);

  const zkConfigProvider = new FetchZkConfigProvider(
    `${window.location.origin}/managed/private-membership-verification`,
    fetch.bind(window),
  );
  const walletProvider = buildWalletProvider(wallet);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'private-membership-verification-state',
      accountId: wallet.state.address,
      privateStoragePasswordProvider: () => 'Local-Browser-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(uris.indexer, uris.indexerWs),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(uris.prover, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  const deployed = await findDeployedContract(providers as never, {
    contractAddress: config.contractAddress,
    contract: new Contract({}),
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  } as never);

  const tx = await (
    deployed as unknown as {
      callTx: {
        verifyMembership(secret: string): Promise<{ public: { txId: string; blockHeight: number } }>;
      };
    }
  ).callTx.verifyMembership(membershipSecret);

  return { txId: tx.public.txId, blockHeight: tx.public.blockHeight };
}
