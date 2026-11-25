/**
 * FE-013 copy. Every string shown by the auth screens lives here; backend
 * messages and codes are never rendered.
 *
 * Scope note: only fields accepted by `/auth/register` are collected. The
 * design's full-name and goal step were not in the generated contract, so they
 * are intentionally omitted rather than invented (owner decision, FE-013).
 */
export const authCopy = {
  meta: {
    register: {
      title: "Create account",
      description: "Create a GigsHive account to hire people or find work.",
    },
    verifyEmail: {
      title: "Verify email",
      description: "Confirm your email address to finish setting up your account.",
    },
  },

  shell: {
    brand: "GigsHive",
    skipToContent: "Skip to main content",
    homeLabel: "Back to home",
    titleLead: "One account.",
    titleAccent: "Hire and work.",
    subtitle:
      "Use the same login to post jobs and to apply for them. Add a client profile, a worker profile, or both, and switch whenever you like.",
  },

  steps: {
    account: "Account",
    verify: "Verify email",
    current: "Current step",
  },

  register: {
    heading: "Create your free account",
    subtitle: "Enter your email and choose a password. We will confirm the address next.",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "Use at least 8 characters.",
    phoneLabel: "Phone (optional)",
    phoneHint: "Include the country code, for example +2348012345678.",
    submitLabel: "Continue",
    submittingLabel: "Creating account…",
    termsPrefix: "By continuing you agree to the ",
    termsLabel: "Terms",
    termsJoin: " and ",
    privacyLabel: "Privacy policy",
    termsSuffix: ".",
    successTitle: "Check your email",
    successText:
      "We sent a 6-digit code to the address you entered. Enter it to confirm your account.",
    successActionLabel: "Verify email",
  },

  verify: {
    heading: "Check your email",
    intro: "We sent a 6-digit code to your email. Enter it to confirm the address.",
    emailLabel: "Email",
    codeLabel: "Verification code",
    codeHint: "Enter the 6 digits from your email. You can paste the whole code.",
    submitLabel: "Verify and continue",
    submittingLabel: "Verifying…",
    resendLabel: "Send again",
    resendingLabel: "Sending…",
    cooldown: (seconds: number) => `Try again in ${seconds}s`,
    sentTitle: "New code sent",
    sentText: "Check your email for the new code.",
    successTitle: "Email verified",
    successText: "Your email is confirmed. You can continue to GigsHive.",
    successActionLabel: "Continue to GigsHive",
    privacyNote: "Never share your password or a code. We will never ask for them.",
  },

  validation: {
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address.",
    passwordRequired: "Enter a password.",
    passwordTooShort: "Use at least 8 characters.",
    phoneInvalid: "Enter a valid phone number with its country code.",
    codeRequired: "Enter the 6-digit code from your email.",
    codeInvalid: "The code must be 6 digits.",
    generic: "Please check the highlighted fields.",
  },

  errors: {
    email: "Check your email address.",
    password: "Choose a password with at least 8 characters.",
    phone: "Check the phone number and include its country code.",
    code: "That code is not valid. Request a new one if it has expired.",
    rateLimit: "Too many attempts. Wait before trying again.",
    serverWithReference: "Please try again. If it keeps happening, quote the reference to support.",
  },
} as const;
