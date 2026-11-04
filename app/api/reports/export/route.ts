import { businessPlan } from "@/lib/plan-access";
import { db, business } from "@/lib/db";
export const dynamic = "force-dynamic";
function csv(s: string) {
  return `"${s.replace(/^[\s]*[=+@-]/, "'$&").replace(/"/g, '""')}"`;
}
export async function GET() {
  const b = await business();
  if ((await businessPlan(db, b.id)).plan === "FREE")
    return Response.json(
      { error: "CSV exports require Starter or Business." },
      { status: 403 },
    );
  const rows = await db.transaction.findMany({
    where: { businessId: b.id },
    orderBy: { date: "desc" },
  });
  const lines = [
    "Date,Type,Category,Amount PHP,Method,Notes",
    ...rows.map((t) =>
      [
        t.date.toISOString(),
        t.type,
        t.category,
        (t.amount / 100).toFixed(2),
        t.method,
        t.note,
      ]
        .map(csv)
        .join(","),
    ),
  ];
  return new Response("\ufeff" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="pesopilot-transactions.csv"',
      "Cache-Control": "no-store",
    },
  });
}
