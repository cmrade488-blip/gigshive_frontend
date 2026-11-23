"use client";

import { useQuery } from "@tanstack/react-query";

import { getHomeWorkers } from "../api/home";

/** Loads the sample profiles from the typed mock (see api/home.ts). */
export function useHomeWorkers() {
  return useQuery({
    queryKey: ["site", "home", "workers"],
    queryFn: getHomeWorkers,
  });
}
