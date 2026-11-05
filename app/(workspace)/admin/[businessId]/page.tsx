import Link from "next/link";
import { X } from "lucide-react";
import { notFound } from "next/navigation";
import { requireSiteAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { businessPlan } from "@/lib/plan-access";
import { updateSubscription } from "@/lib/admin-subscriptions";
import SubmitButton from "@/components/SubmitButton";
import { pageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Subscription admin",
  "Manage subscriptions and verified payments.",
);
const dateLabel = (date: Date | null) =>
  date
    ? date.toLocaleString("en-PH", { timeZone: "Asia/Manila" })
    : "No expiry";

export default async function ManageCustomer({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ q?: string; error?: string; saved?: string }>;
}) {
  await requireSiteAdmin();
  const route = await params;
  const query = await searchParams;
  const selected = route.businessId
    ? await db.business.findUnique({
        where: { id: route.businessId },
        include: {
          subscription: true,
          members: {
            where: { role: "OWNER" },
            select: { user: { select: { email: true } } },
          },
        },
      })
    : null;
  if (!selected) notFound();
  const history = selected
    ? await db.subscriptionChange.findMany({
        where: { businessId: selected.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 50,
      })
    : [];
  const effective = selected ? await businessPlan(db, selected.id) : null;
  const subscription = selected?.subscription;
  const defaultExpiry = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd.getTime() + 8 * 3600000)
        .toISOString()
        .slice(0, 10)
    : "";
  return (
    <>
      {query.error && (
        <p className="panel" role="alert">
          {query.error}
        </p>
      )}
      {query.saved && (
        <p className="panel" role="status">
          Subscription saved. The payment record and change history were saved
          together.
        </p>
      )}
      {selected && (
        <div className="stack">
          <section className="panel">
            <div className="pagehead">
              <h1>Manage {selected.name}</h1>
              <Link
                className="btn"
                href={`/admin?q=${encodeURIComponent(query.q ?? "")}`}
                aria-label="Close customer editor"
                title="Close"
              >
                <X size={20} />
              </Link>
            </div>
            <p>{selected.members.map((m) => m.user.email).join(", ")}</p>
            <p>
              Stored subscription:{" "}
              <strong>
                {subscription?.plan ?? "FREE"} /{" "}
                {subscription?.status ?? "INACTIVE"}
              </strong>
              . Expiry: {dateLabel(subscription?.currentPeriodEnd ?? null)}{" "}
              (Philippine time).
            </p>
            <p>
              Effective account plan: <strong>{effective?.limits.name}</strong>.
              Paid access is shared across this owner’s businesses. Another
              active subscription may preserve paid access after cancellation
              here.
            </p>
            <form
              action={updateSubscription}
              className="form"
              key={JSON.stringify([subscription, history[0]?.id])}
            >
              <input type="hidden" name="q" value={query.q ?? ""} />
              <input type="hidden" name="businessId" value={selected.id} />
              <input
                type="hidden"
                name="version"
                value={JSON.stringify([subscription, history[0]?.id ?? null])}
              />
              <label>
                Action
                <select name="operation">
                  <option value="ACTIVATE">
                    Activate with verified payment
                  </option>
                  <option value="RENEW">Renew with verified payment</option>
                  <option value="CHANGE">Change / correct subscription</option>
                  <option value="CANCEL">Cancel immediately</option>
                </select>
              </label>
              <label>
                Plan
                <select name="plan" defaultValue={subscription?.plan ?? "FREE"}>
                  <option>FREE</option>
                  <option>STARTER</option>
                  <option>BUSINESS</option>
                </select>
              </label>
              <label>
                Paid through (end of day, Philippine time)
                <input type="date" name="expiry" defaultValue={defaultExpiry} />
              </label>
              <p className="hint">
                Choose the agreed expiry. Renewal must extend the current
                expiry. Free plans and cancellations do not need an expiry.
                Cancellation takes effect immediately and does not issue a
                refund.
              </p>
              <label>
                Reason / admin note
                <input
                  name="reason"
                  required
                  maxLength={500}
                  placeholder="e.g. Monthly renewal verified through GCash"
                />
              </label>
              <label>
                Payment reference (include channel, e.g. GCASH-12345)
                <input name="paymentReference" maxLength={150} />
              </label>
              <label>
                Amount received (PHP)
                <input name="amount" type="number" min="0.01" step="0.01" />
              </label>
              <label>
                <input name="verified" type="checkbox" /> I verified this
                payment in the merchant account.
              </label>
              <p className="hint">
                Activation and renewal require a verified payment. Corrections
                can be saved without a new payment. References cannot be reused.
              </p>
              <SubmitButton pendingLabel="Saving subscription…">
                Save subscription
              </SubmitButton>
            </form>
          </section>
          <section className="panel">
            <h2>Change and payment history</h2>
            <p className="hint">
              Latest 50 changes, in Philippine time. Earlier records remain
              stored.
            </p>
            {!history.length && <p>No admin changes recorded yet.</p>}
            {history.map((change) => (
              <article key={change.id} className="panel">
                <h3>
                  {change.operation} · {dateLabel(change.createdAt)}
                </h3>
                <p>By {change.actorEmail}</p>
                <p>{change.reason}</p>
                {change.paymentReference && (
                  <p>
                    Verified payment: PHP{" "}
                    {(change.amountCentavos! / 100).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    · {change.paymentReference}
                  </p>
                )}
                <details>
                  <summary>Before and after</summary>
                  <pre
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {JSON.stringify(
                      { before: change.before, after: change.after },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </article>
            ))}
          </section>
        </div>
      )}
    </>
  );
}
