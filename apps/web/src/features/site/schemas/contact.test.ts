import { describe, expect, it } from "vitest";

import { contactCopy, contactTopics } from "../copy/contact";
import {
  contactLimits,
  emptyContactForm,
  isContactTopic,
  validateContactForm,
  type ContactFormValues,
} from "./contact";

const validation = contactCopy.validation;
const validMessage = "The export button stopped working on Tuesday.";

function form(overrides: Partial<ContactFormValues> = {}): ContactFormValues {
  return {
    ...emptyContactForm,
    name: "Ada Okafor",
    email: "ada@example.com",
    topic: contactTopics[0],
    message: validMessage,
    ...overrides,
  };
}

describe("validateContactForm", () => {
  it("accepts a complete form", () => {
    expect(validateContactForm(form())).toEqual({});
  });

  it("reports every required field", () => {
    expect(validateContactForm(emptyContactForm)).toEqual({
      name: validation.nameRequired,
      email: validation.emailRequired,
      topic: validation.topicRequired,
      message: validation.messageRequired,
    });
  });

  it("rejects malformed email addresses", () => {
    for (const email of ["not-an-email", "ada@", "ada@example", "ada example.com"]) {
      expect(validateContactForm(form({ email })).email).toBe(validation.emailInvalid);
    }
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(validateContactForm(form({ message: "too short" })).message).toBe(
      validation.messageTooShort,
    );
  });

  it("rejects a topic outside the offered list", () => {
    const values = form({ topic: "Not a topic" as ContactFormValues["topic"] });
    expect(validateContactForm(values).topic).toBe(validation.topicRequired);
  });

  it("accepts a name at the 100 character limit and rejects 101", () => {
    expect(
      validateContactForm(form({ name: "a".repeat(contactLimits.name) })).name,
    ).toBeUndefined();

    expect(validateContactForm(form({ name: "a".repeat(contactLimits.name + 1) })).name).toBe(
      validation.nameTooLong,
    );
  });

  it("accepts a message at the 5000 character limit and rejects 5001", () => {
    expect(
      validateContactForm(form({ message: "a".repeat(contactLimits.message) })).message,
    ).toBeUndefined();

    expect(
      validateContactForm(form({ message: "a".repeat(contactLimits.message + 1) })).message,
    ).toBe(validation.messageTooLong);
  });
});

describe("isContactTopic", () => {
  it("matches only the listed topics", () => {
    expect(contactTopics.every(isContactTopic)).toBe(true);
    expect(isContactTopic("Not a topic")).toBe(false);
  });
});
