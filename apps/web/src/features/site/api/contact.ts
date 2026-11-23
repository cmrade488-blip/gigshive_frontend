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
 * Typed mock used until the support destination is decided.
 * The form submits to this function through a mutation hook; no endpoint or email
 * address is invented. The company still needs to supply the real support address
 * and the backend team the ticket endpoint (if any).
 */
export async function submitContactMessage(submission: ContactSubmission): Promise<void> {
  // Keep the submission in the mock signature so swapping in a real transport is a one-line change.
  void submission;
}
