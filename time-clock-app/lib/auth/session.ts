// Owner: A
// Cookie session = a signed token (HS256) holding only the user id.
// Role and is_active are always re-read from the database in guards.ts.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (at least 32 characters)");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MAX_AGE_SECONDS + "s")
    .sign(getKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
