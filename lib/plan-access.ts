import type { Prisma } from "@prisma/client";
import { activePlan, monthWindow, plans, type Plan } from "./plans";

type Client = Prisma.TransactionClient;
export class PlanLimitError extends Error {}
export async function ownerPlan(tx: Client, ownerId: string) {
  const memberships = await tx.businessMember.findMany({
    where: { userId: ownerId, role: "OWNER" },
    include: { business: { include: { subscription: true } } },
  });
  let plan: Plan = "FREE";
  for (const m of memberships) {
    const candidate = m.business.subscription
      ? activePlan(m.business.subscription)
      : "FREE";
    if (
      candidate === "BUSINESS" ||
      (candidate === "STARTER" && plan === "FREE")
    )
      plan = candidate;
  }
  return {
    ownerId,
    plan,
    limits: plans[plan],
    businessIds: memberships.map((m) => m.businessId),
  };
}
export async function businessPlan(tx: Client, businessId: string) {
  const owner = await tx.businessMember.findFirst({
    where: { businessId, role: "OWNER" },
    orderBy: { id: "asc" },
  });
  if (!owner)
    throw new PlanLimitError("This business has no owner. Contact support.");
  return ownerPlan(tx, owner.userId);
}
export async function lockOwner(tx: Client, ownerId: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${ownerId} FOR UPDATE`;
}
export async function checkWrite(
  tx: Client,
  businessId: string,
  kind: "transaction" | "customer" | "inventory" | "sale",
) {
  const context = await businessPlan(tx, businessId);
  await lockOwner(tx, context.ownerId);
  const access = await ownerPlan(tx, context.ownerId);
  if ((kind === "inventory" || kind === "sale") && access.plan === "FREE")
    throw new PlanLimitError(
      "Inventory and sales entry require Starter or Business. Contact us through Settings to subscribe manually. Your saved records remain available.",
    );
  if (kind === "transaction" && access.plan === "FREE") {
    const count = await tx.transaction.count({
      where: { businessId, createdAt: monthWindow() },
    });
    if (count >= access.limits.transactions)
      throw new PlanLimitError(
        "Your Free plan has reached 100 transactions this month. New entries reopen next month; your history remains available.",
      );
  }
  if (kind === "customer" && access.plan === "FREE") {
    const count = await tx.customer.count({ where: { businessId } });
    if (count >= access.limits.customers)
      throw new PlanLimitError(
        "Your Free plan has reached 20 customers. Existing customers and records remain available.",
      );
  }
  return access;
}
