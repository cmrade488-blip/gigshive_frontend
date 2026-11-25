import { authCopy } from "../copy/auth";

export type AuthStep = "account" | "verify";

export interface StepIndicatorProps {
  step: AuthStep;
}

const STEPS: ReadonlyArray<{ id: AuthStep; label: string }> = [
  { id: "account", label: authCopy.steps.account },
  { id: "verify", label: authCopy.steps.verify },
];

/** Compact progress list; the active step is announced to screen readers. */
export function StepIndicator({ step }: StepIndicatorProps) {
  const activeIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <nav aria-label={authCopy.steps.current}>
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((item, index) => {
          const current = item.id === step;
          const complete = index < activeIndex;

          return (
            <li key={item.id}>
              <span
                aria-current={current ? "step" : undefined}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  current
                    ? "border-gh-primary bg-gh-primary text-gh-primary-text"
                    : complete
                      ? "border-gh-success bg-gh-success-bg text-gh-success"
                      : "border-gh-border bg-gh-surface text-ink-500",
                ].join(" ")}
              >
                <span aria-hidden="true">{index + 1}</span>
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
