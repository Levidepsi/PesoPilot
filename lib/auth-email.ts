import "server-only";
import { db } from "./db";
import { newToken, tokenHash } from "./auth-tokens";
import { emailConfig, sendAuthEmail } from "./email";
export async function issueAuthEmail(
  userId: string,
  purpose: "VERIFY" | "RESET",
) {
  emailConfig();
  const token = newToken();
  const now = new Date();
  const column = purpose === "VERIFY" ? "verificationSentAt" : "resetSentAt";
  const user = await db.$transaction(async (tx) => {
    const claimed = await tx.user.updateMany({
      where: {
        id: userId,
        OR: [
          { [column]: null },
          { [column]: { lt: new Date(now.getTime() - 60000) } },
        ],
      },
      data: { [column]: now },
    });
    if (!claimed.count) return null;
    await tx.authToken.deleteMany({ where: { userId, purpose } });
    await tx.authToken.create({
      data: {
        userId,
        purpose,
        tokenHash: tokenHash(token),
        expiresAt: new Date(
          now.getTime() + (purpose === "VERIFY" ? 86400000 : 1800000),
        ),
      },
    });
    return tx.user.findUniqueOrThrow({ where: { id: userId } });
  });
  if (!user) return;
  try {
    await sendAuthEmail(user.email, token, purpose);
  } catch {
    await db.authToken.deleteMany({ where: { tokenHash: tokenHash(token) } });
    // Keep the cooldown on failed deliveries to prevent provider retry abuse.
    throw new Error("Email delivery failed");
  }
}
