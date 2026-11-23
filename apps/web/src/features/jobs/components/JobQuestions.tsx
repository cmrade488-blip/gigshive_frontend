import { jobDetailCopy } from "../copy/job-detail";
import type { JobDetail } from "../api/jobs";

/** Screening questions are read-only here; FE-034 owns the answer form. */
export function JobQuestions({ job }: { job: JobDetail }) {
  if (job.questions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:p-9">
      <h2 className="m-0 mb-1.5 text-[22px] font-semibold">{jobDetailCopy.questionsTitle}</h2>
      <p className="mb-5 text-[15px] text-ink-600">{jobDetailCopy.questionsIntro}</p>
      <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 text-[17px] text-ink-700">
        {job.questions.map((question) => (
          <li key={question.id}>
            {question.text}{" "}
            <span className="text-[13px] font-semibold text-honey-700">
              {question.required ? jobDetailCopy.requiredFlag : jobDetailCopy.optionalFlag}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
