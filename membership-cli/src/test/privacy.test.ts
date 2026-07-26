import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// Privacy invariants against compiled Compact metadata.
// Requires: npm run compile

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const infoPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'contract',
  'src',
  'managed',
  'private-membership-verification',
  'compiler',
  'contract-info.json',
);

function loadInfo(): any {
  if (!fs.existsSync(infoPath)) {
    throw new Error(
      `Compiled contract-info.json not found at ${infoPath}. Run \`npm run compile\` first.`,
    );
  }
  return JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
}

test('compiled with Compact compiler 0.31.1', () => {
  const info = loadInfo();
  assert.equal(info['compiler-version'], '0.31.1');
});

test('public ledger exposes only groupName and verifiedMemberCount', () => {
  const info = loadInfo();
  const ledgerNames = (info.ledger as Array<{ name: string; storage: string }>)
    .map((l) => l.name)
    .sort();
  assert.deepEqual(ledgerNames, ['groupName', 'verifiedMemberCount']);

  const byName = Object.fromEntries(
    (info.ledger as Array<{ name: string; storage: string }>).map((l) => [l.name, l]),
  );
  assert.equal(byName.verifiedMemberCount.storage, 'Counter');
  assert.equal(ledgerNames.includes('membershipSecret'), false);
});

test('verifyMembership takes an opaque membershipSecret and produces a proof', () => {
  const info = loadInfo();
  const circuit = (info.circuits as Array<any>).find((c) => c.name === 'verifyMembership');
  assert.ok(circuit, 'verifyMembership circuit must exist');
  assert.equal(circuit.proof, true);
  assert.equal(circuit.arguments.length, 1);
  assert.equal(circuit.arguments[0].name, 'membershipSecret');
  assert.equal(circuit.arguments[0].type['type-name'], 'Opaque');
});

test('no witnesses are declared on the compiled contract', () => {
  const info = loadInfo();
  assert.deepEqual(info.witnesses, []);
});
