import Image from "next/image";

import { homeCopy as copy } from "../copy/home";

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-honey-400"
    >
      <path d="M12 3l2.4 1.6 2.9-.1 1 2.7 2.3 1.8-.9 2.8.9 2.8-2.3 1.8-1 2.7-2.9-.1L12 21l-2.4-1.6-2.9.1-1-2.7-2.3-1.8.9-2.8-.9-2.8 2.3-1.8 1-2.7 2.9.1z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

function NairaIcon() {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-honey-700"
    >
      <path d="M7 4v16M17 4v16M7 4l10 16" />
      <path d="M4 9.5h16M4 14.5h16" />
    </svg>
  );
}

/** The three reassurance cards at the bottom of the home page. */
export function HomeTrust() {
  const [payment, verified, naira] = copy.trustCards;

  return (
    <section aria-labelledby="home-trust-title" className="px-5 pb-10 sm:px-10 sm:pb-16">
      <h2 id="home-trust-title" className="sr-only">
        {copy.trustTitle}
      </h2>
      <div className="mx-auto grid max-w-[1200px] gap-5 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-wrap items-center gap-6 rounded-[28px] bg-gradient-to-br from-honey-400 to-honey-500 p-8 sm:rounded-[40px] sm:p-12">
          <div className="min-w-0 flex-1 basis-[260px]">
            <h3 className="mb-3 font-display text-[24px] leading-[1.2] font-bold text-ink-900 sm:text-[30px]">
              {payment.title}
            </h3>
            <p className="m-0 text-base text-ink-900 sm:text-[17px]">{payment.text}</p>
          </div>
          <Image
            src={payment.image}
            width={360}
            height={240}
            alt=""
            className="h-auto w-[240px] max-w-full"
          />
        </div>
        <div className="rounded-[28px] bg-ink-900 p-8 text-white sm:rounded-[40px]">
          <span className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-ink-800">
            <ShieldIcon />
          </span>
          <h3 className="mb-2 text-[22px] font-semibold">{verified.title}</h3>
          <p className="m-0 text-base text-ink-300">{verified.text}</p>
        </div>
        <div className="rounded-[28px] bg-ink-50 p-8 sm:rounded-[40px]">
          <span className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-honey-100">
            <NairaIcon />
          </span>
          <h3 className="mb-2 text-[22px] font-semibold">{naira.title}</h3>
          <p className="m-0 text-base text-ink-600">{naira.text}</p>
        </div>
      </div>
    </section>
  );
}
