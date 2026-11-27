import { EmptyState } from "@gigshive/ui";

import { consoleCopy } from "../copy/console";

/** FE-018 overview. Real aggregates arrive with FE-057; no sample metrics. */
export function ConsoleDashboardScreen() {
  return (
    <section aria-label={consoleCopy.overview.title}>
      <EmptyState
        title={consoleCopy.overview.emptyTitle}
        description={consoleCopy.overview.emptyDescription}
      />
    </section>
  );
}
