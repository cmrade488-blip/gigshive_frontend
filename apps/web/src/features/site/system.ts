/**
 * Narrow entry for app-level system code. The root layout needs the
 * maintenance screen and shared metadata copy only; importing the full site
 * barrel would pull every public screen into the layout bundle.
 */
export { siteCopy } from "./copy/site";
export { MaintenanceScreen } from "./screens/MaintenanceScreen";
