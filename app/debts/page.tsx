import { pageMetadata } from "@/lib/site-metadata";
import SubmitButton from "@/components/SubmitButton";
import { db, business } from "@/lib/db";
import { addDebt, payDebt } from "@/lib/actions";
import { pesos, dateLabel } from "@/lib/money";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Utang tracker",
  "Track customer credit, repayments and outstanding balances.",
);

export default async function Debts() {
  const b = await business();
  const [customers, debts] = await Promise.all([
    db.customer.findMany({
      where: { businessId: b.id },
      orderBy: { name: "asc" },
    }),
    db.debt.findMany({
      where: { businessId: b.id },
      include: { customer: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Debt Tracker</h1>
          <p>Track customer credit, collections and partial payments.</p>
        </div>
      </div>
      <div className="twocol">
        <section className="panel">
          <h2>Record New Debt</h2>
          <form action={addDebt} className="form">
            <label>
              Customer
              <select name="customerId" required>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount (₱)
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 500.00"
              />
            </label>
            <label>
              Description
              <input
                name="description"
                maxLength={300}
                placeholder="Groceries, supplies, etc."
              />
            </label>
            <label>
              Due date (optional)
              <input name="dueDate" type="date" />
            </label>
            <button className="btn primary" disabled={customers.length === 0}>
              Create Debt
            </button>
            {customers.length === 0 && (
              <p className="hint">
                Add a customer first before creating a debt.
              </p>
            )}
          </form>
        </section>
        <section className="panel">
          <div className="panelhead">
            <div>
              <h2>Outstanding Debts</h2>
              <p>{debts.length} total records</p>
            </div>
          </div>
          <div className="debtslist">
            {debts.map((d) => {
              const paid = d.payments.reduce((s, p) => s + p.amount, 0);
              const left = d.amount - paid;
              return (
                <div className="debtcard" key={d.id}>
                  <div className="debtrow">
                    <div>
                      <strong>{d.customer.name}</strong>
                      <small>
                        {d.description || "Customer credit"} ·{" "}
                        {d.dueDate
                          ? `Due ${dateLabel(d.dueDate)}`
                          : "No due date"}
                      </small>
                    </div>
                    <span
                      className={`status ${left === 0 ? "paid" : d.dueDate && d.dueDate.getTime() < Date.now() ? "overdue" : "pending"}`}
                    >
                      {left === 0
                        ? "Paid"
                        : d.dueDate && d.dueDate.getTime() < Date.now()
                          ? "Overdue"
                          : "Unpaid"}
                    </span>
                  </div>
                  <div className="debtrow">
                    <span className="muted">
                      Original {pesos(d.amount)} · Paid {pesos(paid)}
                    </span>
                    <strong className="moneyorange">{pesos(left)} left</strong>
                  </div>
                  <div className="progress">
                    <div style={{ width: `${(paid / d.amount) * 100}%` }} />
                  </div>
                  {left > 0 && (
                    <form action={payDebt} className="payform">
                      <input type="hidden" name="debtId" value={d.id} />
                      <input
                        aria-label="Payment amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={(left / 100).toFixed(2)}
                        required
                        placeholder="Payment ₱"
                      />
                      <select name="method" aria-label="Payment method">
                        <option value="CASH">Cash</option>
                        <option value="GCASH">GCash</option>
                        <option value="MAYA">Maya</option>
                        <option value="BANK_TRANSFER">Bank</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <SubmitButton>Collect</SubmitButton>
                    </form>
                  )}
                </div>
              );
            })}
            {debts.length === 0 && (
              <p className="muted">No debts recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
