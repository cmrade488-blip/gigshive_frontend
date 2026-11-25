import { describe, expect, it, vi } from "vitest";

import { observability, reportError } from "./observability";

describe("web observability hook", () => {
  it("passes the server-issued support reference to the reporter", () => {
    const captureError = vi
      .spyOn(observability, "captureError")
      .mockImplementation(() => undefined);
    const error = new Error("Payment failed");

    reportError(error, "digest_abc123");

    expect(captureError).toHaveBeenCalledWith({
      error,
      context: { supportReference: "digest_abc123" },
    });
    captureError.mockRestore();
  });

  it("omits context when there is no reference", () => {
    const captureError = vi
      .spyOn(observability, "captureError")
      .mockImplementation(() => undefined);
    const error = new Error("Payment failed");

    reportError(error);

    expect(captureError).toHaveBeenCalledWith({ error });
    captureError.mockRestore();
  });
});
