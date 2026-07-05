import { Plus, TimerOff } from "lucide-react";

export default function ExpiredPage() {
  return (
    <div className="workspace-page centered-page">
      <section className="expired-panel">
        <div className="expired-illustration" aria-hidden="true">
          <span className="moon" />
          <span className="paper one" />
          <span className="paper two" />
          <span className="spark a" />
          <span className="spark b" />
        </div>
        <span className="status-orb warning">
          <TimerOff size={28} />
        </span>
        <span className="eyebrow">Content Expired</span>
        <h1>This PhantomShare link has disappeared</h1>
        <p>The temporary window closed and the shared content is no longer available.</p>
        <a className="primary-button" href="#/create">
          <Plus size={18} />
          Create New Share
        </a>
      </section>
    </div>
  );
}
