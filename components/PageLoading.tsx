import { LoaderCircle } from "lucide-react";

export default function PageLoading({
  dashboard = false,
}: {
  dashboard?: boolean;
}) {
  return (
    <div className="page-loading">
      <p className="loading-status" role="status">
        <LoaderCircle className="spinner" size={18} aria-hidden="true" />
        {dashboard ? "Loading your dashboard…" : "Loading your workspace…"}
      </p>
      <div aria-hidden="true" className="loading-placeholder">
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-description" />
        {dashboard && (
          <div className="loading-metrics">
            {[0, 1, 2, 3].map((item) => (
              <div className="panel" key={item}>
                <div className="skeleton skeleton-description" />
                <div className="skeleton skeleton-heading" />
              </div>
            ))}
          </div>
        )}
        <div className="panel loading-content">
          <div className="skeleton skeleton-heading" />
          {[0, 1, 2, 3, 4].map((item) => (
            <div className="skeleton skeleton-row" key={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
