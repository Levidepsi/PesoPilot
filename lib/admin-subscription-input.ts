export function parseSubscriptionChange(fd: FormData) {
  const value = (key: string) => String(fd.get(key) ?? "").trim();
  const businessId = value("businessId");
  const operation = value("operation");
  const plan = value("plan");
  const reason = value("reason");
  if (
    !businessId ||
    !["ACTIVATE", "RENEW", "CHANGE", "CANCEL"].includes(operation)
  )
    throw new Error("Choose a valid operation.");
  if (!["FREE", "STARTER", "BUSINESS"].includes(plan))
    throw new Error("Choose a valid plan.");
  if (!reason || reason.length > 500)
    throw new Error("Enter a reason of up to 500 characters.");
  const date = value("expiry");
  const expiry = date ? new Date(`${date}T23:59:59.999+08:00`) : null;
  const paid = plan !== "FREE" && operation !== "CANCEL";
  if (
    paid &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !expiry ||
      !Number.isFinite(expiry.getTime()) ||
      new Date(expiry.getTime() + 8 * 3600000).toISOString().slice(0, 10) !==
        date ||
      expiry.getTime() <= Date.now())
  )
    throw new Error("Choose a future expiry date (Philippine time).");
  const recordPayment = value("verified") === "on";
  const paymentReference = value("paymentReference");
  const rawAmount = value("amount");
  const amountCentavos = Math.round(Number(rawAmount) * 100);
  if (["ACTIVATE", "RENEW"].includes(operation) && (!paid || !recordPayment))
    throw new Error(
      "Activation and renewal require a paid plan and verified payment.",
    );
  if (
    recordPayment &&
    (operation === "CANCEL" ||
      !paid ||
      !paymentReference ||
      paymentReference.length > 150 ||
      !/^\d+(\.\d{1,2})?$/.test(rawAmount) ||
      !Number.isSafeInteger(amountCentavos) ||
      amountCentavos <= 0 ||
      amountCentavos > 2147483647)
  )
    throw new Error(
      "Enter a valid verified payment reference and positive PHP amount.",
    );
  if (!recordPayment && (paymentReference || rawAmount))
    throw new Error(
      "Confirm payment verification before recording payment details.",
    );
  return {
    businessId,
    operation,
    plan,
    reason,
    expiry: paid ? expiry : null,
    paymentReference: recordPayment ? paymentReference : null,
    amountCentavos: recordPayment ? amountCentavos : null,
  };
}
