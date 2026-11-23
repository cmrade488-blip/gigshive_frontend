export interface AboutBelief {
  title: string;
  text: string;
}

export const aboutCopy = {
  metaTitle: "About us",
  metaDescription: "GigsHive is a marketplace where good work meets fair payment.",

  heroTitle: "Hire. Work. Get paid.",
  heroSubtitle: "GigsHive is a marketplace where good work meets fair payment.",

  whyHeading: "Why GigsHive exists",
  whyText1:
    "Hiring someone you have not met is a risk, and so is working before you are paid. GigsHive puts both on the same side: payment is held until the work is approved, and people confirm who they are.",
  whyText2:
    "One account lets you hire when you need help and offer your skills when you have time.",

  beliefsHeading: "What we believe",
  beliefs: [
    {
      title: "Fair for both sides",
      text: "Clients know what they pay. Workers know they will be paid for approved work.",
    },
    {
      title: "Clear and honest",
      text: "We show amounts, fees and status plainly. No hidden steps.",
    },
    {
      title: "Skills over connections",
      text: "Good work should be found by the quality of the work, wherever the worker is.",
    },
  ] satisfies readonly AboutBelief[],

  ctaTitle: "Join GigsHive",
  ctaText: "Hire people or find work with one free account.",
  ctaLabel: "Create an account",
} as const;
