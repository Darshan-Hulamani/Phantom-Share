import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDuration } from "../utils/format.js";

export default function CountdownTimer({ expiresAt, compact = false }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, expiresAt - now);

  return (
    <span className={compact ? "countdown compact-countdown" : "countdown"} aria-live="polite">
      <Clock3 size={compact ? 14 : 18} />
      {formatDuration(remaining)}
    </span>
  );
}
