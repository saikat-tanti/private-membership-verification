export const PRIVATE_STATE_ID = 'privateMembershipVerificationState';
export const PRIVATE_STATE_STORE_NAME = 'private-membership-verification-state';
export const CONTRACT_NAME = 'private-membership-verification';

export type PublicState = {
  groupName: string;
  verifiedMemberCount: bigint;
};
