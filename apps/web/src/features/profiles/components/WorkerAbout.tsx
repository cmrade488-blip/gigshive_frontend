import { workerProfileCopy as copy } from "../copy/worker-profile";

/** Public bio from the typed sample; no private profile fields. */
export function WorkerAbout({ bio }: { bio: readonly string[] }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:p-9">
      <h2 className="m-0 mb-3.5 text-[22px] font-semibold">{copy.aboutTitle}</h2>
      {bio.map((paragraph) => (
        <p key={paragraph} className="mb-3 last:mb-0 text-[17px] text-ink-700">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
