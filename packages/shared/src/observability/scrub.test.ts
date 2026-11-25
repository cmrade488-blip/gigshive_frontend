import { describe, expect, it } from "vitest";

import { REDACTED, scrubForLog, scrubString, scrubValue } from "./scrub";

const ULID = "01J8ZQ3Z8ZQ3Z8ZQ3Z8ZQ3Z8ZQ";

describe("scrubString", () => {
  it.each([
    ["ada@example.com", REDACTED],
    ["08012345678", REDACTED],
    ["₦1,500.50", REDACTED],
    ["https://cdn.example.com/doc?signature=abc123&expires=456", REDACTED],
    ["file:///C:/Users/ICT/app/dist/index.js:39:7", REDACTED],
    ["Bearer abcdefghijklmnop", REDACTED],
    ["01a8b3c4-abcd-4abc-8abc-abcdefabcdef", "[id]"],
    [ULID, "[id]"],
  ])("redacts %s", (input, redaction) => {
    expect(scrubString(input)).toBe(redaction);
  });

  it("keeps ordinary app copy unchanged", () => {
    expect(scrubString("Please check the highlighted fields.")).toBe(
      "Please check the highlighted fields.",
    );
  });
});

describe("scrubValue", () => {
  it("redacts sensitive keys at every depth", () => {
    const input = {
      surface: "web",
      context: {
        email: "ada@example.com",
        nested: [
          {
            otp_code: "123456",
            bankAccountNumber: "0123456789",
            identity_number: "12345678901",
            password: "correct horse",
            amountKobo: 150050,
            bank_name: "Example Bank",
          },
        ],
      },
    };

    const result = scrubValue(input) as {
      surface: string;
      context: { email: string; nested: Array<Record<string, unknown>> };
    };

    expect(result.surface).toBe("web");
    expect(result.context.email).toBe(REDACTED);
    for (const value of Object.values(result.context.nested[0] ?? {})) {
      expect(value).toBe(REDACTED);
    }
  });

  it("preserves validated request references and fixed metadata", () => {
    const result = scrubValue({
      requestId: ULID,
      supportReference: "digest_abc123",
      route: "/workers/:id",
      release: "v2026.11.25",
      deviceClass: "mobile",
      level: "error",
      status: 500,
    });

    expect(result).toEqual({
      requestId: ULID,
      supportReference: "digest_abc123",
      route: "/workers/:id",
      release: "v2026.11.25",
      deviceClass: "mobile",
      level: "error",
      status: 500,
    });
  });

  it("redacts invalid references rather than echoing arbitrary text", () => {
    expect(scrubValue({ supportReference: "call ada@example.com" })).toEqual({
      supportReference: REDACTED,
    });
  });

  it("handles cycles without throwing", () => {
    const input: Record<string, unknown> = { name: "node" };
    input["self"] = input;

    expect(scrubValue(input)).toEqual({ name: "node", self: REDACTED });
  });

  it("scrubs strings inside arrays and caps large arrays", () => {
    const input = Array.from({ length: 120 }, (_, index) =>
      index === 5 ? "ada@example.com" : `item-${index}`,
    );

    const result = scrubValue(input) as string[];
    expect(result).toHaveLength(100);
    expect(result[5]).toBe(REDACTED);
  });
});

describe("scrubForLog", () => {
  it("uses the same rules as event scrubbing", () => {
    expect(scrubForLog({ otp: "123456", route: "/jobs" })).toEqual({
      otp: REDACTED,
      route: "/jobs",
    });
  });
});
