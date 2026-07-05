import { Copy, Facebook, Linkedin, Mail, MessageCircle, QrCode, Send } from "lucide-react";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { QRCodeSVG } from "qrcode.react";

export default function ShareSuccessPage({ notify, activeShare }) {
  // Fallback for direct page visits (e.g. testing)
  const share = activeShare || {
    shareId: "demo-aurora",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    title: "Demo Share"
  };

  const generatedUrl = `${window.location.origin}/#/view?id=${share.shareId}`;

  const copyLink = async () => {
    await navigator.clipboard?.writeText(generatedUrl);
    notify("Link copied to clipboard");
  };

  return (
    <div className="workspace-page centered-page">
      <section className="success-panel">
        <span className="status-orb">
          <QrCode size={27} />
        </span>
        <span className="eyebrow">Share Success</span>
        <h1>Your temporary link is live</h1>
        <div className="generated-link">
          <span>{generatedUrl}</span>
          <button className="icon-button" type="button" aria-label="Copy generated URL" onClick={copyLink}>
            <Copy size={18} />
          </button>
        </div>
        <div className="success-grid">
          <div className="qr-card" aria-label="QR code for generated share link">
            <div style={{ background: "white", padding: "10px", borderRadius: "6px", display: "inline-block" }}>
              <QRCodeSVG 
                value={generatedUrl} 
                size={130} 
                bgColor={"#ffffff"} 
                fgColor={"#0f172a"} 
                level={"H"} 
              />
            </div>
          </div>
          <div className="countdown-panel">
            <span>Expires in</span>
            <CountdownTimer expiresAt={share.expiresAt} />
            <div className="social-buttons" aria-label="Share via social media">
              <a href={`mailto:?subject=Shared Link: ${share.title}&body=Access my temporary share here: ${generatedUrl}`} aria-label="Share by email">
                <Mail size={18} />
              </a>
              <a href={`https://wa.me/?text=Access my temporary share: ${encodeURIComponent(generatedUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share by message">
                <MessageCircle size={18} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(generatedUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                <Linkedin size={18} />
              </a>
              <button type="button" aria-label="Share on Facebook">
                <Facebook size={18} />
              </button>
            </div>
            <button className="primary-button full-width" type="button" onClick={copyLink}>
              <Send size={18} />
              Copy Secure Link
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
