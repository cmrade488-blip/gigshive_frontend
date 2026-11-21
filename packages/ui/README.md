# packages/ui

Design system: tokens (colour, type, spacing, radius, elevation, motion), Tailwind preset, accessible components, icons.

- Tasks: FE-006 (tokens and base components), FE-037 (money components), FE-040 (status badges). Owner (proposed): FE1.
- Brand tokens and icons come from the design workstream: https://github.com/cmrade488-blip/gigshive_doc/tree/main/brand. Until then a neutral placeholder set is used (FOI-05).
- Must not import from apps or features. Console-only components live here but are tree-shaken from the web app.
- Spec: Blueprint section 9.
