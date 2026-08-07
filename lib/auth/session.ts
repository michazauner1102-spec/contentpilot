import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "contentpilot_session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Nur für lokale Entwicklung — in Produktion ist SESSION_SECRET Pflicht. */
const DEV_SECRET = "contentpilot-dev-secret-not-for-production";

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET fehlt (mindestens 16 Zeichen). Erzeugen mit: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(DEV_SECRET);
}

export interface SessionPayload {
  userId: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    const userId = payload.userId;
    return typeof userId === "string" && userId ? { userId } : null;
  } catch {
    return null;
  }
}

export async function startSession(userId: string): Promise<void> {
  const token = await signSession({ userId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}
