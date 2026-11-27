const collectionLabels = {
  AVATAR: "Profile photo",
  COVER: "Cover image",
  PORTFOLIO: "Portfolio file",
  KYC_DOCUMENT: "Identity document",
  JOB_ATTACHMENT: "Job attachment",
  APPLICATION_ATTACHMENT: "Application attachment",
  DELIVERABLE: "Deliverable file",
  DISPUTE_EVIDENCE: "Dispute evidence",
  MESSAGE_ATTACHMENT: "Message attachment",
} as const;

export type MediaCollectionLabelKey = keyof typeof collectionLabels;

/**
 * FE-020 media copy. No backend message, code, signed URL or technical field
 * name is rendered; every visible string comes from here.
 */
export const mediaCopy = {
  collectionLabels,
  uploader: {
    label: (collection: MediaCollectionLabelKey) => `Upload ${collectionLabels[collection]}`,
    hint: "Choose a file to upload.",
    uploading: "Uploading your file…",
    success: (name: string) => `${name} is uploaded`,
    retry: "Try again",
    cooldown: (seconds: number) => `Try again in ${seconds}s`,
    fileInvalid: "Choose a different file and try again.",
  },
  viewer: {
    open: (name: string) => `Open ${name}`,
    openPrivate: "Open securely",
    loading: "Opening file…",
    privateNote: "This file opens through a short-lived secure link.",
    publicNote: "This file is public on GigsHive.",
    expires: (date: string) => `Available until ${date}`,
    download: "Download file",
    imageAlt: (name: string) => `Preview of ${name}`,
    retry: "Try again",
  },
  list: {
    title: "Files",
    emptyTitle: "No files yet",
    emptyText: "Uploaded files will appear here.",
    public: "Public file",
    private: "Private file",
  },
  errors: {
    kinds: {
      auth: {
        title: "Please sign in",
        description: "Sign in again to continue.",
      },
      forbidden: {
        title: "You do not have access to this file",
        description: "It may belong to another account or need a profile you have not set up yet.",
      },
      notFound: {
        title: "We cannot find that file",
        description: "The link may be old, or the file may no longer be available.",
      },
      conflict: {
        title: "This file has changed",
        description: "Refresh the page and try again.",
        actionLabel: "Try again",
      },
      validation: {
        title: "Please check the file",
        description: "Choose a valid file and try again.",
      },
      rateLimit: {
        title: "Please wait a moment",
        description: "There have been too many attempts. Wait before trying again.",
        actionLabel: "Try again",
      },
      server: {
        title: "We could not complete that",
        description: "Try again. If it keeps happening, quote the reference to support.",
        actionLabel: "Try again",
      },
      network: {
        title: "You appear to be offline",
        description: "Check your connection and try again.",
        actionLabel: "Try again",
      },
      unknown: {
        title: "That did not go through",
        description: "Please try again.",
        actionLabel: "Try again",
      },
    },
  },
} as const;
