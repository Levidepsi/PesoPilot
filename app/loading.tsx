import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="app-loading">
      <div className="panel">
        <p className="eyebrow">PESOPILOT</p>
        <h1>A little clarity is on its way.</h1>
        <p className="loading-status" role="status">
          <LoaderCircle className="spinner" size={20} aria-hidden="true" />
          Loading your page…
        </p>
      </div>
    </main>
  );
}
