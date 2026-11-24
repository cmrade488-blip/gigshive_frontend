/** Opaque, authenticated session cookies. No token is ever visible to page scripts. */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { type SessionConfig, type SessionSurface } from "./config";

export interface SessionState {
  surface: SessionSurface;
  /** Sanctum bearer token. Sealed; never sent to the browser in clear text. */
  token: string;
  issuedAt: number;
  lastSeen: number;
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealSession(state: SessionState, config: SessionConfig): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(config.secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function unsealSession(value: string | null, config: SessionConfig): SessionState | null {
  if (!value) {
    return null;
  }

  try {
    const bytes = Buffer.from(value, "base64url");
    if (bytes.length <= 28) {
      return null;
    }
    const iv = bytes.subarray(0, 12);
    const tag = bytes.subarray(12, 28);
    const encrypted = bytes.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(config.secret), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
      "utf8",
    );
    const parsed: unknown = JSON.parse(decrypted);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("surface" in parsed) ||
      parsed.surface !== config.surface ||
      !("token" in parsed) ||
      typeof parsed.token !== "string" ||
      parsed.token.length === 0 ||
      !("issuedAt" in parsed) ||
      typeof parsed.issuedAt !== "number" ||
      !Number.isFinite(parsed.issuedAt) ||
      !("lastSeen" in parsed) ||
      typeof parsed.lastSeen !== "number" ||
      !Number.isFinite(parsed.lastSeen)
    ) {
      return null;
    }

    return {
      surface: config.surface,
      token: parsed.token,
      issuedAt: parsed.issuedAt,
      lastSeen: parsed.lastSeen,
    };
  } catch {
    return null;
  }
}

export function isSessionCurrent(
  state: SessionState,
  config: SessionConfig,
  now: number = Date.now(),
): boolean {
  if (now < state.issuedAt || now < state.lastSeen) {
    return false;
  }
  return now - state.issuedAt < config.absoluteMs && now - state.lastSeen < config.idleMs;
}

/** Re-seal after activity so the idle window slides, within the absolute limit. */
export function touchSession(state: SessionState, now: number = Date.now()): SessionState {
  return { ...state, lastSeen: now };
}

function cookieFlags(config: SessionConfig, maxAgeSeconds: number): string {
  return [
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
    ...(config.secureCookie ? ["Secure"] : []),
  ].join("; ");
}

export function sessionSetCookie(
  config: SessionConfig,
  state: SessionState,
  now: number = Date.now(),
): string {
  const value = sealSession(state, config);
  const remaining = Math.max(0, config.absoluteMs - (now - state.issuedAt));
  const maxAge = Math.floor(Math.min(config.idleMs, remaining) / 1000);
  return `${config.sessionCookieName}=${value}; ${cookieFlags(config, maxAge)}`;
}

export function clearSessionCookie(config: SessionConfig): string {
  return `${config.sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
    config.secureCookie ? "; Secure" : ""
  }`;
}

/** The CSRF cookie is readable on purpose: the browser echoes it in a header. */
export function csrfSetCookie(config: SessionConfig, token: string): string {
  const flags = [
    "Path=/",
    `Max-Age=${Math.floor(config.absoluteMs / 1000)}`,
    "SameSite=Lax",
    ...(config.secureCookie ? ["Secure"] : []),
  ].join("; ");
  return `${config.csrfCookieName}=${token}; ${flags}`;
}

export function clearCsrfCookie(config: SessionConfig): string {
  return `${config.csrfCookieName}=; Path=/; Max-Age=0; SameSite=Lax${
    config.secureCookie ? "; Secure" : ""
  }`;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) {
    return null;
  }
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) {
      continue;
    }
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

export function readSession(
  request: Request,
  config: SessionConfig,
  now: number = Date.now(),
): SessionState | null {
  const state = unsealSession(readCookie(request, config.sessionCookieName), config);
  return state && isSessionCurrent(state, config, now) ? state : null;
}
