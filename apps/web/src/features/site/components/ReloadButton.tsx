"use client";

/** Reloads the current page. Used by system-page actions that have no router reset callback. */
export function ReloadButton({ label, className }: { label: string; className: string }) {
  return (
    <button type="button" onClick={() => window.location.reload()} className={className}>
      {label}
    </button>
  );
}
