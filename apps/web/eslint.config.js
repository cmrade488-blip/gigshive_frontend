import { appBoundaries } from "@gigshive/config/eslint/boundaries";
import nextjs from "@gigshive/config/eslint/nextjs";

/** @type {import("eslint").Linter.Config[]} */
export default [...nextjs, ...appBoundaries("web")];
