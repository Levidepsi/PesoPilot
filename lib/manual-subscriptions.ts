import { plans, type Plan } from "@/lib/plans";

export const subscriptionWhatsApp = "+63 928 414 1394";

export function subscriptionInquiry(
  plan: Exclude<Plan, "FREE">,
  yearly: boolean,
) {
  const selected = plans[plan];
  const amount = yearly ? selected.annual : selected.monthly;
  const message = [
    `Hi! I'd like to subscribe to or renew PesoPilot ${selected.name}.`,
    `Billing: ${yearly ? "Yearly" : "Monthly"}, PHP ${amount.toLocaleString("en-PH")} ${yearly ? "upfront for one year" : "for one month"}.`,
    "Please confirm payment instructions, activation time, expiry, and refund terms before I pay.",
    "My account email: [enter email]",
    "My business name: [enter business name]",
  ].join("\n");
  return `https://wa.me/639284141394?text=${encodeURIComponent(message)}`;
}
