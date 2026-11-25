import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import { emptyRegisterForm, validateRegisterForm } from "./register";

describe("validateRegisterForm", () => {
  it("accepts the required API fields and omits an empty phone", () => {
    const result = validateRegisterForm({
      email: "  person@example.com  ",
      password: "long-enough",
      phone: "  ",
    });

    expect(result).toEqual({
      ok: true,
      value: { email: "person@example.com", password: "long-enough" },
    });
  });

  it("accepts an E.164 phone number", () => {
    const result = validateRegisterForm({
      email: "person@example.com",
      password: "long-enough",
      phone: "+2348012345678",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.phone).toBe("+2348012345678");
    }
  });

  it("reports every invalid field at once", () => {
    const result = validateRegisterForm({
      email: "not-an-email",
      password: "short",
      phone: "08012345678",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        email: authCopy.validation.emailInvalid,
        password: authCopy.validation.passwordTooShort,
        phone: authCopy.validation.phoneInvalid,
      });
    }
  });

  it("reports missing email and password separately", () => {
    const result = validateRegisterForm(emptyRegisterForm);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBe(authCopy.validation.emailRequired);
      expect(result.errors.password).toBe(authCopy.validation.passwordRequired);
      expect(result.errors.phone).toBeUndefined();
    }
  });

  it("does not trim the password", () => {
    const result = validateRegisterForm({
      email: "person@example.com",
      password: "  long-enough  ",
      phone: "",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.password).toBe("  long-enough  ");
    }
  });
});
