"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPrivateFile } from "../api/media";

type PrivateFileStatus = "idle" | "loading" | "ready" | "error";

interface PrivateFileState {
  status: PrivateFileStatus;
  /** Blob URL only. The signed URL is never kept in state. */
  blobUrl: string | null;
  expiresAt: string | null;
  error: unknown;
}

const IDLE_STATE: PrivateFileState = {
  status: "idle",
  blobUrl: null,
  expiresAt: null,
  error: null,
};

/**
 * Opens a private file on demand. Every open requests a fresh signed URL,
 * reads the bytes and discards the URL; the returned object URL is revoked on
 * close, on media change and on unmount.
 */
export function usePrivateFile(mediaId: string | null) {
  const [state, setState] = useState<PrivateFileState>(IDLE_STATE);
  const objectUrlRef = useRef<string | null>(null);
  const requestRef = useRef(0);

  const release = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    requestRef.current += 1;
    release();
    setState(IDLE_STATE);
  }, [release]);

  const open = useCallback(async () => {
    if (!mediaId) {
      return;
    }

    const requestId = ++requestRef.current;
    release();
    setState({ status: "loading", blobUrl: null, expiresAt: null, error: null });

    try {
      const file = await fetchPrivateFile(mediaId);
      if (requestId !== requestRef.current) {
        return;
      }
      const blobUrl = URL.createObjectURL(file.blob);
      objectUrlRef.current = blobUrl;
      setState({ status: "ready", blobUrl, expiresAt: file.expiresAt, error: null });
    } catch (error) {
      if (requestId !== requestRef.current) {
        return;
      }
      setState({ status: "error", blobUrl: null, expiresAt: null, error });
    }
  }, [mediaId, release]);

  useEffect(() => {
    requestRef.current += 1;
    release();
    setState(IDLE_STATE);
  }, [mediaId, release]);

  useEffect(
    () => () => {
      requestRef.current += 1;
      release();
    },
    [release],
  );

  return { ...state, open, close };
}
