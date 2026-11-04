import { pageMetadata } from "@/lib/site-metadata";
import { business, db } from "@/lib/db";
import { businessPlan } from "@/lib/plan-access";
import { summary } from "@/lib/summary";
import { pesos } from "@/lib/money";
import { CashChart } from "@/components/Charts";
import Link from "next/link";
import { Download } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Reports",
  "Review your business cash flow and financial reports.",
);

export default async function Reports() {
  const b = await business();
  const access = await businessPlan(db, b.id);
  if (access.plan === "FREE")
    return (
      <section className="panel">
        <h1>Reports</h1>
        <p>
          Monthly cash-flow reports and CSV exports are included in Starter and
          Business. Your dashboard and full saved transaction history remain
          available on Free.
        </p>
        <Link href="/settings#plans">View plans</Link>
      </section>
    );
  const s = await summary();
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Reports</h1>
          <p>Cash-flow summaries and exportable transaction records.</p>
        </div>
        <Link href="/api/reports/export" className="btn primary">
          <Download size={16} /> Export CSV
        </Link>
      </div>
      <div className="reportcards">
        <div className="panel">
          <p className="hint">Cash In</p>
          <h2>{pesos(s.income)}</h2>
        </div>
        <div className="panel">
          <p className="hint">Cash Out</p>
          <h2>{pesos(s.expenses)}</h2>
        </div>
        <div className="panel">
          <p className="hint">Net Cash Flow</p>
          <h2>{pesos(s.income - s.expenses)}</h2>
        </div>
        <div className="panel">
          <p className="hint">Unpaid Customer Credit</p>
          <h2>{pesos(s.unpaid)}</h2>
        </div>
      </div>
      <section className="panel">
        <h2>6-Month Cash Flow</h2>
        <p className="hint">Monthly collected income versus expenses</p>
        <CashChart data={s.monthly} />
      </section>
      <p className="disclaimer">
        This is a cash-flow report, not a BIR-compliant tax filing or audited
        profit-and-loss statement.
      </p>
    </>
  );
}
