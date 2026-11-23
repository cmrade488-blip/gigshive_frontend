import Link from "next/link";

export interface InfoCtaProps {
  title: string;
  text: string;
  label: string;
  href: string;
}

/** Shared closing call-to-action band for the public info pages. */
export function InfoCta({ title, text, label, href }: InfoCtaProps) {
  return (
    <section className="px-6 pb-24 sm:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-7 rounded-[40px] bg-honey-50 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
        <div>
          <h2 className="mb-2 font-display text-[30px] font-bold tracking-[-0.5px]">{title}</h2>
          <p className="max-w-[620px] text-base text-ink-600">{text}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 flex-none items-center rounded-full bg-honey-500 px-7 font-semibold text-ink-900 hover:bg-honey-400 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
