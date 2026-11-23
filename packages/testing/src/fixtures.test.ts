import { describe, expect, it } from "vitest";

import {
  makeBankAccount,
  makeContract,
  makeJob,
  makeKycVerification,
  makeMoney,
  makePayout,
  makeProfile,
  makeSessionUser,
  resetFixtures,
} from "./fixtures";

describe("typed fixtures", () => {
  it("keeps money as integer kobo with the generated shape", () => {
    expect(makeMoney(500_000)).toEqual({ amount_kobo: 500_000, currency: "NGN" });
    expect(Number.isInteger(makeJob().budget_min?.amount_kobo)).toBe(true);
    expect(makeContract().total_charge.currency).toBe("NGN");
  });

  it("uses unique ids and resets deterministically", () => {
    resetFixtures();
    const first = makeProfile();
    const second = makeProfile();
    expect(second.id).not.toBe(first.id);

    resetFixtures();
    expect(makeProfile().id).toBe(first.id);
  });

  it("only exposes masked identity and account numbers", () => {
    const bank = makeBankAccount();
    expect(Object.keys(bank)).toContain("account_number_last4");
    expect(Object.keys(bank)).not.toContain("account_number");

    const kyc = makeKycVerification();
    expect(Object.keys(kyc)).toContain("identifier_last4");
    expect(Object.keys(kyc)).not.toContain("identifier");

    const payout = makePayout();
    expect(payout.account_last4).toMatch(/^\d{4}$/);
  });

  it("produces contract-shaped overrides", () => {
    const session = makeSessionUser({ account_type: "STAFF", permissions: ["finance.view"] });
    expect(session.account_type).toBe("STAFF");
    expect(session.permissions).toEqual(["finance.view"]);

    const job = makeJob({ status: "CLOSED" });
    expect(job.status).toBe("CLOSED");
  });
});
