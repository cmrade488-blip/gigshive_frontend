import type { Metadata } from "next";

import { AccountSettingsScreen, authCopy } from "@/features/auth";
import { SiteHeader } from "@/features/site";

export const metadata: Metadata = {
  title: authCopy.meta.settingsAccount.title,
  description: authCopy.meta.settingsAccount.description,
};

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-gh-surface-sunken font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {authCopy.shell.skipToContent}
      </a>
      <SiteHeader />
      <AccountSettingsScreen />
    </div>
  );
}
