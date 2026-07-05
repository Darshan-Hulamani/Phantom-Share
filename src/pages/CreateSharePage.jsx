import { ArrowRight, Check, Clock3, FileText, Flame, KeyRound, Lock, MessageSquareText, Settings2 } from "lucide-react";
import { useState } from "react";
import CodeEditor from "../components/CodeEditor.jsx";
import FileUpload from "../components/FileUpload.jsx";
import Modal from "../components/Modal.jsx";
import { navigateTo } from "../utils/format.js";
import { API_URL } from "../config.js";

const expirations = [
  { label: "1 Hour", ms: 1000 * 60 * 60 },
  { label: "24 Hours", ms: 1000 * 60 * 60 * 24 },
  { label: "7 Days", ms: 1000 * 60 * 60 * 24 * 7 }
];

export default function CreateSharePage({ notify, setActiveShare }) {
  const [mode, setMode] = useState("file");
  const [expiration, setExpiration] = useState(expirations[1].label);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [burnEnabled, setBurnEnabled] = useState(false);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("Paste a client note, incident summary, or design handoff here.");
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (mode === "file" && !file) {
      notify("Please select a file to share", "warning");
      return;
    }
    if (mode === "text" && !text.trim()) {
      notify("Please enter some text content", "warning");
      return;
    }
    if (mode === "code" && !code.trim()) {
      notify("Please enter some code content", "warning");
      return;
    }

    setIsGenerating(true);
    notify("Creating secure share...", "info");

    try {
      const expirationSeconds = expiration === "1 Hour" ? 3600 : expiration === "24 Hours" ? 86400 : 604800;

      const payload = {
        type: mode,
        expiresIn: expirationSeconds,
        burnOnView: burnEnabled,
        password: passwordEnabled && password ? password : undefined,
      };

      if (mode === "file") {
        payload.fileName = file.name;
        payload.fileSize = file.size;
        payload.mimeType = file.type || "application/octet-stream";
      } else if (mode === "text") {
        payload.content = text;
        payload.title = "Text Share";
      } else {
        payload.content = code;
        payload.title = "Code Snippet";
      }

      // 1. Post to API Gateway
      const res = await fetch(`${API_URL}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to register share with backend API.");
      }

      const data = await res.json();
      const { shareId, uploadUrl, expiresAt } = data;

      // 2. Direct S3 upload if file share
      if (mode === "file" && uploadUrl) {
        notify("Uploading file directly to AWS S3...", "info");
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file binary to S3 storage.");
        }
      }

      // 3. Set active share for success screen
      const newShare = {
        shareId,
        expiresAt: expiresAt * 1000, // Convert to ms for frontend
        type: mode,
        title: mode === "file" ? file.name : payload.title,
        isPasswordProtected: !!payload.password,
        burnOnView: burnEnabled,
        size: mode === "file" ? `${Math.max(1, Math.round(file.size / 1024))} KB` : undefined
      };

      setActiveShare(newShare);

      // Save to local storage history for dashboard
      const history = JSON.parse(localStorage.getItem("phantom-history") || "[]");
      localStorage.setItem("phantom-history", JSON.stringify([newShare, ...history]));

      notify("Share link generated!", "success");
      navigateTo("/success");

    } catch (err) {
      console.error(err);
      notify(err.message || "An error occurred.", "warning");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Create Share</span>
          <h1>Package content into a temporary link</h1>
        </div>
        <button 
          className="primary-button" 
          type="button" 
          onClick={generate}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Share Link"}
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="create-layout">
        <section className="glass-panel create-main">
          <div className="segmented-control" role="tablist" aria-label="Share content type">
            <button className={mode === "file" ? "active" : ""} type="button" onClick={() => setMode("file")}>
              <FileText size={16} />
              Files
            </button>
            <button className={mode === "text" ? "active" : ""} type="button" onClick={() => setMode("text")}>
              <MessageSquareText size={16} />
              Text
            </button>
            <button className={mode === "code" ? "active" : ""} type="button" onClick={() => setMode("code")}>
              <Settings2 size={16} />
              Code
            </button>
          </div>

          {mode === "file" && (
            <FileUpload 
              onFiles={(fileList) => {
                if (fileList && fileList.length > 0) {
                  setFile(fileList[0]);
                  notify(`File "${fileList[0].name}" is ready`, "info");
                }
              }} 
            />
          )}
          {mode === "text" && (
            <textarea
              className="text-input"
              aria-label="Text content"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          )}
          {mode === "code" && <CodeEditor value={code} onChange={setCode} />}
        </section>

        <aside className="glass-panel settings-panel">
          <div className="panel-title">
            <Clock3 size={19} />
            <h2>Expiration</h2>
          </div>
          <div className="expiration-grid">
            {expirations.map((item) => (
              <button
                className={expiration === item.label ? "option-card active" : "option-card"}
                key={item.label}
                type="button"
                onClick={() => setExpiration(item.label)}
              >
                {expiration === item.label && <Check size={16} />}
                {item.label}
              </button>
            ))}
          </div>

          <div className="switch-list">
            <label className="switch-row">
              <span>
                <Lock size={18} />
                Password protection
              </span>
              <input type="checkbox" checked={passwordEnabled} onChange={(event) => setPasswordEnabled(event.target.checked)} />
            </label>
            {passwordEnabled && (
              <label className="password-field">
                <KeyRound size={17} />
                <input 
                  type="password" 
                  placeholder="Set optional password" 
                  aria-label="Share password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            <label className="switch-row">
              <span>
                <Flame size={18} />
                Burn after first view
              </span>
              <input type="checkbox" checked={burnEnabled} onChange={(event) => setBurnEnabled(event.target.checked)} />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
