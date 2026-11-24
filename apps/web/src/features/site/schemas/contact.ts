import { contactCopy, contactTopics, type ContactTopic } from "../copy/contact";

export interface ContactFormValues {
  name: string;
  email: string;
  topic: ContactTopic | "";
  reference: string;
  message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

/** Input ceilings from review fix A2; shared by validation and the fields. */
export const contactLimits = {
  name: 100,
  message: 5000,
} as const;

export const emptyContactForm: ContactFormValues = {
  name: "",
  email: "",
  topic: "",
  reference: "",
  message: "",
};

/** Narrows the select value before it is passed to the typed mock. */
export function isContactTopic(value: string): value is ContactTopic {
  return (contactTopics as readonly string[]).includes(value);
}

/**
 * Local validation for the contact form. React Hook Form and Zod are part of the
 * accepted stack (ADR 0001) but are not installed yet, and adding dependencies
 * needs owner approval. This pure function is the seam to replace when FE-012 lands.
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = contactCopy.validation.nameRequired;
  } else if (values.name.trim().length > contactLimits.name) {
    errors.name = contactCopy.validation.nameTooLong;
  }

  if (!values.email.trim()) {
    errors.email = contactCopy.validation.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = contactCopy.validation.emailInvalid;
  }

  if (!isContactTopic(values.topic)) {
    errors.topic = contactCopy.validation.topicRequired;
  }

  if (!values.message.trim()) {
    errors.message = contactCopy.validation.messageRequired;
  } else if (values.message.trim().length < 10) {
    errors.message = contactCopy.validation.messageTooShort;
  } else if (values.message.trim().length > contactLimits.message) {
    errors.message = contactCopy.validation.messageTooLong;
  }

  return errors;
}
