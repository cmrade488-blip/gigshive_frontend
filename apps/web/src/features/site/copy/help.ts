export interface HelpFaq {
  category: string;
  question: string;
  answer: string;
}

export const helpCopy = {
  metaTitle: "Help centre",
  metaDescription:
    "Answers to common questions about hiring, working and getting paid on GigsHive.",

  heroTitle: "How can we help?",
  heroSubtitle: "Answers to common questions about hiring, working and getting paid.",

  searchLabel: "Search help",
  searchPlaceholder: "Search help",
  searchButton: "Search",
  categoryLabel: "Help topics",
  allCategoriesLabel: "All topics",
  emptyLabel: "No matching answers. Try a different word or send us a message.",

  categories: [
    "Getting started",
    "Hiring",
    "Working",
    "Payments",
    "Account",
  ] satisfies readonly string[],

  faqs: [
    {
      category: "Getting started",
      question: "How do I create an account?",
      answer:
        "Choose Create account, enter your name, email and password, then confirm your email with the code we send. You pick whether to hire or find work first. You can add the other profile later.",
    },
    {
      category: "Getting started",
      question: "Can I hire and work with one account?",
      answer:
        "Yes. One login can have a client profile and a worker profile. Switch between them from the sidebar.",
    },
    {
      category: "Hiring",
      question: "What is the difference between a priced bid and an application?",
      answer:
        "With a priced bid, workers send their own price. With an application, workers apply and you agree the price when you accept.",
    },
    {
      category: "Hiring",
      question: "When do I pay?",
      answer:
        "After you accept a proposal, a contract is created and you fund it. The money is held until you approve the work.",
    },
    {
      category: "Working",
      question: "Why do I need to verify my identity?",
      answer:
        "It protects clients and you. You need a verified profile before you can send proposals.",
    },
    {
      category: "Working",
      question: "How do I get paid?",
      answer:
        "When the client approves your work, the payment goes to your wallet. You can then withdraw to your bank account.",
    },
    {
      category: "Payments",
      question: "Is my money safe while the work is done?",
      answer:
        "Funds are held by GigsHive until the client approves. See the Safety page for how it works.",
    },
    {
      category: "Account",
      question: "I forgot my password",
      answer:
        "Choose Forgot password on the sign in page. We will email you a link to set a new one.",
    },
  ] satisfies readonly HelpFaq[],

  stillStuckTitle: "Still stuck?",
  stillStuckText: "Send us a message and include the reference code if you saw one.",
  stillStuckLabel: "Contact us",

  safetyFeeTitle: "Safety and fees",
  safetyFeeText: "Read how payment works and what it costs.",
  safetyLabel: "How payment works",
  feesLabel: "See the fees",
} as const;
