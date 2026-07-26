/** Private state for private-membership-verification — vacant (no witnesses). */

export type MembershipPrivateState = Record<string, never>;

export const createMembershipPrivateState = (): MembershipPrivateState => ({});

export const witnesses = {};
