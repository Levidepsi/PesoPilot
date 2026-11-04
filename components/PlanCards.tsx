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
        Start free, or contact us to subscribe to Starter or Business.
        Subscriptions are currently processed manually. Contact our official
        WhatsApp to receive payment instructions. Your plan activates after
        payment verification.
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
                  aria-label={`Contact us to ${current === key ? "renew" : "subscribe to"} ${plan.name} ${yearly ? "yearly" : "monthly"} via WhatsApp (opens in a new tab)`}
                >
                  {current === key
                    ? "Contact us to renew"
                    : "Contact us to subscribe"}
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
        <h3 id="manual-subscription-title">How manual subscriptions work</h3>
        <p>
          Message us on WhatsApp at <strong>{subscriptionWhatsApp}</strong>.
          Your chosen plan and billing period will be included in an editable
          message.
        </p>
        <p>
          Chat is for subscription assistance and payment instructions. Make
          your payment in your payment provider’s official app, after checking
          the recipient name and exact amount. We will never ask for your
          password, MPIN, or OTP.
        </p>
        <ol>
          <li>Create a Free account, then choose your plan above.</li>
          <li>
            Read the <a href="#refund-policy">refund policy below</a> and
            confirm payment instructions with us before paying.
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
      <section
        id="refund-policy"
        className="panel"
        aria-labelledby="refund-policy-title"
      >
        <h3 id="refund-policy-title">Refund policy</h3>
        <ul>
          <li>
            <strong>First subscription:</strong> Request a full refund within 7
            days of activation. This applies to both monthly and yearly plans.
          </li>
          <li>
            <strong>Renewals:</strong> Refund requests are reviewed
            individually.
          </li>
          <li>
            <strong>Duplicate payments or unavailable service:</strong> Verified
            duplicate payments and payments for subscriptions we cannot provide
            will be refunded.
          </li>
        </ul>
        <p>
          To request a refund, message us on{" "}
          <a
            href="https://wa.me/639284141394?text=Hi%21%20I%20would%20like%20to%20request%20a%20PesoPilot%20refund."
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp at {subscriptionWhatsApp} (opens in a new tab)
          </a>{" "}
          with your account email and payment reference. We will confirm the
          outcome and, if approved, the refund method and expected processing
          time in chat.
        </p>
        <p className="hint">
          This policy does not limit your rights under applicable consumer law.
        </p>
      </section>
      <p className="hint">
        Each income entry, expense entry, recorded sale, or utang repayment
        counts as one transaction. Creating an unpaid utang record does not
        count. Monthly limits reset on the first day of each month in Philippine
        time. Existing records remain readable at the limit.
      </p>
    </section>
  );
}
