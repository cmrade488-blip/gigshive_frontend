import { workerProfileCopy as copy } from "../copy/worker-profile";

/** Skill chips from the public worker projection. */
export function WorkerSkills({ skills }: { skills: readonly string[] }) {
  return (
    <section className="rounded-[28px] bg-white p-7 shadow-[0_4px_12px_rgba(15,22,38,0.06)]">
      <h2 className="m-0 text-[17px] font-semibold">{copy.skillsTitle}</h2>
      <ul className="m-0 mt-4 flex flex-wrap gap-2 p-0">
        {skills.map((skill) => (
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
