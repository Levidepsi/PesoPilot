import Link from "next/link";
import { Sparkles } from "lucide-react";
export default function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Sparkles size={22} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && action && (
        <Link className="btn" href={href}>
          {action}
        </Link>
      )}
    </div>
  );
}
