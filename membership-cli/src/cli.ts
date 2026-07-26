/**
 * CLI for interacting with private-membership-verification contract
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, waitForWalletSync, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'privateMembershipVerificationState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(
  __dirname,
  '..',
  '..',
  'contract',
  'src',
  'managed',
  'private-membership-verification',
);

// Load compiled contract
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const PrivateMembershipVerification = await import(pathToFileURL(contractPath).href);

const compiledContract = CompiledContract.make(
  'private-membership-verification',
  PrivateMembershipVerification.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

// ─── Providers ─────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'private-membership-verification-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── Main CLI ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           Private Membership Verification CLI                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network:  ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state — sync will resume from saved point.`);
    }

    let state;
    try {
      state = await waitForWalletSync(walletCtx, { network, networkConfig });
    } catch (err) {
      console.error(`\n❌ ${err instanceof Error ? err.message : String(err)}\n`);
      await walletCtx.wallet.stop();
      process.exit(1);
    }

    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });

    console.log('  ✅ Connected!\n');

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Submit Private Membership Proof');
      console.log('  2. Read Public Membership State');
      console.log('  3. Check Wallet Balance');
      console.log('  4. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const secret = await rl.question('  Enter your private membership secret: ');
          if (!secret.trim()) {
            console.log('  ⚠ Membership secret cannot be empty.');
            break;
          }
          console.log('\n  Submitting ZK proof & transaction (this may take 30-60 seconds)...');
          try {
            const tx = await deployed.callTx.verifyMembership(secret);
            console.log(`\n  ✅ Private Membership Verified Successfully!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block Height:   ${tx.public.blockHeight}`);
            console.log(`  Privacy Note:   Your membership secret was NOT disclosed on-chain.\n`);
          } catch (error) {
            console.error('\n  ❌ Verification Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          console.log('\n  Reading public membership state from ledger...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledgerState = PrivateMembershipVerification.ledger(contractState.data);
              const groupNameStr = Buffer.from(ledgerState.groupName).toString();
              const countVal = ledgerState.verifiedMemberCount;
              console.log('\n  📊 PUBLIC LEDGER STATE:');
              console.log(`     Group Name:            "${groupNameStr}"`);
              console.log(`     Verified Member Count: ${countVal.toString()}\n`);
            } else {
              console.log('\n  📋 Contract state empty or not found.\n');
            }
          } catch (error) {
            console.error('\n  ❌ Failed to read ledger state:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          const syncState = await walletCtx.wallet.waitForSyncedState();
          const curBalance = syncState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          console.log(`\n  💰 Current Wallet Balance: ${curBalance.toLocaleString()} tNight\n`);
          break;
        }

        case '4': {
          running = false;
          break;
        }

        default: {
          console.log('  Invalid choice. Please select 1-4.');
        }
      }
    }

    await walletCtx.wallet.stop();
    rl.close();
  } catch (error) {
    console.error('\n❌ Error in CLI:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
