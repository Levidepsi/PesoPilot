import Link from "next/link";
import { requireSiteAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
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

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    businessId?: string;
    error?: string;
    saved?: string;
  }>;
}) {
  await requireSiteAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const businesses = await db.business.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            {
              members: {
                some: {
                  role: "OWNER",
                  user: { email: { contains: q, mode: "insensitive" } },
                },
              },
            },
          ],
        }
      : {},
    include: {
      subscription: true,
      members: {
        where: { role: "OWNER" },
        select: { user: { select: { email: true } } },
      },
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <span className="eyebrow">SITE ADMIN ONLY</span>
          <h1>Customer overview</h1>
          <p>
            Verify payment in your merchant account before activating or
            renewing a plan.
          </p>
        </div>
      </div>
      {params.error && (
        <p className="panel" role="alert">
          {params.error}
        </p>
      )}
      {params.saved && (
        <p className="panel" role="status">
          Subscription saved. The payment record and change history were saved
          together.
        </p>
      )}
      <section className="panel">
        <form action="/admin" className="form">
          <label>
            Search by owner email or business name
            <input name="q" defaultValue={q} maxLength={100} />
          </label>
          <button className="btn" type="submit">
            Search
          </button>
        </form>
        <p className="hint">
          Showing up to 30 businesses. Narrow your search to find older
          accounts.
        </p>
        <div className="itemlist">
          {businesses.map((b) => (
            <div className="listitem" key={b.id}>
              <div className="grow">
                <strong>{b.name}</strong>
                <small>{b.members.map((m) => m.user.email).join(", ")}</small>
                <small>
                  {b.subscription?.plan ?? "FREE"} ·{" "}
                  {b.subscription?.status ?? "INACTIVE"} ·{" "}
                  {dateLabel(b.subscription?.currentPeriodEnd ?? null)}
                </small>
              </div>
              <Link
                className="btn"
                href={`/admin/${encodeURIComponent(b.id)}?q=${encodeURIComponent(q)}`}
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
        {!businesses.length && <p>No matching businesses.</p>}
      </section>
    </>
  );
}
