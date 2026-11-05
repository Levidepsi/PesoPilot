import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { business, db } from "@/lib/db";
import { pesos, dateLabel } from "@/lib/money";
import CustomerPaymentForm from "@/components/CustomerPaymentForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customer details" };

export default async function CustomerDetails({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const b = await business();
  const { customerId } = await params;
  const { saved } = await searchParams;
  const customer = await db.customer.findFirst({
    where: { id: customerId, businessId: b.id },
    include: {
      debts: {
        orderBy: { createdAt: "desc" },
        include: { payments: { include: { transaction: true } } },
      },
    },
  });
  if (!customer) notFound();
  const debts = customer.debts.map((debt) => {
    const paid = debt.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    return { ...debt, paid, remaining: Math.max(0, debt.amount - paid) };
  });
  const outstanding = debts.filter((debt) => debt.remaining > 0);
  const overdue = outstanding.filter(
    (debt) => debt.dueDate && debt.dueDate.getTime() < Date.now(),
  );
  const payments = debts
    .flatMap((debt) =>
      debt.payments.map((payment) => ({
        ...payment,
        description: debt.description || "Customer credit",
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return (
    <>
      <div className="pagehead">
        <div>
          <span className="eyebrow">CUSTOMER DETAILS</span>
          <h1>{customer.name}</h1>
          <p>{customer.phone || "No phone number"}</p>
        </div>
        <Link
          href="/customers"
          className="btn"
          aria-label="Close customer details"
        >
          <X size={20} />
        </Link>
      </div>
      {saved === "1" && (
        <p className="payment-success" role="status">
          Payment recorded. The balance and income records have been updated.
        </p>
      )}
      {customer.note && <p className="panel customer-note">{customer.note}</p>}
      <div className="customer-balances">
        <section className="panel">
          <h2>Outstanding balance</h2>
          <strong className="moneyorange">
            {pesos(outstanding.reduce((sum, debt) => sum + debt.remaining, 0))}
          </strong>
          <p className="hint">{outstanding.length} unpaid debts</p>
        </section>
        <section className="panel">
          <h2>Overdue</h2>
          <strong className="moneyorange">
            {pesos(overdue.reduce((sum, debt) => sum + debt.remaining, 0))}
          </strong>
          <p className="hint">{overdue.length} overdue debts</p>
        </section>
        <section className="panel">
          <h2>Total collected</h2>
          <strong className="moneygreen">
            {pesos(payments.reduce((sum, payment) => sum + payment.amount, 0))}
          </strong>
          <p className="hint">{payments.length} payments recorded</p>
        </section>
      </div>
      <div className="twocol customer-detail-grid">
        <section className="panel" id="record-payment">
          <h2>Record payment</h2>
          <CustomerPaymentForm
            debts={outstanding.map((debt) => ({
              id: debt.id,
              remaining: debt.remaining,
              description: `${debt.description || "Customer credit"} (${dateLabel(debt.createdAt)})`,
            }))}
          />
        </section>
        <div className="stack">
          <section className="panel">
            <h2>Debts and balances</h2>
            {!debts.length && (
              <p className="hint">No debts recorded for this customer.</p>
            )}
            {debts.map((debt) => (
              <article className="debtcard" key={debt.id}>
                <div className="debtrow">
                  <strong>{debt.description || "Customer credit"}</strong>
                  <span
                    className={`status ${!debt.remaining ? "paid" : overdue.includes(debt) ? "overdue" : "pending"}`}
                  >
                    {!debt.remaining
                      ? "Paid"
                      : overdue.includes(debt)
                        ? "Overdue"
                        : "Unpaid"}
                  </span>
                </div>
                <p className="hint">
                  {debt.dueDate
                    ? `Due ${dateLabel(debt.dueDate)}`
                    : "No due date"}
                </p>
                <div className="debtrow">
                  <span className="hint">
                    Original {pesos(debt.amount)} · Paid {pesos(debt.paid)}
                  </span>
                  <strong>{pesos(debt.remaining)} left</strong>
                </div>
              </article>
            ))}
          </section>
          <section className="panel">
            <h2>Payment history</h2>
            {!payments.length && (
              <p className="hint">
                Payments will appear here after you record a collection.
              </p>
            )}
            {payments.map((payment) => (
              <article className="listitem" key={payment.id}>
                <div className="grow">
                  <strong>{payment.description}</strong>
                  <small>
                    {dateLabel(payment.createdAt)} ·{" "}
                    {payment.transaction.method.replaceAll("_", " ")}
                  </small>
                </div>
                <strong className="moneygreen">{pesos(payment.amount)}</strong>
              </article>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
