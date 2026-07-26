/**
 * End-to-end smoke check for private-membership-verification.
 *
 * Reconnects to the deployed contract, reads public ledger state, exits 0 on success.
 * Usage: npm run test:e2e
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from '../membership-cli/src/network';
import { createWallet, persistWalletState, waitForWalletSync } from '../membership-cli/src/wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'privateMembershipVerificationState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function fail(msg: string): never {
  console.error(`❌ e2e-check failed: ${msg}`);
  process.exit(1);
}

function isHexAddress(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-fA-F]+$/.test(s) && s.length >= 32;
}

async function main() {
  const deployment = getDeployment(network);
  if (!deployment) {
    fail(`No deploy on file for network ${network}. Run npm run setup -- --network ${network}`);
  }
  if (!isHexAddress(deployment.address)) {
    fail(`Deployment address missing or invalid: ${JSON.stringify(deployment, null, 2)}`);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(
    __dirname,
    '..',
    'contract',
    'src',
    'managed',
    'private-membership-verification',
  );
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) fail('Compiled contract missing — run `npm run compile`.');

  const ContractMod = await import(pathToFileURL(contractPath).href);
  const compiledContract = CompiledContract.make(
    'private-membership-verification',
    ContractMod.Contract,
  ).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  await waitForWalletSync(walletCtx, { network, networkConfig });
  await persistWalletState(network, walletCtx);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx() {
      throw new Error('e2e-check is read-only and should not balance transactions');
    },
    submitTx() {
      throw new Error('e2e-check is read-only and should not submit transactions');
    },
  };

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'private-membership-verification-state',
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  try {
    await findDeployedContract(providers as never, {
      contractAddress: deployment.address,
      compiledContract: compiledContract as never,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    } as never);
  } catch (err: unknown) {
    await walletCtx.wallet.stop();
    fail(`findDeployedContract threw: ${err instanceof Error ? err.message : String(err)}`);
  }

  const onChainState = await providers.publicDataProvider.queryContractState(deployment.address);
  if (!onChainState) {
    await walletCtx.wallet.stop();
    fail(`queryContractState returned null for ${deployment.address}`);
  }

  const ledgerState = ContractMod.ledger(onChainState.data);
  const groupName = Buffer.from(ledgerState.groupName).toString();
  console.log(`✅ e2e-check passed`);
  console.log(`   contractAddress:      ${deployment.address}`);
  console.log(`   network:              ${network}`);
  console.log(`   groupName:            "${groupName}"`);
  console.log(`   verifiedMemberCount:  ${ledgerState.verifiedMemberCount.toString()}`);

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
