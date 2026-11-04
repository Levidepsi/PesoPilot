"use client";
import { useState } from "react";
import Link from "next/link";
import { plans, type Plan } from "@/lib/plans";
import {
  subscriptionInquiry,
  subscriptionWhatsApp,
} from "@/lib/manual-subscriptions";
export default function PlanCards({ current }: { current?: Plan }) {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="plans" className="plans-section" aria-labelledby="plans-title">
      <h2 id="plans-title">Plans for your business</h2>
      <p>
        Start free, or contact us on WhatsApp to arrange a Starter or Business
        subscription. Paid plans are activated manually after payment
        verification.
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
                    : "Paid monthly, renewed manually"}
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
              ) : key !== "FREE" ? (
                <a
                  className={`btn ${key === "STARTER" ? "primary" : ""}`}
                  href={subscriptionInquiry(key, yearly)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${current === key ? "Renew" : "Subscribe to"} ${plan.name} ${yearly ? "yearly" : "monthly"} via WhatsApp (opens in a new tab)`}
                >
                  {current === key
                    ? "Renew via WhatsApp"
                    : "Subscribe via WhatsApp"}
                </a>
              ) : (
                <button type="button" className="btn" disabled>
                  {current === key ? "Current plan" : "Free plan"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <aside
        className="panel manual-subscription"
        aria-labelledby="manual-subscription-title"
      >
        <h3 id="manual-subscription-title">A little help getting started</h3>
        <p>
          Message us on WhatsApp at <strong>{subscriptionWhatsApp}</strong>.
          Your chosen plan and billing period will be included in an editable
          message.
        </p>
        <ol>
          <li>Create a Free account, then choose your plan above.</li>
          <li>
            Confirm payment instructions and refund terms with us before paying.
          </li>
          <li>
            Share your payment reference in chat. Once verified, we activate
            your plan and confirm its expiry.
          </li>
        </ol>
        <p>
          Office hours: Monday–Friday, 7 AM–9 PM Philippine time. Requests
          during office hours are handled within the day; requests outside these
          hours are handled the next working day. Activation follows payment
          verification.
        </p>
        <p className="hint">
          Opening WhatsApp does not send a message or activate a subscription.
          Renewals are manual; you will not be charged automatically.
        </p>
      </aside>
      <p className="hint">
        Each income entry, expense entry, recorded sale, or utang repayment
        counts as one transaction. Creating an unpaid utang record does not
        count. Monthly limits reset on the first day of each month in Philippine
        time. Existing records remain readable at the limit.
      </p>
    </section>
  );
}
