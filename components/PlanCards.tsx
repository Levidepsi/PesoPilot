"use client";
import { useState } from "react";
import Link from "next/link";
import { plans, type Plan } from "@/lib/plans";
export default function PlanCards({ current }: { current?: Plan }) {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="plans" className="plans-section" aria-labelledby="plans-title">
      <h2 id="plans-title">Plans for your business</h2>
      <p>
        Start with Free today. Starter and Business are not yet available for
        purchase. No payment details are required to create a Free account.
      </p>
      <div className="billing-toggle" aria-label="Billing interval">
        <button
          type="button"
          aria-pressed={!yearly}
          onClick={() => setYearly(false)}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={yearly}
          onClick={() => setYearly(true)}
        >
          Yearly · Save 20%
        </button>
      </div>
      <div className="pricing-grid">
        {(Object.keys(plans) as Plan[]).map((key) => {
          const plan = plans[key];
          return (
            <article
              key={key}
              className={`panel pricing-card ${key === "STARTER" ? "recommended-plan" : ""}`}
            >
              <div className="plan-title">
                <h3>{plan.name}</h3>
                {key === "STARTER" && <span className="chip">Recommended</span>}
              </div>
              <p className="plan-price">
                ₱{yearly ? plan.annual / 12 : plan.monthly}
                <small>/month</small>
              </p>
              <p className="hint">
                {plan.annual && yearly
                  ? `₱${plan.annual.toLocaleString("en-PH")} billed annually`
                  : key === "FREE"
                    ? "Free, with no payment required"
                    : "Billed monthly"}
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {!current && key === "FREE" ? (
                <Link href="/login#register" className="btn primary">
                  Start Free
                </Link>
              ) : (
                <button type="button" className="btn" disabled>
                  {current === key
                    ? "Current plan"
                    : key === "FREE"
                      ? "Free plan"
                      : "Coming soon"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="hint">
        Each income entry, expense entry, recorded sale, or utang repayment
        counts as one transaction. Creating an unpaid utang record does not
        count. Monthly limits reset on the first day of each month in Philippine
        time. Existing records remain readable at the limit.
      </p>
    </section>
  );
}
