export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export const howItWorksCopy = {
  metaTitle: "How it works",
  metaDescription:
    "One account for everything. Hire people when you need help, and take on work when you want to earn. Payments are held until the work is approved.",

  heroTitleBefore: "How ",
  heroBrand: "GigsHive",
  heroTitleAfter: " works",
  heroSubtitle:
    "One account for everything. Hire people when you need help, and take on work when you want to earn. Payments are held until the work is approved.",

  clientPill: "For clients",
  clientHeading: "Hire with confidence",
  clientCta: "Post a job",
  clientSteps: [
    {
      title: "Post your job",
      text: "Describe the work, set a budget, and choose whether workers send a priced proposal or an application.",
    },
    {
      title: "Review proposals",
      text: "Compare proposals, answers to your questions and profiles. Choose the person you want.",
    },
    {
      title: "Fund the contract",
      text: "Accept a proposal and fund the contract. The payment is held, not paid out yet.",
    },
    {
      title: "Approve the work",
      text: "Review the delivery, ask for revisions if needed, then approve to release payment.",
    },
  ] satisfies readonly Step[],

  workerPill: "For workers",
  workerHeading: "Do good work and get paid",
  workerCta: "Create a worker profile",
  workerSteps: [
    {
      title: "Create your profile",
      text: "Add your skills, portfolio and verify your identity. You use the same login as a client.",
    },
    {
      title: "Find work",
      text: "Browse open jobs and send a proposal, or apply with answers to the client’s questions.",
    },
    {
      title: "Start when it is funded",
      text: "When a client accepts and funds the contract, you can start with confidence.",
    },
    {
      title: "Deliver and withdraw",
      text: "Submit your work. Once approved, the payment is released and you can withdraw to your bank.",
    },
  ] satisfies readonly Step[],

  protectionHeading: "How your payment is protected",
  protectionIntro: "The money moves in clear steps, and every step is recorded on your wallet.",
  protectionSteps: [
    {
      title: "Funded",
      text: "The client pays into the contract. The worker sees that the contract is funded before starting.",
    },
    {
      title: "Held",
      text: "The payment stays held while the work is done and delivered for review.",
    },
    {
      title: "Released",
      text: "When the client approves, or the review window ends, the payment is released to the worker.",
    },
    {
      title: "Withdrawn",
      text: "The worker withdraws to a Nigerian bank account. Fees are shown on the contract before you pay.",
    },
  ] satisfies readonly Step[],

  faqHeading: "Questions people ask",
  faqs: [
    {
      question: "Do I need separate accounts to hire and to work?",
      answer:
        "No. You have one account and one login. You can add a client profile, a worker profile, or both, and switch between them.",
    },
    {
      question: "What does it cost?",
      answer:
        "Creating an account is free. Any service fees are shown on the contract before the client pays, so there are no surprises.",
    },
    {
      question: "What if I am not happy with the delivery?",
      answer:
        "You can ask for revisions within the limit set on the contract. The payment stays held until you approve or the review window ends.",
    },
    {
      question: "Why do workers need to be verified?",
      answer:
        "Verification helps clients trust who they are hiring. Workers confirm their identity before they can apply for jobs.",
    },
    {
      question: "How do I get my money out?",
      answer:
        "Add a Nigerian bank account to your wallet and request a withdrawal. Larger withdrawals may be reviewed by our team first.",
    },
  ] satisfies readonly Faq[],
} as const;
