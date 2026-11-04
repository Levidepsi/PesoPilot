import { db, business } from "./db";
export async function summary() {
  const b = await business();
  const [transactions, debts] = await Promise.all([
    db.transaction.findMany({
      where: { businessId: b.id },
      orderBy: { date: "desc" },
    }),
    db.debt.findMany({
      where: { businessId: b.id },
      include: { customer: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const debtList = debts.map((d) => ({
    ...d,
    remaining: Math.max(
      0,
      d.amount - d.payments.reduce((s, p) => s + p.amount, 0),
    ),
  }));
  const unpaid = debtList.reduce((s, d) => s + d.remaining, 0);
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    const month = d.getMonth(),
      year = d.getFullYear();
    const matching = transactions.filter((t) => {
      const local = new Date(
        t.date.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
      );
      return local.getMonth() === month && local.getFullYear() === year;
    });
    return {
      month: d.toLocaleDateString("en-PH", { month: "short" }),
      income:
        matching
          .filter((t) => t.type === "INCOME")
          .reduce((s, t) => s + t.amount, 0) / 100,
      expenses:
        matching
          .filter((t) => t.type === "EXPENSE")
          .reduce((s, t) => s + t.amount, 0) / 100,
    };
  });
  return {
    b,
    transactions,
    debtList,
    income,
    expenses,
    unpaid,
    monthly,
    balance: b.openingBalance + income - expenses,
  };
}
