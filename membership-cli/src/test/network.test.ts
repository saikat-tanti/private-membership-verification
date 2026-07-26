import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
  resolveNetwork,
  isNetworkId,
  getOrCreateSeed,
  recordDeployment,
  getDeployment,
  setActiveNetwork,
  NETWORK_IDS,
  NETWORK_CONFIGS,
} from '../network.ts';

function tmpCwd(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pmv-net-'));
}

test('isNetworkId accepts known networks and rejects typos', () => {
  for (const id of NETWORK_IDS) {
    assert.equal(isNetworkId(id), true);
  }
  assert.equal(isNetworkId('prepro'), false);
  assert.equal(isNetworkId('mainnet'), false);
});

test('preprod uses remote proof server and no compose services', () => {
  assert.equal(
    NETWORK_CONFIGS.preprod.proofServer,
    'https://proof-server.preprod.midnight.network',
  );
  assert.deepEqual(NETWORK_CONFIGS.preprod.composeServices, []);
});

test('resolveNetwork honors the --network flag', () => {
  const cwd = tmpCwd();
  const r = resolveNetwork({ argv: ['node', 'script', '--network', 'preprod'], env: {}, cwd });
  assert.equal(r.network, 'preprod');
  assert.equal(r.config.networkId, 'preprod');
});

test('resolveNetwork defaults to undeployed with no flag or state', () => {
  const cwd = tmpCwd();
  const r = resolveNetwork({ argv: ['node', 'script'], env: {}, cwd });
  assert.equal(r.network, 'undeployed');
});

test('seed is generated once per network then reused', () => {
  const cwd = tmpCwd();
  const first = getOrCreateSeed('undeployed', { env: {}, cwd });
  const second = getOrCreateSeed('undeployed', { env: {}, cwd });
  assert.equal(first, second);
  assert.match(first, /^[0-9a-f]{64}$/);
});

test('deployment records round-trip through the state file', () => {
  const cwd = tmpCwd();
  setActiveNetwork('undeployed', { cwd });
  assert.equal(getDeployment('undeployed', { cwd }), null);

  recordDeployment('undeployed', '1786cf52deadbeef', 'mn_addr_test', { cwd });
  const dep = getDeployment('undeployed', { cwd });
  assert.ok(dep);
  assert.equal(dep!.address, '1786cf52deadbeef');
  assert.equal(dep!.deployer, 'mn_addr_test');
});
