export interface LegalSection {
  heading: string;
  body: string;
}

export type LegalDocument = "terms" | "privacy";

const placeholderBody =
  "[Legal text supplied by GigsHive and its legal adviser goes here. The frontend renders it as headings and paragraphs from content files.]";

const sectionHeadings = [
  "1. Using GigsHive",
  "2. Your account",
  "3. Jobs, proposals and contracts",
  "4. Payments and fees",
  "5. Content and conduct",
  "6. Ending your account",
  "7. Changes to these terms",
  "8. Contact",
] as const;

const sections: readonly LegalSection[] = sectionHeadings.map((heading) => ({
  heading,
  body: placeholderBody,
}));

export const legalCopy = {
  eyebrow: "Legal",
  heroTitle: "Terms and Privacy",
  heroSubtitle: "One reading page for both documents. The text is supplied by the company.",
  tabsLabel: "Legal documents",
  lastUpdated: "Last updated [date]",
  placeholderNote:
    "The legal text below is a placeholder. The company and its legal adviser supply the final wording before launch.",
  documents: {
    terms: {
      metaTitle: "Terms",
      metaDescription: "The terms that apply when you use GigsHive.",
      tabLabel: "Terms",
      title: "Terms",
      sections,
    },
    privacy: {
      metaTitle: "Privacy",
      metaDescription: "How GigsHive handles information about you.",
      tabLabel: "Privacy",
      title: "Privacy",
      sections,
    },
  },
} as const;
