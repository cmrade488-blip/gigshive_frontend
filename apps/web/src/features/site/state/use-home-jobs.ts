"use client";

import { useQuery } from "@tanstack/react-query";

import { getHomeJobs } from "../api/home";

/** Loads the sample listings from the typed mock (see api/home.ts). */
export function useHomeJobs() {
  return useQuery({
    queryKey: ["site", "home", "jobs"],
    queryFn: getHomeJobs,
  });
}
