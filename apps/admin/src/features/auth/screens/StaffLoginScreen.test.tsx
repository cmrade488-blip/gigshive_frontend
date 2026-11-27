import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeStaffSessionUser } from "@gigshive/testing";
import { axe } from "jest-axe";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { StaffLoginProvider, useStaffLogin } from "../state/staff-login";
import { StaffLoginScreen } from "./StaffLoginScreen";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: "",
  login: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("../api/auth", () => ({
  loginStaff: mocks.login,
  verifyStaffOtp: mocks.verify,
}));

function error(
  status: number,
  retryAfterSeconds: number | null = null,
): ReturnType<typeof makeTestApiError> {
  return makeTestApiError({
    status,
    code: "BACKEND_CODE",
    message: "raw backend message",
    details: null,
    requestId: "req_1",
    retryAfterSeconds,
  });
}

function SeedPendingLogin({ email }: { email: string }) {
  const { beginLogin } = useStaffLogin();
  useEffect(() => {
    beginLogin(email);
  }, [beginLogin, email]);
  return null;
}

function renderScreen(step: "password" | "otp", seedEmail?: string) {
  const queryClient = new QueryClient();
  const setQueryData = vi.spyOn(queryClient, "setQueryData");
  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <StaffLoginProviderWrapper>
        {seedEmail ? <SeedPendingLogin email={seedEmail} /> : null}
        <StaffLoginScreen step={step} />
      </StaffLoginProviderWrapper>
    </QueryClientProvider>,
  );
  return { container: rendered.container, setQueryData };
}

function StaffLoginProviderWrapper({ children }: { children: React.ReactNode }) {
  return <StaffLoginProvider>{children}</StaffLoginProvider>;
}

describe("StaffLoginScreen", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.replace.mockReset();
    mocks.login.mockReset();
    mocks.verify.mockReset();
    mocks.searchParams = "";
  });

  it("shows the password step with accessible labels and no axe violations", async () => {
    const { container } = renderScreen("password");

    expect(screen.getByLabelText(/Work email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates empty credentials before calling the API", async () => {
    const user = userEvent.setup();
    renderScreen("password");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Enter a valid work email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("moves to the OTP step after a successful password check", async () => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValue({ otpRequired: true });
    renderScreen("password");

    await user.type(screen.getByLabelText(/Work email/), "ada@example.com");
    await user.type(screen.getByLabelText(/Password/), "secret");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(mocks.login).toHaveBeenCalledWith({ email: "ada@example.com", password: "secret" }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/login/otp");
  });

  it("shows fixed sign-in copy for a 401 and never renders the backend message", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(error(401));
    renderScreen("password");

    await user.type(screen.getByLabelText(/Work email/), "ada@example.com");
    await user.type(screen.getByLabelText(/Password/), "wrong");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("We could not sign you in")).toBeInTheDocument();
    expect(screen.queryByText("raw backend message")).not.toBeInTheDocument();
  });

  it("blocks another attempt during a 429 cooldown", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(error(429, 30));
    renderScreen("password");

    await user.type(screen.getByLabelText(/Work email/), "ada@example.com");
    await user.type(screen.getByLabelText(/Password/), "secret");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled());
  });

  it("redirects the OTP step when no password step is pending", async () => {
    renderScreen("otp");
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });

  it("verifies the code, seeds the session and honours a validated next", async () => {
    const user = userEvent.setup();
    mocks.searchParams = "?next=%2Fprofiles";
    const session = makeStaffSessionUser();
    mocks.verify.mockResolvedValue(session);
    const { setQueryData } = renderScreen("otp", "ada@example.com");

    await user.type(screen.getByLabelText(/6-digit code/), "12a3456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith({ otp: "123456" }));
    expect(setQueryData).toHaveBeenCalledWith(["admin", "session"], session);
    expect(mocks.replace).toHaveBeenCalledWith("/profiles");
  });
});
