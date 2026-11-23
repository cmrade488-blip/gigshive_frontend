"use client";

import { MoneyDisplay } from "@gigshive/ui";

import { feesCopy as copy } from "../copy/fees";
import { useFeeExample } from "../state/use-fee-example";

/** Renders the sample amounts returned by the typed fee mock. No client arithmetic. */
export function FeeExampleCard() {
  const { data, isPending, isError } = useFeeExample();

  return (
    <div className="rounded-[40px] border border-gh-border bg-white p-8 shadow-sm sm:p-11">
      <span className="inline-block rounded-full bg-honey-100 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide text-honey-800 uppercase">
        {copy.exampleBadge}
      </span>
      <h3 className="mt-5 font-display text-[28px] font-bold tracking-[-0.5px]">
        {copy.exampleHeading}
      </h3>
      <p className="mt-2 text-base text-ink-600">{copy.exampleIntro}</p>

      {isPending ? (
        <p role="status" className="mt-7 text-base text-ink-600">
          {copy.exampleLoading}
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="mt-7 rounded-2xl bg-gh-danger-bg p-4 text-base text-gh-danger">
          {copy.exampleError}
        </p>
      ) : null}

      {!isPending && !isError && !data ? (
        <p role="status" className="mt-7 text-base text-ink-600">
          {copy.exampleEmpty}
        </p>
      ) : null}

      {data ? (
        <dl className="mt-7 divide-y divide-gh-border rounded-3xl border border-gh-border">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <dt className="text-base text-ink-600">{copy.agreedLabel}</dt>
            <dd className="m-0">
              <MoneyDisplay amountKobo={data.agreedAmountKobo} size="lg" />
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <dt className="text-base text-ink-600">{copy.platformFeeLabel}</dt>
            <dd className="m-0">
              <MoneyDisplay amountKobo={data.platformFeeKobo} size="lg" />
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-honey-50 px-5 py-4">
            <dt className="text-base font-semibold text-ink-900">{copy.workerReceivesLabel}</dt>
            <dd className="m-0">
              <MoneyDisplay amountKobo={data.workerReceivesKobo} size="lg" />
            </dd>
          </div>
        </dl>
      ) : null}

      <p className="mt-5 text-sm text-ink-500">{copy.exampleNote}</p>
    </div>
  );
}
