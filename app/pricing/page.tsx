import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import PlanCards from "@/components/PlanCards";

export const metadata: Metadata = {
  ...pageMetadata(
    "Pricing",
    "Compare PesoPilot Free, Starter and Business plans. Start tracking your business finances for free.",
    "/pricing",
  ),
  robots: { index: true, follow: true },
};

export default function Pricing() {
  return (
    <div className="public-pricing">
      <nav className="pricing-nav" aria-label="Pricing navigation">
        <Link className="logo" href="/pricing">
          Peso<span>Pilot.</span>
        </Link>
        <Link href="/login" className="btn">
          Log in / Sign up
        </Link>
      </nav>
      <header className="pricing-intro">
        <p className="hint">Built for small businesses in the Philippines</p>
        <h1>Clear pricing. Room to grow.</h1>
        <p>
          Track income, expenses and customer credit with Free. Compare the
          plans for your next stage below.
        </p>
      </header>
      <PlanCards />
      <section
        className="panel pricing-faq"
        aria-labelledby="pricing-questions"
      >
        <h2 id="pricing-questions">Before you get started</h2>
        <h3>Can I use PesoPilot now?</h3>
        <p>Yes. Create a Free account with no payment details required.</p>
        <h3>Why do paid plans say “Coming soon”?</h3>
        <p>
          Paid checkout is not available yet. You can compare prices, but you
          cannot purchase or activate Starter or Business at this time.
        </p>
        <h3>What happens when I reach a Free limit?</h3>
        <p>
          Your saved records remain available. New transaction entries pause at
          100 per month and reopen next month. You can keep up to 20 customers
          on Free.
        </p>
        <h3>How does yearly billing work?</h3>
        <p>
          When paid plans launch, yearly billing will be one upfront payment:
          ₱1,428 for Starter or ₱3,828 for Business. The monthly equivalent is
          shown for comparison.
        </p>
      </section>
    </div>
  );
}
