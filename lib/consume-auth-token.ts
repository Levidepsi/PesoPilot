import type { PrismaClient } from "@prisma/client";
import { tokenHash, validToken } from "./auth-tokens";

export async function consumeAuthToken(
  db: PrismaClient,
  token: string,
  purpose: "VERIFY" | "RESET",
  passwordHash?: string,
) {
  if (!validToken(token) || (purpose === "RESET" && !passwordHash))
    return false;
  return db.$transaction(async (tx) => {
    const record = await tx.authToken.findUnique({
      where: { tokenHash: tokenHash(token) },
    });
    if (!record || record.purpose !== purpose || record.expiresAt <= new Date())
      return false;
    const consumed = await tx.authToken.deleteMany({
      where: { id: record.id, expiresAt: { gt: new Date() } },
    });
    if (!consumed.count) return false;
    await tx.user.update({
      where: { id: record.userId },
      data:
        purpose === "VERIFY"
          ? { emailVerifiedAt: new Date() }
          : { passwordHash, sessionVersion: { increment: 1 } },
    });
    if (purpose === "RESET")
      await tx.authToken.deleteMany({
        where: { userId: record.userId, purpose: "RESET" },
      });
    return true;
  });
}
