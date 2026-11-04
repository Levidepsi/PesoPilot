import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  HandCoins,
  Users,
  Check,
  ChartNoAxesCombined,
  Store,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PlanCards from "@/components/PlanCards";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata(
    "Small business finance, made clearer",
    "Keep track of your income, expenses and customer credit with PesoPilot. Start free and give your everyday business a clearer financial picture.",
    "/",
  ),
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <div className="landing">
      <a href="#landing-content" className="skip-link">
        Skip to content
      </a>
      <PublicNav />
      <main id="landing-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              FOR YOUR STORE. YOUR SIDE HUSTLE. YOUR NEXT CHAPTER.
            </span>
            <h1>
              Small business.
              <br />
              <span>Clearer numbers.</span>
              <br />
              Bigger possibilities.
            </h1>
            <p>
              Know what came in, what went out, and what customers still owe.
              Give your everyday business a little more clarity with PesoPilot.
            </p>
            <div className="hero-actions">
              <Link href="/login#register" className="btn primary">
                Start your free workspace <ArrowRight size={18} />
              </Link>
              <Link href="#features" className="hero-secondary">
                Take a closer look <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="hero-reassurance">
              <Check size={15} /> Free plan available <span>·</span> No payment
              details needed
            </div>
          </div>
          <div
            className="product-preview"
            aria-label="Illustrative dashboard with sample figures"
          >
            <div className="preview-top">
              <span>
                <Store size={16} /> Your everyday store
              </span>
              <span className="preview-demo">Sample data</span>
            </div>
            <div className="preview-heading">
              <span className="eyebrow">A LITTLE CLARITY, EVERY DAY</span>
              <h2>Your business at a glance.</h2>
            </div>
            <div className="preview-balance">
              <div>
                <span>Cash balance</span>
                <strong>
                  ₱8,450<span>.00</span>
                </strong>
                <small>Income minus expenses in this example</small>
              </div>
              <Wallet size={30} />
            </div>
            <div className="preview-totals">
              <div>
                <ArrowUpRight size={18} />
                <span>Money in</span>
                <strong>₱12,800</strong>
              </div>
              <div>
                <ArrowDownRight size={18} />
                <span>Money out</span>
                <strong>₱4,350</strong>
              </div>
            </div>
            <div className="preview-activity">
              <div>
                <span className="txicon income">
                  <ArrowUpRight size={18} />
                </span>
                <div>
                  <strong>Store sales</strong>
                  <small>Income · Cash</small>
                </div>
                <b>+₱650</b>
              </div>
              <div>
                <span className="txicon expense">
                  <ArrowDownRight size={18} />
                </span>
                <div>
                  <strong>Supplies</strong>
                  <small>Expense · Cash</small>
                </div>
                <b>−₱280</b>
              </div>
            </div>
            <p className="preview-caption">
              An example of the clarity your own records can bring.
            </p>
          </div>
        </section>
        <div className="audience-strip">
          <span>Built around your kind of business</span>
          <strong>Sari-sari stores</strong>
          <strong>Freelancers</strong>
          <strong>Local services</strong>
          <strong>Growing shops</strong>
        </div>
        <section id="features" className="landing-features">
          <div className="section-heading">
            <span className="eyebrow">LESS GUESSWORK. MORE CONFIDENCE.</span>
            <h2>
              A better handle on
              <br />
              the business you’re building.
            </h2>
            <p>
              Keep the essentials together, so you can spend less time piecing
              together records and more time running your business.
            </p>
          </div>
          <div className="benefit-grid">
            <article>
              <span className="benefit-icon">
                <Wallet size={25} />
              </span>
              <h3>Follow every peso.</h3>
              <p>
                Record income and expenses, then see your cash balance and
                recent activity in one workspace.
              </p>
              <span className="benefit-label">Income & expenses</span>
            </article>
            <article>
              <span className="benefit-icon">
                <HandCoins size={25} />
              </span>
              <h3>Keep customer credit clear.</h3>
              <p>
                Track Debt, due dates and partial repayments. See what is still
                outstanding without losing the history.
              </p>
              <span className="benefit-label">Debt tracking</span>
            </article>
            <article>
              <span className="benefit-icon">
                <Users size={25} />
              </span>
              <h3>Know your customers.</h3>
              <p>
                Keep contact details and outstanding balances together, with up
                to 20 customers on Free.
              </p>
              <span className="benefit-label">Customer directory</span>
            </article>
            <article>
              <span className="benefit-icon">
                <ChartNoAxesCombined size={25} />
              </span>
              <h3>See the bigger picture.</h3>
              <p>
                Your dashboard brings income, expenses and customer balances
                into focus. Saved transaction history stays accessible.
              </p>
              <span className="benefit-label">Business overview</span>
            </article>
          </div>
        </section>
        <section className="getting-started">
          <div className="section-heading">
            <span className="eyebrow">FROM SIGNUP TO YOUR FIRST ENTRY</span>
            <h2>
              A simple start.
              <br />A useful daily habit.
            </h2>
            <Link href="/login#register" className="hero-secondary">
              Create your workspace <ArrowRight size={17} />
            </Link>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Make it yours.</h3>
                <p>
                  Create your account and name your business. The Free plan gets
                  you started.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Record the everyday.</h3>
                <p>
                  Add income, expenses and customer credit as your business day
                  unfolds.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Come back to clarity.</h3>
                <p>
                  Open your dashboard to review your records, balances and
                  outstanding payments.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <div className="landing-pricing">
          <PlanCards />
        </div>
        <section className="landing-cta">
          <div>
            <span className="eyebrow">
              YOUR BUSINESS DESERVES A CLEARER PICTURE
            </span>
            <h2>
              Start with one entry.
              <br />
              Build from there.
            </h2>
            <p>Make room for a simpler way to keep track.</p>
          </div>
          <Link href="/login#register" className="btn">
            Create my free account <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <Link className="logo" href="/">
          Peso<span>Pilot.</span>
        </Link>
        <p>Everyday finance for Philippine small businesses.</p>
        <div>
          <Link href="/#features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Log in</Link>
        </div>
        <small>
          Cash-flow tracking, not a substitute for professional accounting or
          tax advice.
        </small>
      </footer>
    </div>
  );
}
