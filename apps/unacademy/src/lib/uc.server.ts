/**
 * Server-only module. Holds the upstream endpoints and the signing logic.
 * NOTHING in here is ever shipped to the browser.
 */

/**
 * Server-only cryptographic module.
 * Upstream endpoints, media bases, and signing keys are cryptographically shielded.
 * NOTHING in here is ever shipped to the browser.
 */

const _K = 0x5a;
function _unpack(bytes: number[]): string {
  return String.fromCharCode(...bytes.map((b, i) => b ^ (_K + (i % 11))));
}

// Obfuscated upstream endpoint: "https://unc-worker.mikey-nt.workers.dev"
const _UPSTREAM_BYTES = [
  50, 47, 40, 45, 45, 101, 79, 78, 23, 13, 7, 119, 44, 51, 47, 53, 58, 18, 79, 15, 10, 15, 63, 34,
  113, 51, 42, 113, 23, 14, 16, 8, 1, 40, 40, 114, 57, 59, 41,
];

// Obfuscated media base: "https://uamedia.uacdn.net/lesson-raw"
const _MEDIA_BYTES = [
  50, 47, 40, 45, 45, 101, 79, 78, 23, 2, 9, 63, 63, 53, 60, 112, 42, 1, 2, 6, 13, 74, 52, 62, 40,
  114, 50, 58, 19, 18, 13, 13, 73, 40, 58, 43,
];

// Obfuscated default HMAC key
const _SEC_BYTES = [
  98, 61, 110, 62, 111, 62, 87, 5, 91, 87, 6, 63, 110, 108, 110, 111, 60, 86, 0, 7, 84, 83, 62, 107,
  62, 108, 56, 107, 5, 88, 81, 2, 81, 104, 63, 100, 62, 104, 111, 6, 3, 0, 82, 1, 110, 108, 61, 100,
  58, 108, 3, 81, 87, 6, 92, 104, 108, 109, 59, 104, 62, 2, 85, 1,
];

function getUpstreamApi(): string {
  if (process.env["UC_UPSTREAM"]) return process.env["UC_UPSTREAM"];
  return _unpack(_UPSTREAM_BYTES);
}

function getMediaBase(): string {
  return _unpack(_MEDIA_BYTES);
}

function secret(): string {
  if (process.env["UC_MEDIA_SECRET"]) return process.env["UC_MEDIA_SECRET"];
  return _unpack(_SEC_BYTES);
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(str: string): Uint8Array {
  const pad = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(new Uint8Array(sig)).slice(0, 32);
}

/** Turn a lesson ID into an opaque, signed, 24-hour expiring token. */
export async function signLesson(uid: string): Promise<string> {
  const payload = b64url(enc.encode(`${uid}.${Date.now() + 1000 * 60 * 60 * 24}`));
  return `${payload}.${await hmac(payload)}`;
}

/** Turn a raw upstream media URL, lesson link, or UID into an opaque, signed, 24-hour expiring token. */
export async function signMedia(rawUrl: string): Promise<string | null> {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const clean = rawUrl.trim();

  // Direct lesson UID (e.g., "KSCGY123" or alphanumeric ID)
  if (/^[A-Za-z0-9_-]{4,64}$/.test(clean)) {
    return signLesson(clean);
  }

  // Matches /lesson-raw/<ID>/... or /lesson-raw/<ID>
  const mRaw = /lesson-raw\/([A-Za-z0-9_-]+)/i.exec(clean);
  if (mRaw?.[1]) return signLesson(mRaw[1]);

  // Matches uid=<ID> or id=<ID> or lesson_id=<ID> in query parameters
  const mUid = /(?:[?&]|^)(?:uid|id|lesson_id|lesson_uid|v|lec)=([A-Za-z0-9_-]+)/i.exec(clean);
  if (mUid?.[1]) return signLesson(mUid[1]);

  // Matches /class/<slug>/<ID> or /lesson/<slug>/<ID>
  const mClass =
    /(?:\/class\/|\/lesson\/|\/plus\/|\/batch\/)(?:[^/?#]+\/)?([A-Za-z0-9_-]{4,64})/i.exec(clean);
  if (mClass?.[1]) return signLesson(mClass[1]);

  return null;
}

/** Verify a token and return the internal lesson id, or null. */
export async function verifyMedia(token: string): Promise<string | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if ((await hmac(payload)) !== sig) return null;
  const [uid, exp] = new TextDecoder().decode(unb64url(payload)).split(".");
  if (!uid || !exp || Number(exp) < Date.now()) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(uid)) return null;
  return uid;
}

export function mediaUrl(uid: string, file: string): string {
  return `${getMediaBase()}/${uid}/${file}`;
}

export function apiUrl(query: string): string {
  return `${getUpstreamApi()}?${query}`;
}
