import type { ContactTopic } from "../copy/contact";

export interface ContactSubmission {
  name: string;
  email: string;
  topic: ContactTopic;
  /** Reference code from an error screen, when supplied by the user. */
  reference?: string;
  message: string;
}

/**
 * A2 interim: the support destination is still an owner decision, so the mock
 * must never silently discard a production message. The form is hidden and
 * this transport refuses to run in production builds.
 */
export function isContactSubmissionAvailable(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Never rendered: the UI shows copy from `copy/contact.ts` instead. */
export class ContactUnavailableError extends Error {
  constructor() {
    super("Contact form is not available yet");
    this.name = "ContactUnavailableError";
  }
}

/**
 * Typed development-only mock. The form submits to this function through a
 * mutation hook; no endpoint or email address is invented. The company still
 * needs to supply the real support address and the backend team the ticket
 * endpoint (if any).
 */
export async function submitContactMessage(submission: ContactSubmission): Promise<void> {
  if (!isContactSubmissionAvailable()) {
    throw new ContactUnavailableError();
  }
  // Keep the submission in the mock signature so swapping in a real transport is a one-line change.
  void submission;
}
