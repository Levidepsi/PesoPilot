import Link from "next/link";
import { pageMetadata } from "@/lib/site-metadata";
import EmptyState from "@/components/EmptyState";
import SubmitButton from "@/components/SubmitButton";
import { db, business } from "@/lib/db";
import { addCustomer } from "@/lib/actions";
import { pesos } from "@/lib/money";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Customers",
  "Manage customer contact details and outstanding balances.",
);

export default async function Customers() {
  const b = await business();
  const rows = await db.customer.findMany({
    where: { businessId: b.id },
    include: { debts: { include: { payments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Customers</h1>
          <p>Manage customer information and outstanding balances.</p>
        </div>
      </div>
      <div className="twocol">
        <section className="panel">
          <h2>Add Customer</h2>
          <form action={addCustomer} className="form">
            <label>
              Full name
              <input
                name="name"
                required
                maxLength={100}
                placeholder="Customer name"
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                autoComplete="tel"
                name="phone"
                maxLength={30}
                placeholder="09xxxxxxxxx"
              />
            </label>
            <label>
              Notes
              <textarea
                name="note"
                rows={3}
                maxLength={300}
                placeholder="Optional notes"
              />
            </label>
            <SubmitButton>Save Customer</SubmitButton>
          </form>
        </section>
        <section className="panel">
          <div className="panelhead">
            <div>
              <h2>Customer Directory</h2>
              <p>{rows.length} customers</p>
            </div>
          </div>
          <div className="itemlist">
            {rows.map((c) => {
              const unpaid = c.debts.reduce(
                (s, d) =>
                  s + d.amount - d.payments.reduce((x, p) => x + p.amount, 0),
                0,
              );
              return (
                <Link
                  href={`/customers/${c.id}`}
                  className="listitem customer-link"
                  key={c.id}
                >
                  <div className="personicon">{c.name.slice(0, 1)}</div>
                  <div className="grow">
                    <strong>{c.name}</strong>
                    <small>{c.phone || "No phone number"}</small>
                  </div>
                  <div className="right">
                    <strong
                      className={unpaid > 0 ? "moneyorange" : "moneygreen"}
                    >
                      {pesos(unpaid)}
                    </strong>
                    <small>Unpaid balance</small>
                    <small className="customer-view">View customer ?</small>
                  </div>
                </Link>
              );
            })}
            {rows.length === 0 && (
              <EmptyState
                title="Meet your first customer"
                description="Add a customer using the form to keep their contact details and balances in one place."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
