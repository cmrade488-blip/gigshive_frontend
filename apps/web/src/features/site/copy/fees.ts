export const feesCopy = {
  metaTitle: "Fees and payment",
  metaDescription: "See what is paid, when it is paid, and who gets what on GigsHive.",

  eyebrow: "Fees and payment",
  heroTitle: "Clear fees, no surprises",
  heroSubtitle: "See what is paid, when it is paid, and who gets what.",

  exampleBadge: "EXAMPLE (SAMPLE RATE)",
  exampleHeading: "What you will pay",
  exampleIntro:
    "Before a client funds a contract, the amount and the fee are shown on the screen. There are no surprises later.",
  agreedLabel: "Agreed amount (paid by the client)",
  platformFeeLabel: "Platform fee",
  workerReceivesLabel: "Worker receives",
  exampleNote:
    "Sample numbers. The real rate comes from the platform settings and is always shown before payment.",
  exampleLoading: "Loading the sample amounts…",
  exampleError:
    "The sample amounts could not be loaded. The real amounts are always shown on the contract before payment.",
  exampleEmpty: "No sample amounts are available right now.",

  beforePaymentHeading: "Fees are shown before payment",
  beforePaymentText:
    "The exact amount and the fee are shown on the contract before you pay. There are no surprises later.",

  postingHeading: "Posting a job",
  postingText:
    "Posting a job and sending proposals does not cost anything. A fee applies when a contract is paid.",
  payoutHeading: "Getting paid out",
  payoutText:
    "Workers withdraw to their own bank account. Larger payouts may be checked by our team first.",

  goodToKnowHeading: "Good to know",
  goodToKnow: [
    "All amounts are in naira.",
    "Money is held until the client approves the work.",
    "Cancelling a contract shows what happens to the money before you confirm.",
  ] satisfies readonly string[],

  ctaTitle: "Questions about money?",
  ctaText: "The Help centre explains funding, approval and withdrawals step by step.",
  ctaLabel: "Open Help",
} as const;
