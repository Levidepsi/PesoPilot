import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { PlanLimitError } from "./plan-access";
import { redirect } from "next/navigation";
export async function planMutation<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await db.$transaction(work, { timeout: 15000 });
  } catch (error) {
    if (error instanceof PlanLimitError)
      redirect(
        `/settings?planMessage=${encodeURIComponent(error.message)}#plans`,
      );
    throw error;
  }
}
