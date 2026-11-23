import Image from "next/image";

import { homeCopy as copy } from "../copy/home";

/** How-it-works teaser on the home page: three static cards from the design. */
export function HomeSteps() {
  return (
    <section aria-labelledby="home-steps-title" className="px-5 py-16 sm:px-10 sm:py-[72px]">
      <div className="mx-auto max-w-[1200px] rounded-[28px] bg-ink-50 p-6 sm:rounded-[40px] sm:p-12">
        <h2
          id="home-steps-title"
          className="text-center font-display text-[26px] font-bold tracking-[-0.5px] sm:text-[40px]"
        >
          {copy.stepsTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-[560px] text-center text-base text-ink-600 sm:mb-12 sm:text-[18px]">
          {copy.stepsSubtitle}
        </p>
        <ul className="mt-8 grid gap-4 sm:mt-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {copy.steps.map((step) => (
            <li
              key={step.number}
              className="rounded-[20px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:rounded-[28px] sm:p-7"
            >
              <Image
                src={step.image}
                width={360}
                height={240}
                alt=""
                className="mx-auto h-auto w-full max-w-[300px]"
              />
              <p className="mt-2 font-display text-sm font-bold text-honey-700">{step.number}</p>
              <h3 className="mt-1.5 text-[21px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-base text-ink-600">{step.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
