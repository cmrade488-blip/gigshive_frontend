"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadMedia, type MediaCollection } from "../api/media";

interface UploadInput {
  file: File;
  collection: MediaCollection;
}

/** Uploads one file through the media feature's API function. */
export function useMediaUpload() {
  return useMutation({
    mutationFn: ({ file, collection }: UploadInput) => uploadMedia(file, collection),
  });
}
