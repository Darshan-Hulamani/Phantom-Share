import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { navigateTo } from "../utils/format.js";

export default function PasswordPage({ notify }) {
  return (
    <div className="workspace-page centered-page">
      <section className="password-panel">
        <span className="status-orb">
          <LockKeyhole size={28} />
        </span>
        <span className="eyebrow">Protected Share</span>
        <h1>Enter password to unlock</h1>
        <label className="unlock-field">
          <KeyRound size={18} />
          <input type="password" placeholder="Password" aria-label="Share password" />
        </label>
        <button
          className="primary-button full-width"
          type="button"
          onClick={() => {
            notify("Share unlocked");
            navigateTo("/view");
          }}
        >
          <ShieldCheck size={18} />
          Unlock
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
