import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import {
  requestVerificationAction,
  verifyEmailAction,
} from "@/lib/recovery-actions";
import { validToken } from "@/lib/auth-tokens";
export const metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function VerifyEmail({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; token?: string }>;
}) {
  const { status, token } = await searchParams;
  const messages: Record<string, string> = {
    requested:
      "If your account needs verification, a link will be sent. Check your inbox and spam folder. Wait a minute before requesting another.",
    invalid:
      "This link is invalid, expired, or already used. Request a new link below.",
    required:
      "Verify your email before logging in. Existing accounts also need verification.",
    delivery:
      "Your account was created, but the email could not be delivered. Please try again in a minute.",
  };
  return (
    <main className="authwrap">
      <div className="authcard">
        <h1>Verify your email</h1>
        {status && messages[status] && <p role="status">{messages[status]}</p>}
        {token && validToken(token) ? (
          <form action={verifyEmailAction} className="form">
            <p>Confirm your email to finish setting up your account.</p>
            <input type="hidden" name="token" value={token} />
            <SubmitButton>Verify email</SubmitButton>
          </form>
        ) : (
          <form action={requestVerificationAction} className="form">
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
            <SubmitButton>Send verification link</SubmitButton>
          </form>
        )}
        <Link href="/login">Back to login</Link>
      </div>
    </main>
  );
}
