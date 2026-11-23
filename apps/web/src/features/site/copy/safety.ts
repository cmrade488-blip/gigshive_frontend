export interface SafetyFeature {
  title: string;
  text: string;
}

export interface SafetyStep {
  title: string;
  text: string;
  image: string;
}

export const safetyCopy = {
  metaTitle: "Trust and safety",
  metaDescription:
    "How GigsHive keeps hiring and getting paid clear and fair: verified workers, payment held until approval and a clear contract record.",

  eyebrow: "Trust and safety",
  heroTitle: "Work with confidence",
  heroSubtitle:
    "Here is how GigsHive helps keep hiring and getting paid clear and fair for both sides.",

  features: [
    {
      title: "Verified workers",
      text: "Workers confirm who they are with an ID check before they can send proposals. Verified profiles show a badge.",
    },
    {
      title: "Payment held until you approve",
      text: "When you accept a proposal you fund the contract. The money is held by GigsHive and released to the worker after you approve the work.",
    },
    {
      title: "A clear record",
      text: "Every contract shows its status, amount and activity, so both sides can see what was agreed and what happened.",
    },
    {
      title: "Help when it goes wrong",
      text: "If there is a problem you can request changes or raise it from the contract. Our team can look into it.",
    },
  ] satisfies readonly SafetyFeature[],

  paymentHeading: "How a payment moves",
  paymentSteps: [
    {
      title: "You accept a proposal",
      text: "A contract is created",
      image: "/brand/images/steps/post-a-job.svg",
    },
    {
      title: "You fund it",
      text: "Money is held by GigsHive",
      image: "/brand/images/steps/fund.svg",
    },
    {
      title: "You approve the work",
      text: "Payment goes to the worker",
      image: "/brand/images/steps/get-paid.svg",
    },
  ] satisfies readonly SafetyStep[],

  tipsHeading: "Stay safe on GigsHive",
  tips: [
    "Keep the conversation and payment on GigsHive so your contract is recorded.",
    "Never share your password or a code sent to you, not even with someone who says they work for us.",
    "Check that a worker shows the verified badge before you hire.",
    "Only approve work when you are happy with it. Approving releases the payment.",
    "If something feels wrong, report it from the contract page.",
  ] satisfies readonly string[],

  ctaTitle: "Ready to try it?",
  ctaText: "Create a free account and post your first job.",
  ctaLabel: "Join free",
} as const;
