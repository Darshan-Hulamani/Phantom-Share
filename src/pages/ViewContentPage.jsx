import {
  Download,
  Eye,
  FileArchive,
  FileCode2,
  FileText,
  Image,
  PlayCircle,
  Search,
  Video
} from "lucide-react";
import { useState, useEffect } from "react";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { API_URL } from "../config.js";

function ContentPreview({ share, downloadUrl, content }) {
  if (share.type === "text") return <div className="text-viewer" style={{ whiteSpace: "pre-wrap", padding: "16px", background: "var(--bg-card, #1e293b)", borderRadius: "6px", border: "1px solid var(--border)" }}>{content}</div>;
  if (share.type === "code") {
    return (
      <pre className="code-viewer" style={{ overflow: "auto", padding: "16px", background: "var(--bg-card, #1e293b)", borderRadius: "6px", border: "1px solid var(--border)" }}>
        <code>{content}</code>
      </pre>
    );
  }
  if (share.type === "file") {
    const isImage = share.mimeType?.startsWith("image/");
    const isVideo = share.mimeType?.startsWith("video/");

    if (isImage && downloadUrl) {
      return (
        <div className="image-preview" style={{ textAlign: "center" }}>
          <img src={downloadUrl} alt={share.title} style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          <span style={{ marginTop: "12px", display: "block", color: "var(--fg-muted)" }}>{share.title}</span>
        </div>
      );
    }
    if (isVideo && downloadUrl) {
      return (
        <div className="video-preview" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <video src={downloadUrl} controls style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          <span style={{ marginTop: "12px", color: "var(--fg-muted)" }}>{share.title}</span>
        </div>
      );
    }
    
    return (
      <div className="download-box" style={{ textAlign: "center", padding: "40px" }}>
        <FileArchive size={64} style={{ color: "var(--purple)", marginBottom: "16px" }} />
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>{share.title || share.fileName}</h2>
        <p style={{ color: "var(--fg-muted)", marginBottom: "24px" }}>
          {share.fileSize ? `${Math.round(share.fileSize / 1024)} KB` : "File Share"} • {share.mimeType || "Binary File"}
        </p>
        {downloadUrl ? (
          <a href={downloadUrl} download={share.fileName} className="primary-button" style={{ textDecoration: "none", display: "inline-flex" }}>
            <Download size={18} />
            Download File
          </a>
        ) : (
          <button className="primary-button" type="button" disabled>
            Loading Download Link...
          </button>
        )}
      </div>
    );
  }
  return null;
}

export default function ViewContentPage({ notify }) {
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlockedData, setUnlockedData] = useState(null);

  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
  const shareId = urlParams.get("id");

  useEffect(() => {
    if (!shareId) {
      setError("No sharing link ID was specified.");
      setLoading(false);
      return;
    }

    async function fetchShare() {
      try {
        const res = await fetch(`${API_URL}/shares/${shareId}`);
        if (res.status === 404) {
          setError("This share link has expired or does not exist.");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load metadata.");
        }
        const data = await res.json();
        setShare(data);

        // If public (not password protected), load contents immediately
        if (!data.isPasswordProtected) {
          if (data.type === "file") {
            const downloadRes = await fetch(`${API_URL}/shares/${shareId}/download`, { method: "POST" });
            const downloadData = await downloadRes.json();
            setUnlockedData({ downloadUrl: downloadData.downloadUrl });
          } else {
            setUnlockedData({ content: data.content });
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchShare();
  }, [shareId]);

  const verifyPassword = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_URL}/shares/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      if (res.status === 401) {
        notify("Incorrect password. Access denied.", "warning");
        return;
      }
      if (!res.ok) {
        throw new Error("Password verification failed.");
      }
      
      const data = await res.json();
      if (data.authorized) {
        notify("Access granted!", "success");
        setUnlockedData({
          content: data.content,
          downloadUrl: data.downloadUrl
        });
      }
    } catch (err) {
      console.error(err);
      notify("Failed to verify password.", "warning");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-page centered-page">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Retrieving Phantom share details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-page centered-page">
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", maxWidth: "450px" }}>
          <h2 style={{ color: "#f43f5e", marginBottom: "12px" }}>Share Unavailable</h2>
          <p style={{ color: "var(--fg-muted)" }}>{error}</p>
          <a href="#/create" className="primary-button" style={{ marginTop: "24px", display: "inline-flex", textDecoration: "none" }}>
            Create New Share
          </a>
        </div>
      </div>
    );
  }

  if (share.isPasswordProtected && !unlockedData) {
    return (
      <div className="workspace-page centered-page">
        <form onSubmit={verifyPassword} className="glass-panel" style={{ padding: "40px", maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <h2 style={{ marginBottom: "8px" }}>Password Protected</h2>
          <p style={{ color: "var(--fg-muted)", fontSize: "14px", marginBottom: "24px" }}>
            Enter the password to access this secure content.
          </p>
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--bg-card, #1e293b)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "white",
              marginBottom: "20px",
              textAlign: "center"
            }}
            required
          />
          <button type="submit" className="primary-button full-width" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Unlock Share"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ textTransform: "capitalize" }}>{share.type} Share</span>
          <h1>{share.title}</h1>
        </div>
        <div className="header-metrics">
          <span>
            <Eye size={16} />
            {share.viewCount} views
          </span>
          {share.type === "file" && (
            <span>
              <Download size={16} />
              {share.downloadCount} downloads
            </span>
          )}
          <CountdownTimer expiresAt={share.expiresAt} compact />
        </div>
      </div>

      {share.burnOnView && (
        <div className="glass-panel" style={{ borderLeft: "4px solid #f43f5e", padding: "16px", marginBottom: "24px" }}>
          <strong style={{ color: "#f43f5e" }}>Burn-after-view rule active: </strong>
          This share has been permanently deleted from storage. If you refresh or close this window, it is gone forever.
        </div>
      )}

      <div className="viewer-layout" style={{ display: "block" }}>
        <section className="glass-panel content-panel" style={{ padding: "30px", minHeight: "300px" }}>
          <ContentPreview 
            share={share} 
            downloadUrl={unlockedData?.downloadUrl} 
            content={unlockedData?.content} 
          />
        </section>
      </div>
    </div>
  );
}
