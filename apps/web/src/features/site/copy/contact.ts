export const contactTopics = [
  "A payment or contract",
  "My account or verification",
  "Report a problem",
  "Something else",
] as const;

export type ContactTopic = (typeof contactTopics)[number];

export const contactCopy = {
  metaTitle: "Contact",
  metaDescription: "Tell us what happened and we will get back to you.",

  heroTitle: "Talk to us",
  heroSubtitle: "Tell us what happened and we will get back to you.",

  formHeading: "Send us a message",
  nameLabel: "Your name",
  emailLabel: "Email",
  topicLabel: "Topic",
  referenceLabel: "Reference code (optional)",
  messageLabel: "Message",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  anotherLabel: "Send another message",

  successTitle: "Message sent",
  successText: "Thanks for getting in touch. We will get back to you by email.",
  demoSuccessTitle: "Demo submitted",
  demoSuccessText: "Demo only, nothing was sent.",
  unavailableTitle: "Contact form is not available yet",
  unavailableText:
    "We cannot receive messages here yet. The Help centre has answers to common questions.",
  errorTitle: "We could not send your message",
  errorText: "Please try again in a moment.",

  emailHeading: "Email",
  emailAddress: "support@[your-domain]",
  beforeHeading: "Before you write",
  beforeText: "Many answers are in the Help centre",
  beforeLinkLabel: "Help centre",
  beforeTextTail: ". If you saw an error, include its reference code.",
  safetyNote: "Never share your password or a code. We will never ask for them.",

  validation: {
    nameRequired: "Enter your name.",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address.",
    topicRequired: "Choose a topic.",
    messageRequired: "Tell us what happened.",
    messageTooShort: "Write at least 10 characters.",
    nameTooLong: "Your name must be 100 characters or fewer.",
    messageTooLong: "Your message must be 5,000 characters or fewer.",
  },
} as const;
