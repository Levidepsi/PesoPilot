import "server-only";
import { emailAuthEnabled } from "./auth-config";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { db } from "./db";
const cookieName = "pesopilot_session";
function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("Set SESSION_SECRET (32+ characters)");
  return new TextEncoder().encode(s);
}
export async function session() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.sub !== "string") return null;
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        sessionVersion: true,
      },
    });
    if (
      !user ||
      (emailAuthEnabled() && !user.emailVerifiedAt) ||
      payload.sessionVersion !== user.sessionVersion
    )
      return null;
    return user;
  } catch {
    return null;
  }
}
export async function requireUser() {
  const u = await session();
  if (!u) redirect("/login");
  return u;
}
export async function loginUser(userId: string, sessionVersion: number) {
  const jwt = await new SignJWT({ sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set(cookieName, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
}
export async function logoutUser() {
  (await cookies()).delete(cookieName);
}
