import { SiteFooter, siteCopy } from "@/features/site";
import { notFound } from "next/navigation";

import { getJobById } from "../api/jobs";
import { JobAbout } from "../components/JobAbout";
import { JobApplyCard } from "../components/JobApplyCard";
import { JobClientCard } from "../components/JobClientCard";
import { JobDetailHero } from "../components/JobDetailHero";
import { JobEscrowNote } from "../components/JobEscrowNote";
import { JobQuestions } from "../components/JobQuestions";
import { OwnerJobNotice } from "../components/OwnerJobNotice";

export interface JobDetailScreenProps {
  id: string;
  /** FE-008/FE-031 will derive this from the session; static pages default to public. */
  isOwner?: boolean;
}

/** Job detail from the design, with the documented read-only owner variant. */
export function JobDetailScreen({ id, isOwner = false }: JobDetailScreenProps) {
  const job = getJobById(id);
  if (job === null) {
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
      <JobDetailHero job={job} />
      <main id="main-content" className="px-5 pb-24 sm:px-10">
        <div className="relative mx-auto -mt-16 flex max-w-[1200px] flex-wrap items-start gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <JobAbout job={job} />
            <JobQuestions job={job} />
          </div>
          <aside className="flex w-full flex-col gap-5 sm:w-[360px] sm:max-w-full">
            {isOwner ? (
              <OwnerJobNotice job={job} />
            ) : (
              <>
                <JobApplyCard job={job} />
                <JobClientCard job={job} />
                <JobEscrowNote />
              </>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
