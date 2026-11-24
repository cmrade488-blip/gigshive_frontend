import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContactSubmission } from "./contact";

const submission: ContactSubmission = {
  name: "Ada Okafor",
  email: "ada@example.com",
  topic: "Report a problem",
  message: "The export button stopped working on Tuesday.",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("submitContactMessage", () => {
  it("runs the mock in development without sending anything", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { isContactSubmissionAvailable, submitContactMessage } = await import("./contact");

    expect(isContactSubmissionAvailable()).toBe(true);
    await expect(submitContactMessage(submission)).resolves.toBeUndefined();
  });

  it("refuses to submit in production so no message is silently discarded", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { ContactUnavailableError, isContactSubmissionAvailable, submitContactMessage } =
      await import("./contact");

    expect(isContactSubmissionAvailable()).toBe(false);
    await expect(submitContactMessage(submission)).rejects.toBeInstanceOf(ContactUnavailableError);
  });
});
