"use client";
import { useState } from "react";
import { payDebt } from "@/lib/actions";
import { pesos } from "@/lib/money";
import SubmitButton from "./SubmitButton";

export default function CustomerPaymentForm({
  debts,
}: {
  debts: { id: string; description: string; remaining: number }[];
}) {
  const [id, setId] = useState(debts[0]?.id ?? "");
  const selected = debts.find((debt) => debt.id === id);
  if (!selected)
    return <p>No outstanding debts. This customer is fully paid.</p>;
  return (
    <form action={payDebt} className="form">
      <input type="hidden" name="returnTo" value="customer" />
      <label>
        Debt to pay
        <select
          name="debtId"
          value={id}
          onChange={(event) => setId(event.target.value)}
        >
          {debts.map((debt) => (
            <option key={debt.id} value={debt.id}>
              {debt.description} — {pesos(debt.remaining)} left
            </option>
          ))}
        </select>
      </label>
      <p className="hint">
        Outstanding: <strong>{pesos(selected.remaining)}</strong>. Enter a
        partial payment or the full balance.
      </p>
      <label>
        Amount received (PHP)
        <input
          key={id}
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          max={(selected.remaining / 100).toFixed(2)}
          placeholder="0.00"
          required
        />
      </label>
      <label>
        Payment method
        <select name="method">
          <option value="CASH">Cash</option>
          <option value="GCASH">GCash</option>
          <option value="MAYA">Maya</option>
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <SubmitButton pendingLabel="Recording payment…">
        Record payment
      </SubmitButton>
    </form>
  );
}
