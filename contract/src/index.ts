export * from './managed/private-membership-verification/contract/index.js';
export * from './witnesses.js';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as Membership from './managed/private-membership-verification/contract/index.js';

export const CompiledMembershipContract = CompiledContract.make(
  'private-membership-verification',
  Membership.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets('./managed/private-membership-verification'),
);
