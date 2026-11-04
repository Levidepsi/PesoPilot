import { pageMetadata } from "@/lib/site-metadata";
import SubmitButton from "@/components/SubmitButton";
import PlanCards from "@/components/PlanCards";
import { businessPlan, ownerPlan } from "@/lib/plan-access";
import { monthWindow } from "@/lib/plans";
import { db, business } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { renameBusiness } from "@/lib/actions";
import { addStaff, createBusiness } from "@/lib/account-actions";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Settings",
  "Manage your business, team and PesoPilot plan.",
);

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ planMessage?: string }>;
}) {
  const { planMessage } = await searchParams;
  const b = await business(),
    u = await requireUser();
  const members = await db.businessMember.findMany({
    where: { businessId: b.id },
    include: { user: true },
  });
  const subscription = await db.subscription.findUnique({
    where: { businessId: b.id },
  });
  const access = await businessPlan(db, b.id);
  const ownAccess = await ownerPlan(db, u.id);
  const [transactionCount, customerCount] = await Promise.all([
    db.transaction.count({
      where: { businessId: b.id, createdAt: monthWindow() },
    }),
    db.customer.count({ where: { businessId: b.id } }),
  ]);
  const mine = members.find((m) => m.userId === u.id);
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Settings</h1>
          <p>Manage business details, team and subscription status.</p>
        </div>
      </div>
      {planMessage && (
        <p className="panel" role="alert">
          {planMessage}
        </p>
      )}
      <div className="twocol">
        <div className="stack">
          <section className="panel">
            <h2>Business Profile</h2>
            <form action={renameBusiness} className="form">
              <label>
                Business name
                <input name="name" defaultValue={b.name} required />
              </label>
              <SubmitButton>Save name</SubmitButton>
            </form>
          </section>
          <section className="panel">
            <h2>Create Another Business</h2>
            <p className="hint">
              Your owner account uses {ownAccess.businessIds.length} of{" "}
              {ownAccess.limits.businesses} business slots. Business includes up
              to three.
            </p>
            <form action={createBusiness} className="form">
              <fieldset
                className="plan-fieldset"
                disabled={
                  ownAccess.businessIds.length >= ownAccess.limits.businesses
                }
              >
                <label>
                  New business name
                  <input name="name" required />
                </label>
                <SubmitButton>Create Business</SubmitButton>
              </fieldset>
            </form>
          </section>
        </div>
        <div className="stack">
          <section className="panel">
            <h2>Team Members</h2>
            <div className="itemlist">
              {members.map((m) => (
                <div key={m.id} className="listitem">
                  <div className="personicon">{m.user.name.slice(0, 1)}</div>
                  <div className="grow">
                    <strong>{m.user.name}</strong>
                    <small>{m.user.email}</small>
                  </div>
                  <span className="chip">{m.role}</span>
                </div>
              ))}
            </div>
            {access.plan !== "BUSINESS" && (
              <p className="hint">
                Adding staff requires Business. Existing memberships are
                preserved.
              </p>
            )}
            {access.plan === "BUSINESS" &&
              ["OWNER", "ADMIN"].includes(mine?.role || "") && (
                <form action={addStaff} className="form">
                  <p className="hint">
                    Staff must register their own account first.
                  </p>
                  <label>
                    Staff email
                    <input name="email" type="email" required />
                  </label>
                  <label>
                    Role
                    <select name="role">
                      <option>STAFF</option>
                      <option>VIEWER</option>
                      <option>ADMIN</option>
                    </select>
                  </label>
                  <SubmitButton>Add / Update Staff</SubmitButton>
                </form>
              )}
          </section>
          <section className="panel">
            <h2>Subscription</h2>
            <p>
              Current plan: <strong>{access.limits.name}</strong>
            </p>
            <p>
              {transactionCount} /{" "}
              {Number.isFinite(access.limits.transactions)
                ? access.limits.transactions
                : "Unlimited"}{" "}
              transactions this month ? {customerCount} /{" "}
              {Number.isFinite(access.limits.customers)
                ? access.limits.customers
                : "Unlimited"}{" "}
              customers
            </p>
            <p className="hint">
              Status: {subscription?.status || "INACTIVE"}. Paid subscriptions
              are not activated until you configure and verify a payment
              provider. No fake checkout or charges are included.
            </p>
          </section>
        </div>
      </div>
      <PlanCards current={access.plan} />
    </>
  );
}
