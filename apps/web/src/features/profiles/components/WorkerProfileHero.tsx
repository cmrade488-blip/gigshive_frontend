import { SiteHeader } from "@/features/site";

/** Dark hex band behind the worker profile card. */
export function WorkerProfileHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[48px] bg-ink-900 pb-[150px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] -right-[140px] h-[640px] w-[640px] bg-[radial-gradient(circle,rgba(245,160,0,0.38),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
      </div>
    </section>
  );
}
