import { pageMetadata } from "@/lib/site-metadata";
import SubmitButton from "@/components/SubmitButton";
import { businessPlan } from "@/lib/plan-access";
import Link from "next/link";
import { db, business } from "@/lib/db";
import { pesos } from "@/lib/money";
import { addProduct, updateStock } from "@/lib/commerce-actions";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Inventory",
  "Manage your business products, stock and prices.",
);

export default async function Inventory() {
  const b = await business();
  const access = await businessPlan(db, b.id);
  const canWrite = access.plan !== "FREE";
  const products = await db.product.findMany({
    where: { businessId: b.id },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Inventory</h1>
          <p>Manage products, stock levels and selling prices.</p>
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
          <h2>Add Product</h2>
          <form action={addProduct} className="form">
            <fieldset className="plan-fieldset" disabled={!canWrite}>
              <label>
                Product name
                <input name="name" required maxLength={100} />
              </label>
              <label>
                SKU (optional)
                <input name="sku" />
              </label>
              <label>
                Purchase cost (₱)
                <input
                  type="number"
                  name="cost"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Selling price (₱)
                <input
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Opening stock
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  defaultValue="0"
                  required
                />
              </label>
              <label>
                Low-stock alert at
                <input
                  type="number"
                  name="lowStockAt"
                  min="0"
                  defaultValue="5"
                />
              </label>
              <SubmitButton>Add Product</SubmitButton>
            </fieldset>
          </form>
        </section>
        <section className="panel">
          <h2>Product Catalog ({products.length})</h2>
          <div className="itemlist">
            {products.map((p) => (
              <div className="listitem" key={p.id}>
                <div className="personicon">📦</div>
                <div className="grow">
                  <strong>{p.name}</strong>
                  <small>
                    {p.sku || "No SKU"} · Cost {pesos(p.cost)} · Sell{" "}
                    {pesos(p.price)}
                  </small>
                  <small>
                    {p.stock <= p.lowStockAt ? "⚠️ Low stock · " : ""}Stock:{" "}
                    {p.stock}
                  </small>
                </div>
                <form action={updateStock} className="stockform">
                  <fieldset className="plan-fieldset" disabled={!canWrite}>
                    <input type="hidden" name="productId" value={p.id} />
                    <input
                      type="number"
                      name="delta"
                      aria-label="Stock adjustment"
                      placeholder="+/-"
                      required
                      step="1"
                    />
                    <button className="btn">Adjust</button>
                  </fieldset>
                </form>
              </div>
            ))}
            {products.length === 0 && <p className="muted">No products yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
