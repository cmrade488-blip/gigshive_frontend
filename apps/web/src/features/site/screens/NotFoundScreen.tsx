import Link from "next/link";

import { SystemPage, systemPrimaryClass, systemSecondaryClass } from "../components/SystemPage";
import { notFoundCopy as copy } from "../copy/system";
import { siteRoutes } from "../routes";

export function NotFoundScreen() {
  return (
    <SystemPage
      code={copy.code}
      title={copy.title}
      description={copy.description}
      image={copy.image}
    >
      <Link href={siteRoutes.home} className={systemPrimaryClass}>
        {copy.homeLabel}
      </Link>
      <Link href={siteRoutes.jobs} className={systemSecondaryClass}>
        {copy.jobsLabel}
      </Link>
      <Link href={siteRoutes.howItWorks} className={systemSecondaryClass}>
        {copy.howItWorksLabel}
      </Link>
    </SystemPage>
  );
}
