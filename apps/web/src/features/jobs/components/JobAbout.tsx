import { jobDetailCopy } from "../copy/job-detail";
import type { JobDetail } from "../api/jobs";

/** Description, deliverables and skills from the detail design. */
export function JobAbout({ job }: { job: JobDetail }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(15,22,38,0.12)] sm:p-9">
      <h2 className="m-0 mb-3.5 text-[22px] font-semibold">{jobDetailCopy.aboutTitle}</h2>
      {job.description.map((paragraph) => (
        <p key={paragraph} className="mb-3.5 text-[17px] text-ink-700">
          {paragraph}
        </p>
      ))}

      <h3 className="mb-2.5 mt-6 text-[17px] font-semibold">{jobDetailCopy.deliverablesTitle}</h3>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[17px] text-ink-700">
        {job.deliverables.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-3 mt-7 text-[17px] font-semibold">{jobDetailCopy.skillsTitle}</h3>
      <ul className="m-0 flex flex-wrap gap-2 p-0">
        {job.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full bg-ink-50 px-4 py-1.5 text-sm font-medium text-ink-700"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
