/**
 * Load the prebundled Midnight client and wait for top-level-await init.
 * Without awaiting `__tla`, named exports are still undefined.
 */
export type MidnightClient = {
  getPublicState: (...args: never[]) => Promise<unknown>;
  deployMembershipContract: (...args: never[]) => Promise<{ contractAddress: string }>;
  submitVerifyMembership: (...args: never[]) => Promise<{ txId: string; blockHeight: number }>;
};

export async function loadMidnightClient(): Promise<MidnightClient> {
  const loader = new Function('return import("/midnight-client.js")') as () => Promise<
    MidnightClient & { __tla?: Promise<void> }
  >;
  const mod = await loader();
  if (mod.__tla) await mod.__tla;
  if (typeof mod.deployMembershipContract !== 'function') {
    throw new Error(
      'midnight-client.js missing deployMembershipContract — hard-refresh the page (Ctrl+Shift+R).',
    );
  }
  return mod;
}
