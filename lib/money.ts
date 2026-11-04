export function pesos(centavos: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
export function parseMoney(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(s))
    throw new Error(
      "Enter a valid positive peso amount (maximum two decimal places).",
    );
  const [whole, frac = ""] = s.split(".");
  const amount = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new Error("Amount must be greater than zero.");
  return amount;
}
export function dateLabel(d: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
