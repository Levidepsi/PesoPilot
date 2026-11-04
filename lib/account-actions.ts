"use server";
import {
  ownerPlan,
  businessPlan,
  lockOwner,
  PlanLimitError,
} from "./plan-access";
import { planMutation } from "./plan-mutation";
import { emailAuthEnabled } from "./auth-config";
import { emailConfig } from "./email";
import { issueAuthEmail } from "./auth-email";
import { validPassword } from "./auth-tokens";
import { db, authorizedBusiness } from "./db";
import { loginUser, logoutUser, requireUser } from "./auth";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
function field(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
export async function registerAction(fd: FormData) {
  const email = field(fd, "email").toLowerCase(),
    name = field(fd, "name").slice(0, 100),
    business = field(fd, "business").slice(0, 100),
    password = String(fd.get("password") ?? "");
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    !name ||
    !business ||
    !validPassword(password)
  )
    redirect("/login?status=registration");
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) redirect("/login?status=exists");
  if (emailAuthEnabled()) {
    try {
      emailConfig();
    } catch {
      redirect("/login?status=email-unavailable");
    }
  }
  const u = await db.user.create({
    data: {
      email,
      name,
      passwordHash: await hash(password, 12),
      memberships: {
        create: {
          role: "OWNER",
          business: {
            create: {
              name: business,
              subscription: { create: { plan: "FREE", status: "ACTIVE" } },
            },
          },
        },
      },
    },
    include: { memberships: true },
  });
  if (!emailAuthEnabled()) {
    await loginUser(u.id, u.sessionVersion);
    redirect("/dashboard");
  }
  try {
    await issueAuthEmail(u.id, "VERIFY");
  } catch {
    redirect("/verify-email?status=delivery");
  }
  redirect("/verify-email?status=requested");
}
export async function loginAction(fd: FormData) {
  const email = field(fd, "email").toLowerCase(),
    password = String(fd.get("password") ?? "");
  const u = await db.user.findUnique({ where: { email } });
  if (!u || !(await compare(password, u.passwordHash)))
    redirect("/login?status=credentials");
  if (emailAuthEnabled() && !u.emailVerifiedAt)
    redirect("/verify-email?status=required");
  await loginUser(u.id, u.sessionVersion);
  redirect("/dashboard");
}
export async function logoutAction() {
  await logoutUser();
  (await cookies()).delete("pesopilot_business");
  redirect("/login");
}
export async function switchBusiness(fd: FormData) {
  const u = await requireUser(),
    businessId = field(fd, "businessId");
  const member = await db.businessMember.findUnique({
    where: { userId_businessId: { userId: u.id, businessId } },
  });
  if (!member) throw new Error("Not a member");
  (await cookies()).set("pesopilot_business", businessId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
export async function createBusiness(fd: FormData) {
  const u = await requireUser(),
    name = field(fd, "name").slice(0, 100);
  if (!name) throw new Error("Business name required");
  const b = await planMutation(async (tx) => {
    await lockOwner(tx, u.id);
    const access = await ownerPlan(tx, u.id);
    if (access.businessIds.length >= access.limits.businesses)
      throw new PlanLimitError(
        `Your ${access.limits.name} plan allows ${access.limits.businesses} business(es). Paid upgrades are coming soon.`,
      );
    return tx.business.create({
      data: {
        name,
        members: { create: { userId: u.id, role: "OWNER" } },
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
      },
    });
  });
  (await cookies()).set("pesopilot_business", b.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
export async function addStaff(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN"]);
  const email = field(fd, "email").toLowerCase(),
    role = field(fd, "role");
  if (!["ADMIN", "STAFF", "VIEWER"].includes(role))
    throw new Error("Invalid role");
  const u = await db.user.findUnique({ where: { email } });
  if (!u) throw new Error("Staff must register their account first");
  await planMutation(async (tx) => {
    const context = await businessPlan(tx, b.id);
    await lockOwner(tx, context.ownerId);
    const access = await ownerPlan(tx, context.ownerId);
    if (u.id === access.ownerId)
      throw new PlanLimitError("The owner's role cannot be changed here.");
    if (access.plan !== "BUSINESS")
      throw new PlanLimitError(
        "Staff access requires the Business plan. Paid upgrades are coming soon.",
      );
    const staff = await tx.businessMember.findMany({
      where: {
        businessId: { in: access.businessIds },
        userId: { not: access.ownerId },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    if (
      !staff.some((member) => member.userId === u.id) &&
      staff.length >= access.limits.staff
    )
      throw new PlanLimitError(
        "Business includes five distinct staff accounts across all your businesses, plus the owner.",
      );
    return tx.businessMember.upsert({
      where: { userId_businessId: { userId: u.id, businessId: b.id } },
      update: { role },
      create: { userId: u.id, businessId: b.id, role },
    });
  });
  revalidatePath("/settings");
  redirect("/settings");
}
