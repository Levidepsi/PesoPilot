import "server-only";
import { emailAuthEnabled } from "./auth-config";
export function emailConfig() {
  if (!emailAuthEnabled()) throw new Error("Email authentication is disabled");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const origin = new URL(process.env.APP_URL || "http://localhost:3000");
  if (
    !apiKey ||
    !from ||
    !["http:", "https:"].includes(origin.protocol) ||
    (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
  )
    throw new Error("Email delivery is not configured");
  return { apiKey, from, origin: origin.origin };
}
export async function sendAuthEmail(
  to: string,
  token: string,
  purpose: "VERIFY" | "RESET",
) {
  const { apiKey, from, origin } = emailConfig();
  const verify = purpose === "VERIFY";
  const link = `${origin}/${verify ? "verify-email" : "reset-password"}?token=${token}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: verify
        ? "Verify your PesoPilot email"
        : "Reset your PesoPilot password",
      text: `${verify ? "Verify your email" : "Reset your password"}: ${link}\n\nThis link expires in ${verify ? "24 hours" : "30 minutes"} and can only be used once. If you did not request this, ignore this email.`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Email delivery failed");
}
