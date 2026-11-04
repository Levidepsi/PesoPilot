"use server";
import { checkWrite } from "./plan-access";
import { planMutation } from "./plan-mutation";
import { db, authorizedBusiness } from "./db";
import { parseMoney } from "./money";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function addProduct(fd: FormData) {
  const { business: b, user } = await authorizedBusiness([
    "OWNER",
    "ADMIN",
    "STAFF",
  ]);
  const name = val(fd, "name").slice(0, 100),
    sku = val(fd, "sku").slice(0, 50) || null,
    stock = Number(val(fd, "stock")),
    lowStockAt = Number(val(fd, "lowStockAt") || 5);
  if (
    !name ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    !Number.isSafeInteger(lowStockAt) ||
    lowStockAt < 0
  )
    throw new Error("Invalid product");
  const product = await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "inventory");
    const item = await tx.product.create({
      data: {
        businessId: b.id,
        name,
        sku,
        cost: parseMoney(fd.get("cost")),
        price: parseMoney(fd.get("price")),
        stock,
        lowStockAt,
      },
    });
    await tx.auditLog.create({
      data: {
        businessId: b.id,
        userId: user.id,
        action: "CREATE",
        entity: "Product",
        entityId: item.id,
      },
    });
    return item;
  });
  revalidatePath("/inventory");
  redirect("/inventory");
}
export async function updateStock(fd: FormData) {
  const { business: b, user } = await authorizedBusiness([
    "OWNER",
    "ADMIN",
    "STAFF",
  ]);
  const productId = val(fd, "productId"),
    delta = Number(val(fd, "delta"));
  if (!Number.isSafeInteger(delta) || delta === 0)
    throw new Error("Invalid stock adjustment");
  await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "inventory");
    const product = await tx.product.findFirst({
      where: { id: productId, businessId: b.id },
    });
    if (!product || product.stock + delta < 0)
      throw new Error("Invalid stock adjustment");
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { increment: delta } },
    });
    await tx.auditLog.create({
      data: {
        businessId: b.id,
        userId: user.id,
        action: `STOCK ${delta > 0 ? "+" : ""}${delta}`,
        entity: "Product",
        entityId: product.id,
      },
    });
  });
  revalidatePath("/inventory");
  redirect("/inventory");
}
export async function createSale(fd: FormData) {
  const { business: b, user } = await authorizedBusiness([
    "OWNER",
    "ADMIN",
    "STAFF",
  ]);
  const productId = val(fd, "productId"),
    quantity = Number(val(fd, "quantity")),
    method = val(fd, "method");
  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    !["CASH", "GCASH", "MAYA", "BANK_TRANSFER", "OTHER"].includes(method)
  )
    throw new Error("Invalid sale");
  await planMutation(async (tx) => {
    await checkWrite(tx, b.id, "sale");
    const product = await tx.product.findFirst({
      where: { id: productId, businessId: b.id, active: true },
    });
    if (!product) throw new Error("Product not found");
    const updated = await tx.product.updateMany({
      where: { id: product.id, businessId: b.id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    if (updated.count !== 1) throw new Error("Insufficient stock");
    const total = product.price * quantity;
    if (!Number.isSafeInteger(total) || total <= 0)
      throw new Error("Invalid sale total");
    const transaction = await tx.transaction.create({
      data: {
        businessId: b.id,
        type: "INCOME",
        category: "Product Sales",
        amount: total,
        method,
        note: `${quantity} × ${product.name}`,
      },
    });
    const sale = await tx.sale.create({
      data: {
        businessId: b.id,
        total,
        method,
        transactionId: transaction.id,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice: product.price,
            unitCost: product.cost,
          },
        },
      },
    });
    await tx.auditLog.create({
      data: {
        businessId: b.id,
        userId: user.id,
        action: "CREATE",
        entity: "Sale",
        entityId: sale.id,
      },
    });
  });
  revalidatePath("/inventory");
  revalidatePath("/sales");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  redirect("/sales");
}
