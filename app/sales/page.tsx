import { pageMetadata } from "@/lib/site-metadata";
import { businessPlan } from "@/lib/plan-access";
import Link from "next/link";
import { db, business } from "@/lib/db";
import { pesos, dateLabel } from "@/lib/money";
import { createSale } from "@/lib/commerce-actions";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Sales",
  "Record and review your product sales.",
);

export default async function Sales() {
  const b = await business();
  const access = await businessPlan(db, b.id);
  const canWrite = access.plan !== "FREE";
  const [products, sales] = await Promise.all([
    db.product.findMany({
      where: { businessId: b.id, active: true, stock: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
    db.sale.findMany({
      where: { businessId: b.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Sales</h1>
          <p>Record product sales and automatically deduct stock.</p>
        </div>
      </div>
      {!canWrite && (
        <p className="panel">
          Your saved records are available to view. New inventory and sales
          entries require Starter or Business.{" "}
          <Link href="/settings#plans">View plans</Link>
        </p>
      )}
      <div className="twocol">
        <section className="panel">
          <h2>New Sale</h2>
          <p className="hint">
            Single-product checkout for MVP. More advanced cart checkout can be
            added later.
          </p>
          <form action={createSale} className="form">
            <fieldset className="plan-fieldset" disabled={!canWrite}>
              <label>
                Product
                <select name="productId" required>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {pesos(p.price)} ({p.stock} available)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="1"
                  required
                />
              </label>
              <label>
                Payment method
                <select name="method">
                  <option>CASH</option>
                  <option>GCASH</option>
                  <option>MAYA</option>
                  <option>BANK_TRANSFER</option>
                  <option>OTHER</option>
                </select>
              </label>
              <button className="btn primary" disabled={!products.length}>
                Complete Sale
              </button>
            </fieldset>
          </form>
        </section>
        <section className="panel">
          <h2>Recent Sales</h2>
          <div className="itemlist">
            {sales.map((s) => (
              <div className="listitem" key={s.id}>
                <div className="txicon income">₱</div>
                <div className="grow">
                  <strong>
                    {s.items
                      .map((i) => `${i.quantity} × ${i.product.name}`)
                      .join(", ")}
                  </strong>
                  <small>
                    {dateLabel(s.createdAt)} · {s.method}
                  </small>
                </div>
                <strong className="moneygreen">{pesos(s.total)}</strong>
              </div>
            ))}
            {!sales.length && <p className="muted">No sales recorded.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
