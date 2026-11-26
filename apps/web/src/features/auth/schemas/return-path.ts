import { siteRoutes } from "@gigshive/shared/routes";

/** Login follows the design's dashboard destination unless a safe path is supplied. */
export const DEFAULT_RETURN_PATH = siteRoutes.dashboard;

const PROBE_ORIGIN = "https://gigshive.invalid";
const AUTH_PATHS = new Set<string>([siteRoutes.login, siteRoutes.register, siteRoutes.verifyEmail]);

interface ParamReader {
  get(name: string): string | null;
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
}

/**
 * Accepts only same-site paths. External URLs, protocol-relative URLs,
 * backslash tricks, control characters and auth routes fall back to the
 * dashboard so login can never be used as an open redirect.
 */
export function resolveReturnPath(candidate: string | null | undefined): string {
  if (typeof candidate !== "string") {
    return DEFAULT_RETURN_PATH;
  }

  const value = candidate.trim();
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%5c/i.test(value) ||
    /%(?![0-9a-f]{2})/i.test(value) ||
    hasControlCharacter(value)
  ) {
    return DEFAULT_RETURN_PATH;
  }

  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (
      url.origin !== PROBE_ORIGIN ||
      url.username ||
      url.password ||
      AUTH_PATHS.has(url.pathname)
    ) {
      return DEFAULT_RETURN_PATH;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}

/** `next` is the primary parameter; `returnTo` is accepted as a readable alias. */
export function returnPathFromParams(params: ParamReader): string {
  return resolveReturnPath(params.get("next") ?? params.get("returnTo"));
}
