/** All user-facing text for the job detail page. */
export const jobDetailCopy = {
  metaTitle: "Job details",
  metaDescription:
    "See the brief, budget, screening questions and client details for an open job on GigsHive.",
  loading: "Loading job details…",
  breadcrumbLabel: "Breadcrumb",
  notFoundTitle: "Job not found",
  postedPrefix: "Posted",
  proposalsSuffix: "proposals so far",
  applicationsSuffix: "applications so far",
  openUntilPrefix: "Open until",

  aboutTitle: "About the job",
  deliverablesTitle: "What you will deliver",
  skillsTitle: "Skills",

  questionsTitle: "Questions to answer when you apply",
  questionsIntro:
    "The client asked for these. Required questions must be answered before you can send your proposal.",
  requiredFlag: "Required",
  optionalFlag: "Optional",

  budgetLabel: "Budget",
  agreedAfterApply: "Agreed after you apply",
  deliveryPrefix: "Delivery within",
  deliverySuffix: "days",
  signInToProposal: "Sign in to send a proposal",
  verifyEmailToProposal: "Verify your email to send a proposal",
  suspendedCannotApply: "Your profile is suspended, so you cannot send proposals right now.",
  newHere: "New here?",
  createFreeAccount: "Create a free account",
  verifiedProfileNote: "You need a verified worker profile to apply.",

  aboutClient: "About the client",
  emailVerified: "Email verified",
  memberSincePrefix: "Member since",

  escrowNote:
    "If your proposal is accepted, the client funds the contract before you start. The payment is held until the client approves your work.",

  statusLabel: "Status",
  removalReasonLabel: "Why this job was removed",
  ownerNotice: "Owner view. Management actions are available from My jobs.",
  statusLabels: {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    REMOVED: "Removed",
    DRAFT: "Draft",
  },
} as const;
