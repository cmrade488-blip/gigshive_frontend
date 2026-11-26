import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import { emptyLoginForm, validateLoginForm } from "./login";

describe("validateLoginForm", () => {
  it("trims the email and accepts an existing short password", () => {
    const result = validateLoginForm({ email: "  person@example.com  ", password: "short" });

    expect(result).toEqual({
      ok: true,
      value: { email: "person@example.com", password: "short" },
    });
  });

  it("requires both fields", () => {
    const result = validateLoginForm(emptyLoginForm);

    expect(result).toEqual({
      ok: false,
      errors: {
        email: authCopy.validation.emailRequired,
        password: authCopy.validation.passwordRequired,
      },
    });
  });

  it("rejects a malformed email without applying registration password rules", () => {
    const result = validateLoginForm({ email: "not-an-email", password: "short" });

    expect(result).toEqual({
      ok: false,
      errors: { email: authCopy.validation.emailInvalid },
    });
  });
});
