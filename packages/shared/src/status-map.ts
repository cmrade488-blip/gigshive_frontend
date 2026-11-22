/**
 * Status → UI mapping framework.
 * Feature modules define maps; screens never hard-code status strings.
 */

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type StatusDescriptor = {
  /** User-facing label */
  label: string;
  /** Visual tone for badges / banners */
  tone: StatusTone;
  /** Optional short explanation shown near the badge */
  description?: string;
};

/**
 * Build a typed status map. Unknown statuses fall back to a neutral "Unknown".
 */
export function createStatusMap<S extends string>(
  map: Record<S, StatusDescriptor>,
  fallback: StatusDescriptor = { label: "Unknown", tone: "neutral" },
): (status: S | string) => StatusDescriptor {
  return (status: S | string) => {
    if (status in map) {
      return map[status as S];
    }
    return fallback;
  };
}

/**
 * availableActions helper: given status + role, return allowed action ids.
 * Feature modules supply the matrix; this only evaluates it.
 */
export function createAvailableActions<S extends string, R extends string, A extends string>(
  matrix: Partial<Record<S, Partial<Record<R, readonly A[]>>>>,
): (status: S, role: R) => readonly A[] {
  return (status, role) => {
    const byRole = matrix[status];
    if (!byRole) return [];
    return byRole[role] ?? [];
  };
}
