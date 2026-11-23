import { kobo, type Kobo } from "@gigshive/shared/money";

export interface FeeExample {
  /** Integer kobo amounts supplied together by the platform, never derived in the client. */
  agreedAmountKobo: Kobo;
  platformFeeKobo: Kobo;
  workerReceivesKobo: Kobo;
}

/**
 * Typed mock used until the platform exposes a public fee/example endpoint.
 * The values below are placeholders in integer kobo; the client does not calculate
 * the fee or the worker amount from the agreed amount.
 *
 * Backend request: expose the current platform fee rate and a worked example that the
 * Fees page can render directly, so these placeholder numbers can be removed.
 */
export async function getFeeExample(): Promise<FeeExample> {
  return {
    agreedAmountKobo: kobo(12_000_000),
    platformFeeKobo: kobo(1_200_000),
    workerReceivesKobo: kobo(10_800_000),
  };
}
