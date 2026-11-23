import base from "@gigshive/config/eslint/base";
import { packageBoundaries } from "@gigshive/config/eslint/boundaries";

/** @type {import("eslint").Linter.Config[]} */
export default [...base, ...packageBoundaries];
