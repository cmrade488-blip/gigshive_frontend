import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogoutButton } from "./LogoutButton";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("../api/auth", () => ({
  logoutStaff: mocks.logout,
}));

function renderButton() {
  const queryClient = new QueryClient();
  const clear = vi.spyOn(queryClient, "clear");
  const setQueryData = vi.spyOn(queryClient, "setQueryData");
  render(
    <QueryClientProvider client={queryClient}>
      <LogoutButton />
    </QueryClientProvider>,
  );
  return { clear, setQueryData };
}

describe("LogoutButton", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.logout.mockReset();
  });

  it("revokes the server session, clears the cache and returns to sign-in", async () => {
    const user = userEvent.setup();
    mocks.logout.mockResolvedValue(undefined);
    const { clear, setQueryData } = renderButton();

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(setQueryData).toHaveBeenCalledWith(["admin", "session"], null);
    expect(clear).toHaveBeenCalledOnce();
  });

  it("still clears the console when revocation fails", async () => {
    const user = userEvent.setup();
    mocks.logout.mockRejectedValue(new Error("offline"));
    renderButton();

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Your local session was cleared. Sign in again to continue.",
    );
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
