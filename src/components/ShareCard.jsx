import { Download, Eye, Flame, Lock, ExternalLink } from "lucide-react";
import CountdownTimer from "./CountdownTimer.jsx";
import { contentIconLabel, navigateTo } from "../utils/format.js";

export default function ShareCard({ share }) {
  const views = share.viewCount ?? share.views ?? 0;
  const downloads = share.downloadCount ?? share.downloads ?? 0;
  const isProtected = share.isPasswordProtected ?? share.protected ?? false;
  const isBurn = share.burnOnView ?? share.burnAfterView ?? false;
  const shareId = share.shareId ?? share.id;
  const isActive = share.expiresAt ? Date.now() < share.expiresAt : share.status === "active";

  const handleCardClick = () => {
    navigateTo(`/view?id=${shareId}`);
  };

  return (
    <article 
      className={`share-card ${isActive ? "active" : "expired"}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="share-card-top">
        <div>
          <span className="type-pill">{contentIconLabel(share.type)}</span>
          <h3>{share.title}</h3>
        </div>
        <button 
          className="icon-button" 
          type="button" 
          aria-label={`View share link`}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <ExternalLink size={16} />
        </button>
      </div>
      <div className="share-card-meta">
        <span>
          <Eye size={15} />
          {views}
        </span>
        {share.type === "file" && (
          <span>
            <Download size={15} />
            {downloads}
          </span>
        )}
        {share.size && <span>{share.size}</span>}
      </div>
      <div className="share-card-bottom">
        {isActive ? <CountdownTimer expiresAt={share.expiresAt} compact /> : <span className="expired-pill">Expired</span>}
        <div className="mini-flags">
          {isProtected && <Lock size={15} aria-label="Password protected" />}
          {isBurn && <Flame size={15} aria-label="Burn after first view" />}
        </div>
      </div>
    </article>
  );
}
