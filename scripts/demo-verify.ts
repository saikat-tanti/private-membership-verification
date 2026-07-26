/**
 * One-shot local verify for screenshots / demo (no interactive menu).
 * Usage: npx tsx scripts/demo-verify.ts [secret]
 */
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { resolveNetwork, getDeployment, getOrCreateSeed, setActiveNetwork } from '../membership-cli/src/network.ts';
import {
  createWallet,
  persistWalletState,
  waitForWalletSync,
  unshieldedToken,
  type WalletContext,
} from '../membership-cli/src/wallet.ts';

// @ts-expect-error
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'privateMembershipVerificationState';
const secret = process.argv[2] ?? 'membership-demo-secret-42';

setActiveNetwork('undeployed');
const { network, config: networkConfig } = resolveNetwork({ argv: ['--', '--network', 'undeployed'] });
const deployment = getDeployment(network);
if (!deployment?.address) {
  console.error('No undeployed deployment found. Run: npm run setup -- --network undeployed');
  process.exit(1);
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
const ContractMod = await import(pathToFileURL(path.join(zkConfigPath, 'contract', 'index.js')).href);

const compiledContract = CompiledContract.make(
  'private-membership-verification',
  ContractMod.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

async function createProviders(walletCtx: WalletContext) {
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: unknown, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx as never,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: unknown) => walletCtx.wallet.submitTransaction(tx as never),
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'private-membership-verification-state',
      accountId,
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

const seed = getOrCreateSeed(network);
const walletCtx = await createWallet({ network, networkConfig, seed });
const state = await waitForWalletSync(walletCtx, { network, networkConfig });
await persistWalletState(network, walletCtx);

const address = walletCtx.unshieldedKeystore.getBech32Address();
console.log(`Wallet:  ${address}`);
console.log(`Balance: ${(state.unshielded.balances[unshieldedToken().raw] ?? 0n).toLocaleString()} tNight`);
console.log(`Contract: ${deployment.address}`);
console.log(`Submitting verifyMembership (secret stays private)...`);

const providers = await createProviders(walletCtx);
const deployed = await findDeployedContract(providers as never, {
  compiledContract: compiledContract as never,
  contractAddress: deployment.address,
  privateStateId: PRIVATE_STATE_ID,
  initialPrivateState: {},
} as never);

const tx = await (deployed as { callTx: { verifyMembership: (s: string) => Promise<{ public: { txId: string; blockHeight: number } }> } })
  .callTx.verifyMembership(secret);

console.log(`\n✅ Verified!`);
console.log(`  txId:         ${tx.public.txId}`);
console.log(`  blockHeight:  ${tx.public.blockHeight}`);

const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
const ledgerState = ContractMod.ledger(contractState!.data);
console.log(`\n📊 Public ledger state:`);
console.log(`  groupName:            "${Buffer.from(ledgerState.groupName).toString()}"`);
console.log(`  verifiedMemberCount:  ${ledgerState.verifiedMemberCount.toString()}`);

await walletCtx.wallet.stop();
