import { pageMetadata } from "@/lib/site-metadata";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  Plus,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CashChart, BarSummary } from "@/components/Charts";
import { summary } from "@/lib/summary";
import { pesos, dateLabel } from "@/lib/money";
import { db } from "@/lib/db";
import { businessPlan } from "@/lib/plan-access";
import { monthWindow } from "@/lib/plans";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Overview",
  "Your business income, expenses and customer balances at a glance.",
);

export default async function Dashboard() {
  const s = await summary();
  const [access, transactionCount, customerCount] = await Promise.all([
    businessPlan(db, s.b.id),
    db.transaction.count({
      where: { businessId: s.b.id, createdAt: monthWindow() },
    }),
    db.customer.count({ where: { businessId: s.b.id } }),
  ]);
  const overdue = s.debtList.filter(
    (d) => d.remaining > 0 && d.dueDate && d.dueDate.getTime() < Date.now(),
  );
  return (
    <>
      <div className="pagehead">
        <div>
          <span className="eyebrow">YOUR BUSINESS, AT A GLANCE</span>
          <h1>A clearer picture of your money.</h1>
          <p>
            A little clarity for every business day. Here is your latest
            overview.
          </p>
        </div>
        <Link className="btn primary" href="/transactions">
          <Plus size={17} /> Add Transaction
        </Link>
      </div>
      <div className="overview-strip">
        <span>
          <span className="live-dot" /> {s.b.name}
        </span>
        <span>All-time totals · Philippine peso</span>
      </div>
      <section className="panel" aria-labelledby="dashboard-usage-title">
        <div className="panelhead">
          <h2 id="dashboard-usage-title">{access.limits.name} plan usage</h2>
          <Link href="/settings#plans" className="subtlelink">
            View plans
          </Link>
        </div>
        <p>
          <strong>
            {transactionCount} /{" "}
            {Number.isFinite(access.limits.transactions)
              ? access.limits.transactions
              : "Unlimited"}
          </strong>{" "}
          transactions this month
          {" · "}
          <strong>
            {customerCount} /{" "}
            {Number.isFinite(access.limits.customers)
              ? access.limits.customers
              : "Unlimited"}
          </strong>{" "}
          customers
        </p>
        <p className="hint">
          Usage for {s.b.name}. Transaction counts reset on the first of each
          month in Philippine time. Customer counts do not reset monthly.
        </p>
      </section>
      {s.transactions.length === 0 && (
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">LET’S GET YOU STARTED</span>
            <h2>Your next chapter starts with one entry.</h2>
            <p>
              Add your first income or expense to bring your dashboard to life.
            </p>
          </div>
          <Link href="/transactions" className="btn primary">
            <Plus size={17} /> Record your first transaction
          </Link>
        </section>
      )}
      <div className="quick-actions" aria-label="Quick actions">
        <Link href="/transactions">
          <Plus size={18} />
          <span>Record income or expense</span>
          <ArrowUpRight size={16} />
        </Link>
        <Link href="/customers">
          <Plus size={18} />
          <span>Add a customer</span>
          <ArrowUpRight size={16} />
        </Link>
        <Link href="/debts">
          <HandCoins size={18} />
          <span>Manage customer credit</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="stats">
        <StatCard
          label="Total Income"
          value={pesos(s.income)}
          detail="All recorded inflows"
          color="orange"
          icon={<ArrowUpRight />}
        />
        <StatCard
          label="Total Expenses"
          value={pesos(s.expenses)}
          detail="All recorded outflows"
          color="teal"
          icon={<ArrowDownRight />}
        />
        <StatCard
          label="Cash Balance"
          value={pesos(s.balance)}
          detail="Opening balance + net flow"
          color="blue"
          icon={<Wallet />}
        />
        <StatCard
          label="Unpaid Debts"
          value={pesos(s.unpaid)}
          detail={`${s.debtList.filter((d) => d.remaining > 0).length} outstanding debts`}
          color="yellow"
          icon={<HandCoins />}
        />
      </div>
      {overdue.length > 0 && (
        <Link className="attention-banner" href="/debts">
          <HandCoins size={20} />
          <span>
            {overdue.length} overdue customer balance
            {overdue.length === 1 ? "" : "s"} to review
          </span>
          <ArrowRight size={18} />
        </Link>
      )}
      <div className="dashboardgrid">
        <div className="stack">
          <section className="panel">
            <div className="panelhead">
              <div>
                <h2>Cash Flow Overview</h2>
                <p>Income and expenses over the last 6 months</p>
              </div>
              <span className="chip">
                <CalendarDays size={14} /> 6 Months
              </span>
            </div>
            <CashChart data={s.monthly} />
          </section>
          <section className="panel">
            <div className="panelhead">
              <div>
                <h2>Revenue & Spending</h2>
                <p>Monthly comparison in Philippine pesos</p>
              </div>
            </div>
            <BarSummary data={s.monthly} />
          </section>
        </div>
        <div className="stack">
          <section className="panel">
            <div className="panelhead">Debt
              <div>
                <h2>Outstanding Debts</h2>
                <p>Customer balances to collect</p>
              </div>
              <Link
                href="/debts"
                className="iconlink"
                aria-label="View outstanding debts"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="itemlist">
              {s.debtList
                .filter((d) => d.remaining > 0)
                .slice(0, 6)
                .map((d) => (
                  <div className="listitem" key={d.id}>
                    <div className="personicon">
                      {d.customer.name.slice(0, 1)}
                    </div>
                    <div className="grow">
                      <strong>{d.customer.name}</strong>
                      <small>{d.description || "Customer credit"}</small>
                    </div>
                    <div className="right">
                      <strong className="moneyorange">
                        {pesos(d.remaining)}
                      </strong>
                      <small>
                        {d.dueDate ? dateLabel(d.dueDate) : "No due date"}
                      </small>
                    </div>
                  </div>
                ))}
              {s.debtList.filter((d) => d.remaining > 0).length === 0 && (
                <EmptyState
                  title="All clear here"
                  description="No outstanding customer balances. New utang records will appear here."
                />
              )}
            </div>
            <Link className="subtlelink" href="/debts">
              View all debts <ArrowRight size={15} />
            </Link>
          </section>
          <section className="panel">
            <div className="panelhead">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest money movements</p>
              </div>
            </div>
            <div className="itemlist">
              {s.transactions.length === 0 && (
                <EmptyState
                  title="Your story starts here"
                  description="Once you record a transaction, you can follow your latest activity here."
                />
              )}
              {s.transactions.slice(0, 6).map((t) => (
                <div className="listitem" key={t.id}>
                  <div
                    className={`txicon ${t.type === "INCOME" ? "income" : "expense"}`}
                  >
                    {t.type === "INCOME" ? (
                      <ArrowUpRight size={17} />
                    ) : (
                      <ArrowDownRight size={17} />
                    )}
                  </div>
                  <div className="grow">
                    <strong>{t.category}</strong>
                    <small>
                      {dateLabel(t.date)} · {t.method.replace("_", " ")}
                    </small>
                  </div>
                  <strong
                    className={
                      t.type === "INCOME" ? "moneygreen" : "moneyorange"
                    }
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {pesos(t.amount)}
                  </strong>
                </div>
              ))}
            </div>
            <Link className="subtlelink" href="/transactions">
              All transactions <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
      <p className="disclaimer">
        Cash-flow tracking only. Unpaid credit sales are not counted as
        collected cash; cash balance is not formal accounting profit.
      </p>
    </>
  );
}
