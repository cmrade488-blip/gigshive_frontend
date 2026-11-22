import { describe, expect, it } from "vitest";
import {
  formatMoney,
  parseMoney,
  kobo,
  nairaToKobo,
  koboToNaira,
} from "./money";

describe("kobo()", () => {
  it("accepts integers", () => {
    expect(kobo(0)).toBe(0);
    expect(kobo(150050)).toBe(150050);
    expect(kobo(-100)).toBe(-100);
  });

  it("rejects non-integers", () => {
    expect(() => kobo(1.5)).toThrow(/integer/);
  });
});

describe("formatMoney()", () => {
  it("formats kobo as naira with symbol", () => {
    const out = formatMoney(150050);
    // en-NG typically yields ₦1,500.50 or similar
    expect(out).toMatch(/1,500\.50/);
    expect(out).toMatch(/₦|NGN/);
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toMatch(/0\.00/);
  });

  it("formats without currency when requested", () => {
    const out = formatMoney(999, { currency: false });
    expect(out).toMatch(/9\.99/);
    expect(out).not.toMatch(/₦|NGN/);
  });

  it("rejects non-integer kobo", () => {
    expect(() => formatMoney(1.5)).toThrow(/integer/);
  });

  it("handles large amounts", () => {
    // 1_000_000 naira = 100_000_000 kobo
    const out = formatMoney(100_000_000);
    expect(out).toMatch(/1,000,000\.00/);
  });
});

describe("parseMoney()", () => {
  it("parses plain naira", () => {
    expect(parseMoney("1500")).toEqual({ ok: true, kobo: 150000 });
  });

  it("parses with decimals", () => {
    expect(parseMoney("1500.50")).toEqual({ ok: true, kobo: 150050 });
    expect(parseMoney("1500.5")).toEqual({ ok: true, kobo: 150050 });
    expect(parseMoney("0.01")).toEqual({ ok: true, kobo: 1 });
  });

  it("strips symbol and commas", () => {
    expect(parseMoney("₦1,500.50")).toEqual({ ok: true, kobo: 150050 });
    expect(parseMoney("NGN 1,500.50")).toEqual({ ok: true, kobo: 150050 });
  });

  it("rejects empty", () => {
    expect(parseMoney("")).toEqual({ ok: false, error: "Amount is required" });
    expect(parseMoney("   ")).toEqual({ ok: false, error: "Amount is required" });
  });

  it("rejects more than two decimals", () => {
    expect(parseMoney("1.234")).toEqual({
      ok: false,
      error: "Use at most two decimal places",
    });
  });

  it("rejects negative by default", () => {
    expect(parseMoney("-10")).toEqual({
      ok: false,
      error: "Amount cannot be negative",
    });
  });

  it("allows negative when opted in", () => {
    expect(parseMoney("-10.50", { allowNegative: true })).toEqual({
      ok: true,
      kobo: -1050,
    });
  });

  it("rejects garbage", () => {
    expect(parseMoney("abc")).toEqual({ ok: false, error: "Enter a valid amount" });
    expect(parseMoney("12.34.56")).toEqual({
      ok: false,
      error: "Enter a valid amount",
    });
  });
});

describe("nairaToKobo / koboToNaira", () => {
  it("round-trips exact values", () => {
    expect(nairaToKobo(15.5)).toBe(1550);
    expect(koboToNaira(1550)).toBe(15.5);
  });

  it("rounds half-up", () => {
    // 0.005 naira → 0.5 kobo → rounds to 1 kobo
    expect(nairaToKobo(0.005)).toBe(1);
  });
});
