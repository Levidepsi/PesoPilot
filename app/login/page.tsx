import { pageMetadata } from "@/lib/site-metadata";
import SubmitButton from "@/components/SubmitButton";
import { emailAuthEnabled } from "@/lib/auth-config";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/account-actions";
export const metadata = pageMetadata(
  "Log in or create an account",
  "Log in to your PesoPilot workspace or create a free account for your small business.",
);

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const messages: Record<string, string> = {
    verified: "Email verified. You can now log in.",
    reset: "Password changed. Log in with your new password.",
    credentials: "Invalid email or password.",
    registration:
      "Enter a valid email, name, business, and password (8+ characters, maximum 72 bytes).",
    exists:
      "Unable to register this email. Try logging in or recovering your password.",
    "email-unavailable":
      "Email delivery is unavailable. Please try again later.",
  };
  return (
    <main className="authwrap login-wrap">
      <div className="authcard">
        <div className="logo">
          Peso<span>Pilot.</span>
        </div>
        <span className="eyebrow">LESS GUESSWORK. MORE CLARITY.</span>
        <h1>
          Your business has a story.
          <br />
          Know it by the numbers.
        </h1>
        <p className="hint">
          A simpler place for your income, expenses, and everyday business
          decisions.
        </p>
        <p>
          <Link href="/pricing">Compare plans and pricing</Link>
        </p>
        {status && messages[status] && <p role="status">{messages[status]}</p>}
        <div className="authcols">
          <form action={loginAction} className="form">
            <h2>Log in</h2>
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                minLength={8}
              />
            </label>
            <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
            {emailAuthEnabled() && (
              <a href="/forgot-password">Forgot password?</a>
            )}
            {emailAuthEnabled() && (
              <a href="/verify-email">Resend verification email</a>
            )}
          </form>
          <form action={registerAction} className="form" id="register">
            <h2>Create account</h2>
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password (8+ characters)
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            <label>
              Business name
              <input
                name="business"
                autoComplete="organization"
                placeholder="Your store or business name"
                required
              />
            </label>
            <SubmitButton pendingLabel="Creating account…">
              Create my free account
            </SubmitButton>
          </form>
        </div>
        <p className="hint">
          Start free. No payment details needed. Your financial records stay
          private to your business.
        </p>
      </div>
    </main>
  );
}
