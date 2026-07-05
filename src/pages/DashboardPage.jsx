import { Archive, BarChart3, Clock3, Database, Eye, FileStack, Search, Share2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ShareCard from "../components/ShareCard.jsx";
import StatCard from "../components/StatCard.jsx";

const filters = ["all", "text", "code", "image", "pdf", "video", "zip", "document"];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const shares = useMemo(() => {
    return JSON.parse(localStorage.getItem("phantom-history") || "[]");
  }, []);

  const filtered = useMemo(
    () =>
      shares.filter((share) => {
        const matchesText = share.title.toLowerCase().includes(query.toLowerCase());
        const matchesType = filter === "all" || share.type === filter;
        return matchesText && matchesType;
      }),
    [filter, query, shares]
  );

  const active = shares.filter((share) => {
    return share.expiresAt ? Date.now() < share.expiresAt : share.status === "active";
  });
  
  const expired = shares.filter((share) => {
    return share.expiresAt ? Date.now() >= share.expiresAt : share.status === "expired";
  });
  
  const views = shares.reduce((total, share) => total + (share.viewCount ?? share.views ?? 0), 0);

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Share activity at a glance</h1>
        </div>
        <a className="primary-button" href="#/create">
          <Share2 size={18} />
          New Share
        </a>
      </div>

      <div className="stats-grid dashboard-stats">
        <StatCard icon={FileStack} label="Recent Shares" value={shares.length} delta="Total links created" />
        <StatCard icon={Clock3} label="Active Shares" value={active.length} delta="Live right now" />
        <StatCard icon={Archive} label="Expired Shares" value={expired.length} delta="Auto-cleanup rules" />
        <StatCard icon={Database} label="Bandwidth Saved" value="100%" delta="Direct-to-S3 uploads" />
        <StatCard icon={Eye} label="Total Views" value={views.toLocaleString()} delta="Across all active links" />
      </div>

      <section className="glass-panel dashboard-panel">
        <div className="dashboard-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shares" aria-label="Search shares" />
          </label>
          <div className="filter-row" aria-label="Filter by content type">
            {filters.map((item) => (
              <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="activity-strip">
          <div>
            <BarChart3 size={20} />
            <span>Transfer velocity</span>
            <strong>Direct S3</strong>
          </div>
          <div>
            <TrendingUp size={20} />
            <span>Server Cost</span>
            <strong>$0 (Free Tier)</strong>
          </div>
          <LoadingSkeleton />
        </div>

        <div className="share-grid">
          {filtered.length > 0 ? (
            filtered.map((share) => (
              <ShareCard share={share} key={share.shareId || share.id} />
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--fg-muted)" }}>
              No active or expired shares found. Create a share link to see statistics here!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
