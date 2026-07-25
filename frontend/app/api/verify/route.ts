import { NextResponse } from 'next/server';

/**
 * Membership proofs must be built in the browser with Lace (private witness + ZK).
 * This route intentionally does not mock success or invent tx IDs.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'verifyMembership must run client-side with Lace so the membership secret stays a private witness. Use the Verify Membership button in the UI.',
    },
    { status: 501 },
  );
}
