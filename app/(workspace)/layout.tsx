import Link from "next/link";
import { Store, LogOut } from "lucide-react";
import WorkspaceNav from "@/components/WorkspaceNav";
import { isSiteAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { db, business } from "@/lib/db";
import { logoutAction, switchBusiness } from "@/lib/account-actions";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await requireUser();
  const memberships = await db.businessMember.findMany({
    where: { userId: u.id },
    include: { business: true },
  });
  const b = await business();
  return (
    <>
      <div className="shell">
        <aside className="sidebar">
          <Link className="logo" href="/dashboard">
            Peso<span>Pilot.</span>
          </Link>
          <div className="workspace">
            <Store size={17} />
            <span>{b.name}</span>
          </div>
          <div className="navlabel">WORKSPACE</div>
          <WorkspaceNav isAdmin={isSiteAdmin(u)} />
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
    </>
  );
}
