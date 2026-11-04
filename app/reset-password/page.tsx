import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/recovery-actions";
import { validToken } from "@/lib/auth-tokens";
export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; token?: string }>;
}) {
  const { status, token } = await searchParams;
  return (
    <main className="authwrap">
      <div className="authcard">
        <h1>Reset your password</h1>
        {status === "password" && (
          <p role="alert">
            Passwords must match and contain at least 8 characters (maximum 72
            bytes).
          </p>
        )}
        {token && validToken(token) ? (
          <form action={resetPasswordAction} className="form">
            <input type="hidden" name="token" value={token} />
            <label>
              New password
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </label>
            <SubmitButton>Save new password</SubmitButton>
          </form>
        ) : (
          <p role="alert">
            This link is missing, invalid, expired, or already used.
          </p>
        )}
        <p>
          <Link href="/forgot-password">Request a new reset link</Link>
        </p>
        <Link href="/login">Back to login</Link>
      </div>
    </main>
  );
}
