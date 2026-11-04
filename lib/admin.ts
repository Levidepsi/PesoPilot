import "server-only";
import { requireUser } from "./auth";
import { notFound } from "next/navigation";

export function isSiteAdmin(user: { id: string }) {
  return (
    !!process.env.SITE_ADMIN_USER_ID &&
    user.id === process.env.SITE_ADMIN_USER_ID.trim()
  );
}

export async function requireSiteAdmin() {
  const user = await requireUser();
  if (!isSiteAdmin(user)) notFound();
  return user;
}
