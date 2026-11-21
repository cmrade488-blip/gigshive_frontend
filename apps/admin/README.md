# apps/admin

Staff console: verification, moderation, support and finance. Separate origin and session from `apps/web` (30 minutes idle, 8 hours absolute, mandatory OTP).

- Same structure as `apps/web`. Navigation is built from the permissions the API returns, never role names.
- Restricted data is shown only where the role permits, masked by default.
- Must not import from `apps/web`.
- Spec: Blueprint sections 6.13 and 10.4.
