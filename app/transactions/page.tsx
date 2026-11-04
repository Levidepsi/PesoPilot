import { pageMetadata } from "@/lib/site-metadata";
import EmptyState from "@/components/EmptyState";
import SubmitButton from "@/components/SubmitButton";
import { db, business } from "@/lib/db";
import { addTransaction } from "@/lib/actions";
import { pesos, dateLabel } from "@/lib/money";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Transactions",
  "Record income and expenses and review your saved transaction history.",
);

export default async function Transactions() {
  const b = await business();
  const rows = await db.transaction.findMany({
    where: { businessId: b.id },
    orderBy: { date: "desc" },
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Transactions</h1>
          <p>Record income and expenses in one place.</p>
        </div>
      </div>
      <div className="twocol">
        <section className="panel">
          <h2>Add Transaction</h2>
          <p className="hint">All amounts are in Philippine pesos.</p>
          <form action={addTransaction} className="form">
            <label>
              Type
              <select name="type" required>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </label>
            <label>
              Amount (₱)
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 250.00"
                required
              />
            </label>
            <label>
              Category
              <input
                name="category"
                maxLength={80}
                placeholder="e.g. Store Sales, Rent, Supplies"
                required
              />
            </label>
            <label>
              Payment method
              <select name="method">
                <option value="CASH">Cash</option>
                <option value="GCASH">GCash</option>
                <option value="MAYA">Maya</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label>
              Notes (optional)
              <textarea
                name="note"
                maxLength={300}
                rows={3}
                placeholder="Transaction description"
              />
            </label>
            <SubmitButton>Save Transaction</SubmitButton>
          </form>
        </section>
        <section className="panel">
          <div className="panelhead">
            <div>
              <h2>Transaction History</h2>
              <p>{rows.length} transactions recorded</p>
            </div>
          </div>
          <div className="itemlist">
            {rows.map((t) => (
              <div className="listitem" key={t.id}>
                <div
                  className={`txicon ${t.type === "INCOME" ? "income" : "expense"}`}
                >
                  {t.type === "INCOME" ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowDownRight size={18} />
                  )}
                </div>
                <div className="grow">
                  <strong>{t.category}</strong>
                  <small>
                    {dateLabel(t.date)} · {t.method.replace("_", " ")}
                  </small>
                  {t.note && <small>{t.note}</small>}
                </div>
                <strong
                  className={t.type === "INCOME" ? "moneygreen" : "moneyorange"}
                >
                  {t.type === "INCOME" ? "+" : "−"}
                  {pesos(t.amount)}
                </strong>
              </div>
            ))}
            {rows.length === 0 && (
              <EmptyState
                title="A fresh start for your finances"
                description="Record an income or expense using the form. Your full history will appear here."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
