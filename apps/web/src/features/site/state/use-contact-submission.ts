"use client";

import { useMutation } from "@tanstack/react-query";

import { submitContactMessage } from "../api/contact";

/** Submits the contact form through the typed mock (see api/contact.ts). */
export function useContactSubmission() {
  return useMutation({
    mutationFn: submitContactMessage,
  });
}
