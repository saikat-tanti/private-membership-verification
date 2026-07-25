import { NextResponse } from 'next/server';
import { loadConfig } from '../../../lib/config';

/**
 * Server config / status endpoint.
 * Live ledger decoding needs the browser indexer client + managed WASM assets.
 * This route never invents fake verification counts.
 */
export async function GET() {
  const config = loadConfig();
  return NextResponse.json({
    success: true,
    network: config.network,
    contractAddress: config.contractAddress,
    proofServerUrl: config.proverUri,
    indexerUri: config.indexerUri,
    note:
      'Public ledger groupName/verifiedMemberCount are read client-side via the indexer after Lace connect or env indexer overrides. This API does not mock counts.',
  });
}
