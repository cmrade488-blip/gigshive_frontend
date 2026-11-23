import { SiteFooter, siteCopy } from "@/features/site";
import { notFound } from "next/navigation";

import { getWorkerById } from "../api/workers";
import { WorkerAbout } from "../components/WorkerAbout";
import { WorkerPortfolio } from "../components/WorkerPortfolio";
import { WorkerProfileCard } from "../components/WorkerProfileCard";
import { WorkerProfileHero } from "../components/WorkerProfileHero";
import { WorkerSkills } from "../components/WorkerSkills";
import { WorkerVerification } from "../components/WorkerVerification";

/** Public worker profile: only fields safe for public display. */
export function WorkerProfileScreen({ id }: { id: string }) {
  const worker = getWorkerById(id);
  if (worker === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <WorkerProfileHero />
      <main id="main-content" className="px-5 pb-24 sm:px-10">
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-6">
          <div className="-mt-[110px]">
            <WorkerProfileCard worker={worker} />
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <WorkerAbout bio={worker.bio} />
              <WorkerPortfolio items={worker.portfolio} />
            </div>
            <aside className="flex w-full flex-col gap-5 sm:w-[340px] sm:max-w-full">
              <WorkerSkills skills={worker.skills} />
              <WorkerVerification
                identityVerified={worker.identityVerified}
                emailVerified={worker.emailVerified}
              />
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
