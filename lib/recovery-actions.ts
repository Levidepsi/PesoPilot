"use server";
import { issueAuthEmail } from "./auth-email";
import { consumeAuthToken } from "./consume-auth-token";
import { db } from "./db";
import { validToken, validPassword } from "./auth-tokens";
import { emailConfig } from "./email";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { logoutUser } from "./auth";

export async function requestResetAction(fd: FormData) {
  const email = String(fd.get("email") || "")
    .trim()
    .toLowerCase();
  try {
    emailConfig();
    const user = await db.user.findUnique({ where: { email } });
    if (user) await issueAuthEmail(user.id, "RESET");
  } catch {
    console.error("Password recovery email unavailable");
  }
  redirect("/forgot-password?status=requested");
}
export async function requestVerificationAction(fd: FormData) {
  const email = String(fd.get("email") || "")
    .trim()
    .toLowerCase();
  try {
    emailConfig();
    const user = await db.user.findUnique({ where: { email } });
    if (user && !user.emailVerifiedAt) await issueAuthEmail(user.id, "VERIFY");
  } catch {
    console.error("Verification email unavailable");
  }
  redirect("/verify-email?status=requested");
}
export async function verifyEmailAction(fd: FormData) {
  const token = String(fd.get("token") || "");
  if (!validToken(token)) redirect("/verify-email?status=invalid");
  const success = await consumeAuthToken(db, token, "VERIFY");
  redirect(success ? "/login?status=verified" : "/verify-email?status=invalid");
}
export async function resetPasswordAction(fd: FormData) {
  const token = String(fd.get("token") || "");
  const password = String(fd.get("password") || "");
  if (!validToken(token)) redirect("/reset-password?status=invalid");
  if (
    !validPassword(password) ||
    password !== String(fd.get("confirmPassword") || "")
  )
    redirect(`/reset-password?token=${token}&status=password`);
  const passwordHash = await hash(password, 12);
  const success = await consumeAuthToken(db, token, "RESET", passwordHash);
  if (!success) redirect("/reset-password?status=invalid");
  await logoutUser();
  redirect("/login?status=reset");
}
