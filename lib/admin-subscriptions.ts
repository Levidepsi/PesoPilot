"use server";
import { requireSiteAdmin } from "./admin";
import { db } from "./db";
import { parseSubscriptionChange } from "./admin-subscription-input";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export async function updateSubscription(fd: FormData) {
  const actor = await requireSiteAdmin();
  let businessId = "";
  try {
    const input = parseSubscriptionChange(fd);
    businessId = input.businessId;
    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Business" WHERE id = ${businessId} FOR UPDATE`;
      const business = await tx.business.findUnique({
        where: { id: businessId },
      });
      if (!business) throw new Error("Business no longer exists.");
      const before = await tx.subscription.findUnique({
        where: { businessId },
      });
      const latest = await tx.subscriptionChange.findFirst({
        where: { businessId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const version = JSON.stringify([before, latest?.id ?? null]);
      if (String(fd.get("version")) !== version)
        throw new Error(
          "This subscription changed. Reload the page before saving again.",
        );
      if (
        input.operation === "RENEW" &&
        before?.currentPeriodEnd &&
        input.expiry! <= before.currentPeriodEnd
      )
        throw new Error("Renewal must extend the current expiry date.");
      const after = await tx.subscription.upsert({
        where: { businessId },
        create: {
          businessId,
          plan: input.plan,
          status: input.operation === "CANCEL" ? "CANCELLED" : "ACTIVE",
          currentPeriodEnd: input.expiry,
          provider: "MANUAL",
          providerReference: input.paymentReference,
        },
        update: {
          plan: input.plan,
          status: input.operation === "CANCEL" ? "CANCELLED" : "ACTIVE",
          currentPeriodEnd: input.expiry,
          provider: "MANUAL",
          ...(input.paymentReference
            ? { providerReference: input.paymentReference }
            : {}),
        },
      });
      await tx.subscriptionChange.create({
        data: {
          businessId,
          actorId: actor.id,
          actorEmail: actor.email,
          operation: input.operation,
          reason: input.reason,
          before: before ? JSON.parse(JSON.stringify(before)) : Prisma.JsonNull,
          after: JSON.parse(JSON.stringify(after)),
          paymentReference: input.paymentReference,
          amountCentavos: input.amountCentavos,
        },
      });
    });
  } catch (error) {
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code === "P2002"
          ? "This payment reference has already been recorded."
          : "Could not save the subscription. Please retry."
        : error instanceof Error
          ? error.message
          : "Could not save.";
    redirect(
      `/admin?businessId=${encodeURIComponent(businessId)}&error=${encodeURIComponent(message)}`,
    );
  }
  revalidatePath("/", "layout");
  redirect(`/admin?businessId=${encodeURIComponent(businessId)}&saved=1`);
}
