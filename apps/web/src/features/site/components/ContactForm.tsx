"use client";

import { Button, Input, Textarea } from "@gigshive/ui";
import { useState, type FormEvent } from "react";

import type { ContactSubmission } from "../api/contact";
import { contactCopy as copy, contactTopics } from "../copy/contact";
import {
  emptyContactForm,
  isContactTopic,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from "../schemas/contact";
import { useContactSubmission } from "../state/use-contact-submission";

/** Contact form with local validation and a typed mock submit (see api/contact.ts). */
export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(emptyContactForm);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const submission = useContactSubmission();

  function updateField<K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (submitAttempted) {
      setErrors(validateContactForm(nextValues));
    }
  }

  function buildSubmission(): ContactSubmission | null {
    if (!isContactTopic(values.topic)) return null;
    return {
      name: values.name.trim(),
      email: values.email.trim(),
      topic: values.topic,
      reference: values.reference.trim() || undefined,
      message: values.message.trim(),
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = buildSubmission();
    if (payload) {
      submission.mutate(payload);
    }
  }

  function startAgain() {
    setValues(emptyContactForm);
    setErrors({});
    setSubmitAttempted(false);
    submission.reset();
  }

  if (submission.isSuccess) {
    return (
      <div className="rounded-[36px] border border-gh-border bg-white p-8 shadow-sm sm:p-11">
        <h2 className="font-display text-[28px] font-bold tracking-[-0.5px]">
          {copy.successTitle}
        </h2>
        <p role="status" className="mt-3 text-base text-ink-600">
          {copy.successText}
        </p>
        <Button type="button" onClick={startAgain} className="mt-7">
          {copy.anotherLabel}
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-[36px] border border-gh-border bg-white p-8 shadow-sm sm:p-11"
    >
      <h2 className="mb-7 font-display text-[28px] font-bold tracking-[-0.5px]">
        {copy.formHeading}
      </h2>

      {submission.isError ? (
        <div role="alert" className="mb-6 rounded-2xl bg-gh-danger-bg p-4">
          <p className="font-semibold text-gh-danger">{copy.errorTitle}</p>
          <p className="mt-1 text-sm text-ink-600">{copy.errorText}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <Input
          label={copy.nameLabel}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
          required
        />
        <Input
          label={copy.emailLabel}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
          required
        />
        <div className="w-full">
          <label htmlFor="contact-topic" className="block text-sm font-medium text-gh-text">
            {copy.topicLabel}
            <span className="ml-1 text-gh-danger">*</span>
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={values.topic}
            onChange={(event) =>
              updateField("topic", isContactTopic(event.target.value) ? event.target.value : "")
            }
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={errors.topic ? "contact-topic-error" : undefined}
            className="mt-1 min-h-12 w-full rounded-lg border border-gh-border bg-white px-3 text-base text-gh-text focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
          >
            <option value="">—</option>
            {contactTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic ? (
            <p id="contact-topic-error" className="mt-1 text-sm text-gh-danger">
              {errors.topic}
            </p>
          ) : null}
        </div>
        <Input
          label={copy.referenceLabel}
          name="reference"
          value={values.reference}
          onChange={(event) => updateField("reference", event.target.value)}
        />
        <Textarea
          label={copy.messageLabel}
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          error={errors.message}
          required
        />
      </div>

      <Button type="submit" loading={submission.isPending} className="mt-7">
        {submission.isPending ? copy.submittingLabel : copy.submitLabel}
      </Button>
    </form>
  );
}
