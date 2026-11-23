import Link from "next/link";

import { SystemPage, systemPrimaryClass, systemSecondaryClass } from "../components/SystemPage";
import { accessDeniedCopy as copy } from "../copy/system";
import { siteRoutes } from "../routes";

export function AccessDeniedScreen() {
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
      <Link href={siteRoutes.dashboard} className={systemSecondaryClass}>
        {copy.switchProfileLabel}
      </Link>
      <Link href={siteRoutes.login} className={systemSecondaryClass}>
        {copy.signInAgainLabel}
      </Link>
    </SystemPage>
  );
}
