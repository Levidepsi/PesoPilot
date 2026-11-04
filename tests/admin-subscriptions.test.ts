import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSubscriptionChange } from "../lib/admin-subscription-input";
function form(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({
    businessId: "test",
    operation: "ACTIVATE",
    plan: "STARTER",
    reason: "Verified",
    expiry: "2035-01-31",
    verified: "on",
    amount: "149.50",
    paymentReference: "GCASH-123",
    ...overrides,
  }))
    fd.set(k, v);
  return fd;
}
test("paid activation requires verified payment and valid plan, amount, future expiry", () => {
  const invalidInputs: Record<string, string>[] = [
    { verified: "" },
    { plan: "FAKE" },
    { amount: "-1" },
    { amount: "1.234" },
    { expiry: "2000-01-01" },
    { reason: "" },
    { paymentReference: "" },
  ];
  for (const change of invalidInputs)
    assert.throws(() => parseSubscriptionChange(form(change)));
  const parsed = parseSubscriptionChange(form());
  assert.equal(parsed.amountCentavos, 14950);
  assert.equal(parsed.expiry?.toISOString(), "2035-01-31T15:59:59.999Z");
});
test("corrections need no payment; cancellations cannot record a payment", () => {
  const change = {
    operation: "CHANGE",
    verified: "",
    amount: "",
    paymentReference: "",
  };
  assert.equal(parseSubscriptionChange(form(change)).paymentReference, null);
  assert.throws(() => parseSubscriptionChange(form({ operation: "CANCEL" })));
  assert.equal(
    parseSubscriptionChange(form({ ...change, operation: "CANCEL" })).expiry,
    null,
  );
});
