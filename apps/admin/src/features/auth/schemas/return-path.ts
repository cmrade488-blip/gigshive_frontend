/** Console return paths stay same-origin relative; anything else falls back to `/`. */
export function resolveConsoleReturnPath(value: string | null | undefined): string {
  if (typeof value !== "string" || value.length === 0) {
    return "/";
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) {
      return "/";
    }
  }
  return value;
}
