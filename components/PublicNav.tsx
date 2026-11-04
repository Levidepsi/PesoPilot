import Link from "next/link";
export default function PublicNav() {
  return (
    <nav className="public-nav" aria-label="Main navigation">
      <Link className="logo" href="/" aria-label="PesoPilot home">
        Peso<span>Pilot.</span>
      </Link>
      <div className="public-nav-links">
        <Link href="/#features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/login">Log in</Link>
        <Link className="btn primary" href="/login#register">
          Start Free
        </Link>
      </div>
    </nav>
  );
}
