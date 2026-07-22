import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 jam dalam detik

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret === "change-this-to-a-random-secret-at-least-32-chars-long") {
    throw new Error(
      "ADMIN_SESSION_SECRET belum diatur di environment variables. " +
      "Generate dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return secret;
}

export interface SessionPayload {
  adminId: number;
  username: string;
}

export function createSessionToken(payload: SessionPayload): string {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn: SESSION_MAX_AGE });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const secret = getSecret();
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}