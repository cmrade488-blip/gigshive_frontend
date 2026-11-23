import Image from "next/image";

import type { WorkerPortfolioItem } from "../api/workers";
import { workerProfileCopy as copy } from "../copy/worker-profile";

/** Public portfolio media only; no signed URLs are stored or rendered. */
export function WorkerPortfolio({ items }: { items: readonly WorkerPortfolioItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:p-9">
      <h2 className="m-0 mb-5 text-[22px] font-semibold">{copy.portfolioTitle}</h2>
      <ul className="m-0 grid grid-cols-1 gap-[18px] p-0 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-[20px] border border-ink-100 bg-white shadow-[0_4px_12px_rgba(15,22,38,0.06)]"
          >
            <Image
              src={item.image}
              width={360}
              height={220}
              alt={item.title}
              className="h-auto w-full"
            />
            <div className="px-[18px] py-3.5">
              <b className="text-[15px] font-semibold">{item.title}</b>
              <p className="m-0 text-[13px] text-ink-500">{item.kind}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
