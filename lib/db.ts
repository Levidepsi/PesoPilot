import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { requireUser } from "./auth";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
export async function business() {
  const u = await requireUser();
  const selected = (await cookies()).get("pesopilot_business")?.value;
  const membership =
    (await db.businessMember.findFirst({
      where: { userId: u.id, ...(selected ? { businessId: selected } : {}) },
      include: { business: true },
    })) ??
    (await db.businessMember.findFirst({
      where: { userId: u.id },
      include: { business: true },
    }));
  if (!membership) throw new Error("No business. Please create a business.");
  return membership.business;
}
export async function authorizedBusiness(roles?: string[]) {
  const u = await requireUser();
  const b = await business();
  const m = await db.businessMember.findUnique({
    where: { userId_businessId: { userId: u.id, businessId: b.id } },
  });
  if (!m || (roles && !roles.includes(m.role)))
    throw new Error("You do not have permission for this operation");
  return { business: b, user: u, role: m.role };
}
