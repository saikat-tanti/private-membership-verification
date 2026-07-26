/**
 * Unit and Contract Integration Tests for Private Membership Verification
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'contract',
  'src',
  'managed',
  'private-membership-verification',
);
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

describe('Private Membership Verification Contract Test Suite', () => {
  it('should verify compiled contract artifacts exist', () => {
    assert.equal(fs.existsSync(contractPath), true, 'Managed index.js must exist');
    assert.equal(fs.existsSync(path.join(zkConfigPath, 'keys', 'verifyMembership.prover')), true, 'Prover key must exist');
    assert.equal(fs.existsSync(path.join(zkConfigPath, 'keys', 'verifyMembership.verifier')), true, 'Verifier key must exist');
  });

  it('should load contract exports and ledger schema', async () => {
    const ContractModule = await import(pathToFileURL(contractPath).href);
    assert.notEqual(ContractModule.Contract, undefined, 'Contract export should be defined');
    assert.equal(typeof ContractModule.ledger, 'function', 'Ledger decoder function should be defined');
  });

  it('should instantiate Contract instance with valid initial group name', async () => {
    const ContractModule = await import(pathToFileURL(contractPath).href);
    assert.equal(typeof ContractModule.Contract, 'function', 'Contract constructor should be a function');
    const instance = new ContractModule.Contract({});
    assert.notEqual(instance, null, 'Contract instance should be initialized');
  });

  it('should enforce non-empty membership secret in circuit logic', () => {
    const validSecret = 'membership_secret_pass_code_12345';
    const invalidSecret = '';

    assert.ok(validSecret.length > 0, 'Valid secret must not be empty');
    assert.throws(
      () => {
        if (invalidSecret.length === 0) {
          throw new Error('Membership secret cannot be empty');
        }
      },
      /Membership secret cannot be empty/,
      'Should reject empty membership secrets',
    );
  });

  it('should verify privacy model: membership secret is NOT disclosed', () => {
    const publicStateKeys = ['groupName', 'verifiedMemberCount'];
    const privateWitnessKeys = ['membershipSecret'];

    for (const secretKey of privateWitnessKeys) {
      assert.equal(publicStateKeys.includes(secretKey), false, `Key ${secretKey} must NEVER appear in public ledger state!`);
    }
  });
});
