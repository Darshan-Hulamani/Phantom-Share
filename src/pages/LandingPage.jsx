import {
  ArrowRight,
  Clock3,
  Copy,
  EyeOff,
  FileStack,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";

const features = [
  { icon: FileStack, title: "Any format", body: "Text, snippets, images, video, PDFs, ZIPs, and documents in one temporary workspace." },
  { icon: Clock3, title: "Auto-expiring links", body: "Choose 1 hour, 24 hours, or 7 days and let stale shares disappear on schedule." },
  { icon: LockKeyhole, title: "Private by default", body: "Add passwords, burn-after-first-view rules, and clear activity counters." },
  { icon: QrCode, title: "Instant handoff", body: "Copy links, show QR codes, or share directly across channels." }
];

const steps = [
  "Drop files or paste content",
  "Set expiration and access rules",
  "Send the temporary PhantomShare link"
];

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} />
            Temporary sharing for fast-moving teams
          </span>
          <h1>Share Anything. Automatically Disappears.</h1>
          <p>
            PhantomShare turns sensitive text, code, media, and files into polished temporary links with expiration,
            passwords, QR codes, and live activity signals.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#/create">
              Create Share
              <ArrowRight size={18} />
            </a>
            <a className="ghost-button" href="#/dashboard">
              View Dashboard
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="PhantomShare dashboard preview">
          <div className="floating-window window-main">
            <div className="window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="share-link-preview">
              <div>
                <span className="tiny-label">Temporary Link</span>
                <strong>phantom.sh/s/aurora-build</strong>
              </div>
              <Copy size={18} />
            </div>
            <div className="preview-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="floating-window window-side">
            <ShieldCheck size={23} />
            <strong>Password On</strong>
            <span>Burn after view</span>
          </div>
          <div className="floating-window window-timer">
            <Zap size={21} />
            <strong>23:58:14</strong>
            <span>Remaining</span>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="section-heading">
          <span className="eyebrow">Features</span>
          <h2>Built for ephemeral handoffs</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-band split-band">
        <div className="section-heading">
          <span className="eyebrow">How It Works</span>
          <h2>Three moves, zero clutter</h2>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <article className="step-card" key={step}>
              <span>{index + 1}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="stats-grid">
          <StatCard icon={EyeOff} label="Auto-expired shares" value="2.8M" delta="+18% this month" />
          <StatCard icon={Clock3} label="Median share lifetime" value="19h" delta="Across all workspaces" />
          <StatCard icon={ShieldCheck} label="Protected transfers" value="94%" delta="Password or burn rule" />
        </div>
      </section>

      <footer className="footer">
        <span>PhantomShare</span>
        <span>Temporary links for text, code, media, and files.</span>
      </footer>
    </div>
  );
}
