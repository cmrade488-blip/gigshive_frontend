import Link from "next/link";

import { ReloadButton } from "../components/ReloadButton";
import { SystemPage, systemPrimaryClass, systemSecondaryClass } from "../components/SystemPage";
import { maintenanceCopy as copy } from "../copy/system";
import { siteRoutes } from "../routes";

export function MaintenanceScreen() {
  return (
    <SystemPage
      code={copy.code}
      title={copy.title}
      description={copy.description}
      image={copy.image}
    >
      <ReloadButton label={copy.retryLabel} className={systemPrimaryClass} />
      <Link href={siteRoutes.contact} className={systemSecondaryClass}>
        {copy.contactLabel}
      </Link>
    </SystemPage>
  );
}
