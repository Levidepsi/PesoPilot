import type { Metadata, Viewport } from "next";
import { siteUrl, siteDescription } from "@/lib/site-metadata";
import Link from "next/link";
import { Store, LogOut } from "lucide-react";
import WorkspaceNav from "@/components/WorkspaceNav";
import { session } from "@/lib/auth";
import { db, business } from "@/lib/db";
import { logoutAction, switchBusiness } from "@/lib/account-actions";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "PesoPilot | Small Business Finance",
    template: "%s | PesoPilot",
  },
  description: siteDescription,
  applicationName: "PesoPilot",
  category: "business",
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
  openGraph: {
    title: "PesoPilot | Small Business Finance",
    description: siteDescription,
    type: "website",
    siteName: "PesoPilot",
    locale: "en_PH",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "PesoPilot — clarity for your everyday business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PesoPilot | Small Business Finance",
    description: siteDescription,
    images: ["/social-preview.png"],
  },
};
export const viewport: Viewport = {
  themeColor: "#173e31",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await session();
  if (!u)
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  const memberships = await db.businessMember.findMany({
    where: { userId: u.id },
    include: { business: true },
  });
  if (!memberships.length)
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  const b = await business();
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Link className="logo" href="/">
              Peso<span>Pilot.</span>
            </Link>
            <div className="workspace">
              <Store size={17} />
              <span>{b.name}</span>
            </div>
            <div className="navlabel">WORKSPACE</div>
            <WorkspaceNav />
            <form action={logoutAction} className="logoutform">
              <button className="btn">
                <LogOut size={16} /> Log out
              </button>
            </form>
            <div className="sidebottom">
              <span className="live-dot" /> Made for your everyday business
            </div>
          </aside>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <main className="main" id="main-content">
            <header className="topbar">
              <div>
                <div className="crumb">YOUR WORKSPACE</div>
                <strong>{b.name}</strong>
              </div>
              <div className="topright">
                {memberships.length > 1 && (
                  <form action={switchBusiness}>
                    <select
                      name="businessId"
                      defaultValue={b.id}
                      aria-label="Switch business"
                    >
                      {memberships.map((m) => (
                        <option key={m.businessId} value={m.businessId}>
                          {m.business.name}
                        </option>
                      ))}
                    </select>
                    <button className="btn" type="submit">
                      Switch
                    </button>
                  </form>
                )}
                <span className="pill">PHP</span>
                <span className="avatar" title={u.name} aria-label={u.name}>
                  {u.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </header>
            <div className="page">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
