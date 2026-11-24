# @gigshive/session

Server-held session layer for both Next.js apps (FE-008, FOI-01). The Sanctum
bearer token never reaches the browser: it is sealed into an opaque, HttpOnly,
Secure, SameSite=Lax cookie. The browser talks only to same-origin route
handlers, which attach the token on the server.

## Exports

- `createSessionConfig({ surface, env })` — per-app config. Marketplace: 7-day
  idle / 30-day absolute. Console: 30-minute idle / 8-hour absolute.
- `createCsrfResponse(config)` — `GET /api/session/csrf`; plants a readable
  double-submit token and returns it.
- `handleProxy(request, config, deps?)` — `ALL /api/proxy/<path>`; bearer attach,
  narrow header forwarding, 401 cookie clearing, idle sliding.
- `handleSessionStart(request, config, backendPath, deps?)` — `POST /api/auth/*`;
  moves a `SessionStartEnvelope` token into the cookie and strips it from the
  response. No token means a pending staff OTP step; nothing is stored.
- `handleLogout(request, config, deps?)` — `POST /api/auth/logout`; revokes on
  the API, then clears both cookies even if the API is unreachable.
- `@gigshive/session/browser` — client-safe `csrfHeaders(surface)` for feature
  API calls; it does not import `node:crypto` or the server handlers.

## Rules

- State-changing proxy calls require both the `X-CSRF-Token` header and a
  matching `Origin`. Missing Origin is rejected.
- No token, identity number, OTP or signed URL is logged, cached or put in a URL.
- The proxy forwards only `content-type`, `idempotency-key` and `x-request-id`
  from the browser. Cookies are never forwarded to the backend.
- Backend error envelopes pass through for 4xx; locally generated errors use
  generic status codes and never expose backend messages or stack traces.
- Route handlers must export `runtime = "nodejs"` because sealing uses
  `node:crypto`.

## Environment

`API_BASE_URL`, `PUBLIC_SITE_URL`, `SESSION_SECRET` (at least 32 characters in
production). See each app's `.env.example`. All instances of an app must share
the same secret; rotating it signs everyone out. No new dependency: the built-in
`node:crypto` provides AES-256-GCM, random tokens and constant-time comparison.
