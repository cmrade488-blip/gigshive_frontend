import { errorCopy } from "@gigshive/shared/error-copy";
import { NotFoundState } from "@gigshive/ui";
import Link from "next/link";

export default function NotFound() {
  const copy = errorCopy.notFound;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <NotFoundState
        title={copy.title}
        description={copy.description}
        action={
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-gh-primary px-5 font-semibold text-gh-primary-text focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {copy.actionLabel}
          </Link>
        }
      />
    </main>
  );
}
