import Link from "next/link";
import { session } from "@/lib/auth";
import { isSiteAdmin } from "@/lib/admin";

export default async function PublicNav() {
  const user = await session();
  return (
    <nav className="public-nav" aria-label="Main navigation">
      <Link className="logo" href="/" aria-label="PesoPilot home">
        Peso<span>Pilot.</span>
      </Link>
      <div className="public-nav-links">
        <Link href="/#features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        {user ? (
          <>
            <span className="public-user-name">Hi, {user.name}</span>
            <Link className="btn primary" href={isSiteAdmin(user) ? "/admin" : "/dashboard"}>
              {isSiteAdmin(user) ? "Admin" : "My workspace"}
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link className="btn primary" href="/login#register">
              Start Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
