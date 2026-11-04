export const plans = {
  FREE: {
    name: "Free",
    monthly: 0,
    annual: 0,
    businesses: 1,
    staff: 0,
    transactions: 100,
    customers: 20,
    features: [
      "1 business · owner only",
      "100 transactions per month",
      "Up to 20 customers",
      "Income, expense and Debt tracking",
      "Basic dashboard",
      "Full saved transaction history",
    ],
  },
  STARTER: {
    name: "Starter",
    monthly: 149,
    annual: 1428,
    businesses: 1,
    staff: 0,
    transactions: Infinity,
    customers: Infinity,
    features: [
      "1 business · owner only",
      "Unlimited transactions, customers and Debt records",
      "Inventory and sales tracking",
      "Low-stock indicators",
      "Monthly cash-flow reports",
      "CSV exports",
      "Full saved transaction history",
    ],
  },
  BUSINESS: {
    name: "Business",
    monthly: 399,
    annual: 3828,
    businesses: 3,
    staff: 5,
    transactions: Infinity,
    customers: Infinity,
    features: [
      "Up to 3 businesses for one owner",
      "Everything in Starter",
      "5 staff accounts total across your businesses",
      "Owner account included separately",
      "Admin, staff and viewer permissions",
    ],
  },
} as const;
export type Plan = keyof typeof plans;
export function activePlan(
  subscription: { plan: string; status: string; currentPeriodEnd: Date | null },
  now = new Date(),
): Plan {
  if (
    subscription.status !== "ACTIVE" ||
    (subscription.currentPeriodEnd && subscription.currentPeriodEnd <= now)
  )
    return "FREE";
  return subscription.plan === "BUSINESS" || subscription.plan === "STARTER"
    ? subscription.plan
    : "FREE";
}
export function monthWindow(now = new Date()) {
  const local = new Date(now.getTime() + 8 * 3600000);
  const year = local.getUTCFullYear(),
    month = local.getUTCMonth();
  return {
    gte: new Date(Date.UTC(year, month, 1) - 8 * 3600000),
    lt: new Date(Date.UTC(year, month + 1, 1) - 8 * 3600000),
  };
}
