import { createApiClient } from "@gigshive/api-client";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { type Job, type Profile } from "./fixtures";
import { resetHandlers } from "./handlers";
import { server } from "./server";

// Node's fetch needs an absolute URL; MSW matches the wildcard patterns regardless.
const api = createApiClient({ baseUrl: "https://api.example.test/api/v1" });

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  resetHandlers();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("mock handlers", () => {
  it("serves the public worker list and detail through the api client", async () => {
    const list = await api.getCollection<Profile>("/workers");
    expect(list.data.length).toBeGreaterThan(0);
    expect(list.meta).toEqual({ next_cursor: "end", per_page: 20 });

    const detail = await api.get<Profile>(`/workers/${list.data[0]?.id}`);
    expect(detail.data.id).toBe(list.data[0]?.id);
  });

  it("supports search, filtering and empty cursor pages", async () => {
    const search = await api.getCollection<Profile>("/workers", { query: { q: "wordpress" } });
    expect(search.data).toHaveLength(1);

    const filtered = await api.getCollection<Profile>("/workers", {
      query: { category: "development" },
    });
    expect(filtered.data).toHaveLength(1);

    const empty = await api.getCollection<Profile>("/workers", { query: { cursor: "end" } });
    expect(empty.data).toEqual([]);
  });

  it("serves jobs, catalog and wallet envelopes", async () => {
    const jobs = await api.getCollection<Job>("/jobs");
    expect(jobs.data[0]?.status).toBe("OPEN");

    const categories = await api.get<unknown[]>("/categories");
    expect(categories.data.length).toBeGreaterThan(0);

    const wallet = await api.get<{ balance: { amount_kobo: number } }>("/wallet");
    expect(Number.isInteger(wallet.data.balance.amount_kobo)).toBe(true);
  });

  it("maps forced error and forbidden scenarios to ApiError", async () => {
    await expect(api.get("/workers", { query: { mock_scenario: "error" } })).rejects.toMatchObject({
      status: 500,
      kind: "server",
    });
    await expect(api.get("/jobs", { query: { mock_scenario: "forbidden" } })).rejects.toMatchObject(
      { status: 403, kind: "forbidden" },
    );
  });

  it("resets generated ids between tests", async () => {
    const first = await api.get<Profile>("/me");
    expect(first.data.id).toBe("user_0000000000000001");
  });

  it("serves the generated signed-url shape and test file bytes", async () => {
    const signed = await api.get<{ url: string; expires_at: string }>("/media/media_1/signed-url");
    const url = signed.data.url;
    expect(url).toBe("/mock/private/file.png");
    expect(signed.data.expires_at).toBe("2030-01-01T00:00:00.000Z");
    expect(signed.data).not.toHaveProperty("expires_in");

    if (!url) {
      throw new Error("signed URL was not returned");
    }
    const file = await fetch(new URL(url, "https://api.example.test"));
    expect(file.headers.get("content-type")).toBe("image/png");
  });

  it("maps media not-found scenarios to ApiError", async () => {
    await expect(
      api.get("/media/media_1/signed-url", { query: { mock_scenario: "notFound" } }),
    ).rejects.toMatchObject({ status: 404, kind: "notFound" });
  });

  it("serves staff and console projections with page meta", async () => {
    const staff = await api.get<{ account_type: string }>("/staff-proxy/me");
    expect(staff.data.account_type).toBe("STAFF");

    // Console responses carry PageMeta, exercised directly because the
    // browser client unwraps cursor collections by default.
    const response = await fetch("https://api.example.test/api/v1/admin/profiles");
    const body = (await response.json()) as { meta: { current_page: number; total: number } };
    expect(body.meta).toEqual({ current_page: 1, per_page: 20, total: 1 });
  });
});
