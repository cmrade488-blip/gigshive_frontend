import { siteRoutes } from "@gigshive/shared/routes";

/**
 * FE-019 dashboard copy. Every string rendered by the dashboard shell and
 * screen lives here; backend status codes and messages are never shown raw.
 */
export const dashboardCopy = {
  meta: {
    title: "Dashboard",
    description: "Your GigsHive workspace.",
  },
  shell: {
    brand: "GigsHive",
    homeLabel: "GigsHive home",
    skipToContent: "Skip to dashboard content",
    appNavLabel: "App",
    accountLabel: "Account settings",
    roleSwitcherLabel: "Choose profile",
    actingAs: "Acting as",
    roles: {
      CLIENT: "Client",
      WORKER: "Worker",
    },
    roleLabels: {
      CLIENT: "Client profile",
      WORKER: "Worker profile",
    },
  },
  topbar: {
    CLIENT: {
      title: "Your client workspace",
      subtitle: "Find people, manage jobs and review proposals.",
    },
    WORKER: {
      title: "Your worker workspace",
      subtitle: "Find work, track proposals and manage contracts.",
    },
  },
  nav: {
    CLIENT: [
      { id: "dashboard", label: "Dashboard", href: siteRoutes.dashboard },
      { id: "myJobs", label: "My jobs", href: siteRoutes.myJobs },
      { id: "proposals", label: "Proposals", href: siteRoutes.myProposals },
      { id: "contracts", label: "Contracts", href: siteRoutes.contracts },
      { id: "wallet", label: "Wallet", href: siteRoutes.wallet },
      { id: "profile", label: "Profile", href: siteRoutes.profile },
    ],
    WORKER: [
      { id: "dashboard", label: "Dashboard", href: siteRoutes.dashboard },
      { id: "findWork", label: "Find work", href: siteRoutes.jobs },
      { id: "proposals", label: "My proposals", href: siteRoutes.myProposals },
      { id: "contracts", label: "Contracts", href: siteRoutes.contracts },
      { id: "wallet", label: "Wallet", href: siteRoutes.wallet },
      { id: "profile", label: "Profile", href: siteRoutes.profile },
    ],
  },
  status: {
    title: "Your status",
    emailUnverified: {
      title: "Verify your email",
      text: "Confirm your email before you post jobs or send proposals.",
      action: "verifyEmail",
    },
    accountSuspended: {
      title: "Account suspended",
      text: "Some marketplace actions are unavailable while this account is suspended. You can review your account details.",
      action: "accountSettings",
    },
    accountDeleted: {
      title: "Account unavailable",
      text: "This account cannot use the marketplace. Contact support if this is unexpected.",
    },
    noProfile: {
      title: "Set up your profile",
      text: "Choose how you want to use GigsHive, then complete a profile to unlock the marketplace.",
    },
    profile: {
      PENDING: {
        title: (label: string) => `${label} received`,
        text: (label: string) => `We have your ${label.toLowerCase()}. It is waiting for review.`,
      },
      SUBMITTED: {
        title: (label: string) => `${label} in review`,
        text: (label: string) =>
          `Your ${label.toLowerCase()} is being reviewed. We will let you know the outcome.`,
      },
      REJECTED: {
        title: (label: string) => `${label} needs changes`,
        text: (label: string) =>
          `Review the notes on your ${label.toLowerCase()} and update it to continue.`,
      },
      SUSPENDED: {
        title: (label: string) => `${label} suspended`,
        text: (label: string) =>
          `Marketplace actions using this ${label.toLowerCase()} are unavailable.`,
      },
    },
    reasonLabel: "Review notes",
    untilLabel: "Suspended until",
  },
  actions: {
    title: "Next actions",
    emptyTitle: "You are up to date",
    emptyText: "There is nothing you need to do right now.",
    items: {
      verifyEmail: {
        label: "Verify email",
        description: "Confirm the address on your account.",
        href: siteRoutes.verifyEmail,
      },
      createClientProfile: {
        label: "Create client profile",
        description: "Tell us what you need done and start hiring.",
        href: siteRoutes.onboarding,
      },
      createWorkerProfile: {
        label: "Create worker profile",
        description: "Add your skills and start finding work.",
        href: siteRoutes.onboarding,
      },
      browseWorkers: {
        label: "Find people",
        description: "Browse verified workers for your job.",
        href: siteRoutes.workers,
      },
      browseJobs: {
        label: "Find work",
        description: "Browse open jobs that match your skills.",
        href: siteRoutes.jobs,
      },
      viewProfile: {
        label: "View profile status",
        description: "Check the review notes and update your profile.",
        href: siteRoutes.profile,
      },
      accountSettings: {
        label: "Account settings",
        description: "Check your sign-in details and profiles.",
        href: siteRoutes.settingsAccount,
      },
    },
  },
  states: {
    loading: "Checking your session",
    errorTitle: "We could not load your dashboard",
    errorText: "Try again. If it keeps happening, sign in again.",
    retryLabel: "Try again",
    forbiddenTitle: "This area is for marketplace accounts",
    forbiddenText: "Staff tools are in the staff console.",
  },
} as const;
