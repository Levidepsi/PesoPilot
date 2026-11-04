import { pageMetadata } from "@/lib/site-metadata";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import { requestResetAction } from "@/lib/recovery-actions";
export const metadata = pageMetadata(
  "Forgot password",
  "Request a secure link to reset your PesoPilot password.",
);

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <main className="authwrap">
      <div className="authcard">
        <h1>Forgot password?</h1>
        <p>Enter your account email to request a password reset link.</p>
        {status === "requested" && (
          <p role="status">
            If an account matches this email, a reset link will be sent. Check
            your spam folder and wait a minute before requesting another.
          </p>
        )}
        <form action={requestResetAction} className="form">
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
          <SubmitButton>Send reset link</SubmitButton>
        </form>
        <Link href="/login">Back to login</Link>
      </div>
    </main>
  );
}
