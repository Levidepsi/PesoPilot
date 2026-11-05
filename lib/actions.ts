"use server";
import { checkWrite } from "./plan-access";
import { planMutation } from "./plan-mutation";
import { db, business, authorizedBusiness } from "./db";
import { parseMoney } from "./money";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
function val(fd: FormData, k: string) {
  return String(fd.get(k) ?? "").trim();
}
function refresh() {
  for (const p of [
    "/dashboard",
    "/transactions",
    "/customers",
    "/debts",
    "/reports",
  ])
    revalidatePath(p);
}
export async function addTransaction(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN", "STAFF"]);
  const type = val(fd, "type");
  const method = val(fd, "method");
  if (!["INCOME", "EXPENSE"].includes(type))
    throw new Error("Invalid transaction type");
  if (!["CASH", "GCASH", "MAYA", "BANK_TRANSFER", "OTHER"].includes(method))
    throw new Error("Invalid payment method");
  const category = val(fd, "category").slice(0, 80);
  if (!category) throw new Error("Category is required");
  await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "transaction");
    return tx.transaction.create({
      data: {
        businessId: b.id,
        type,
        category,
        method,
        amount: parseMoney(fd.get("amount")),
        note: val(fd, "note").slice(0, 300),
      },
    });
  });
  refresh();
  redirect("/transactions");
}
export async function addCustomer(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN", "STAFF"]);
  const name = val(fd, "name").slice(0, 100);
  if (!name) throw new Error("Customer name is required");
  await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "customer");
    return tx.customer.create({
      data: {
        businessId: b.id,
        name,
        phone: val(fd, "phone").slice(0, 30),
        note: val(fd, "note").slice(0, 300),
      },
    });
  });
  refresh();
  redirect("/customers");
}
export async function addDebt(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN", "STAFF"]);
  const customerId = val(fd, "customerId");
  const customer = await db.customer.findFirst({
    where: { id: customerId, businessId: b.id },
  });
  if (!customer) throw new Error("Invalid customer");
  const due = val(fd, "dueDate");
  await db.debt.create({
    data: {
      businessId: b.id,
      customerId,
      amount: parseMoney(fd.get("amount")),
      description: val(fd, "description").slice(0, 300),
      dueDate: due ? new Date(`${due}T12:00:00+08:00`) : null,
    },
  });
  refresh();
  redirect("/debts");
}
export async function payDebt(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN", "STAFF"]);
  const debtId = val(fd, "debtId");
  const amount = parseMoney(fd.get("amount"));
  const method = val(fd, "method");
  if (!["CASH", "GCASH", "MAYA", "BANK_TRANSFER", "OTHER"].includes(method))
    throw new Error("Invalid method");
  // Lock the owner before checking the quota and outstanding balance.
  const customerId = await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "transaction");
    const debt = await tx.debt.findFirst({
      where: { id: debtId, businessId: b.id },
      include: { payments: true },
    });
    if (!debt) throw new Error("Debt not found");
    const remaining =
      debt.amount - debt.payments.reduce((sum, p) => sum + p.amount, 0);
    if (amount > remaining)
      throw new Error("Payment exceeds outstanding balance");
    const transaction = await tx.transaction.create({
      data: {
        businessId: b.id,
        type: "INCOME",
        category: "Debt Collection",
        amount,
        method,
        note: `Payment for ${debt.description || "customer debt"}`,
      },
    });
    await tx.debtPayment.create({
      data: { debtId, transactionId: transaction.id, amount },
    });
    return debt.customerId;
  });
  refresh();
  revalidatePath(`/customers/${customerId}`);
  if (val(fd, "returnTo") === "customer")
    redirect(`/customers/${customerId}?saved=1`);
  redirect("/debts");
}
export async function renameBusiness(fd: FormData) {
  const { business: b } = await authorizedBusiness(["OWNER", "ADMIN"]);
  const name = val(fd, "name").slice(0, 100);
  if (!name) throw new Error("Business name required");
  await db.business.update({ where: { id: b.id }, data: { name } });
  refresh();
  redirect("/dashboard");
}
