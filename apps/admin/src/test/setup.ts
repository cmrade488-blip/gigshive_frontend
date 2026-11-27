import "@testing-library/jest-dom/vitest";
import "@testing-library/react";

import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { vi } from "vitest";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

// Next's Link starts router/prefetch work in jsdom, which produces act warnings
// unrelated to these render tests. The markup under test is still a plain link.
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: LinkProps) =>
    createElement("a", { href, ...props }, children),
}));
