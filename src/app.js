const shares = [
  { id: "aurora-build", title: "Aurora release notes", type: "document", status: "active", views: 184, downloads: 42, size: "2.4 MB", expiresAt: Date.now() + 79200000, protected: true, burn: false },
  { id: "auth-snippet", title: "Auth middleware snippet", type: "code", status: "active", views: 91, downloads: 8, size: "14 KB", expiresAt: Date.now() + 2940000, protected: false, burn: true },
  { id: "brand-assets", title: "Brand asset pack", type: "zip", status: "active", views: 328, downloads: 117, size: "86 MB", expiresAt: Date.now() + 432000000, protected: false, burn: false },
  { id: "launch-video", title: "Launch teaser", type: "video", status: "expired", views: 612, downloads: 204, size: "128 MB", expiresAt: Date.now() - 1200000, protected: false, burn: false }
];

const app = {
  route: location.hash.replace("#", "") || "/",
  theme: localStorage.getItem("phantom-theme") || "dark",
  createMode: "file",
  viewType: "code",
  filter: "all",
  query: "",
  modal: false,
  toasts: []
};

const iconPaths = {
  archive: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  bars: '<path d="M3 3v18h18"/><path d="M7 15v2"/><path d="M12 9v8"/><path d="M17 5v12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
  flame: '<path d="M8.5 14.5A4.5 4.5 0 0 0 12 22a4.5 4.5 0 0 0 4.5-7.5c-2-2-2.5-4-1.5-6-3 1-5 3-6.5 6Z"/><path d="M12 2C8 6 7 10 9 13"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  qr: '<rect width="5" height="5" x="3" y="3"/><rect width="5" height="5" x="16" y="3"/><rect width="5" height="5" x="3" y="16"/><path d="M16 16h2v2h-2zM20 20h1v1h-1zM12 7h1v1h-1zM12 12h3v3h-3z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/>',
  spark: '<path d="M12 2v6"/><path d="M12 16v6"/><path d="m4.9 4.9 4.2 4.2"/><path d="m14.9 14.9 4.2 4.2"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="m4.9 19.1 4.2-4.2"/><path d="m14.9 9.1 4.2-4.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8"/><path d="M12 3v12"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};

function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`;
}

function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d) return `${d}d ${h}h ${m}m`;
  if (h) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function countdown(expiresAt, compact = false) {
  return `<span class="countdown ${compact ? "compact-countdown" : ""}" data-expires="${expiresAt}">${icon("clock", compact ? 14 : 18)}<span>${fmt(expiresAt - Date.now())}</span></span>`;
}

function shell(content, isAppPage = app.route !== "/") {
  return `
    <div class="app-shell">
      <header class="navbar">
        <a class="brand" href="#/" aria-label="PhantomShare home"><span class="brand-mark">P</span><span>PhantomShare</span></a>
        <nav class="nav-links" aria-label="Primary navigation">
          <a href="#/create">${icon("plus", 17)}Create</a>
          <a href="#/dashboard">${icon("bars", 17)}Dashboard</a>
          <a href="#/view">${icon("link", 17)}Demo View</a>
        </nav>
        <div class="nav-actions">
          <button class="theme-toggle" type="button" aria-label="Toggle color theme" onclick="Phantom.toggleTheme()"><span class="toggle-track"><span class="toggle-thumb">${icon(app.theme === "light" ? "sun" : "moon", 16)}</span></span></button>
          <a class="primary-button compact" href="#/create">${icon("plus", 17)}<span>Create Share</span></a>
        </div>
      </header>
      ${isAppPage ? sidebar() : ""}
      <main class="${isAppPage ? "page-shell app-page" : "page-shell"}">${content}</main>
      <div class="toast-host" aria-live="polite">${app.toasts.map((t) => `<div class="toast ${t.tone}">${icon(t.tone === "warning" ? "archive" : t.tone === "info" ? "file" : "check")} ${t.message}</div>`).join("")}</div>
    </div>`;
}

function sidebar() {
  return `<aside class="sidebar" aria-label="Workspace navigation">
    <div class="sidebar-section">
      <a href="#/dashboard" class="sidebar-link">${icon("bars")}Overview</a>
      <a href="#/create" class="sidebar-link">${icon("upload")}Create</a>
      <a href="#/password" class="sidebar-link">${icon("lock")}Protected</a>
      <a href="#/expired" class="sidebar-link">${icon("clock")}Expired</a>
    </div>
    <div class="sidebar-section">
      <p class="sidebar-title">Types</p>
      <button class="sidebar-link muted" type="button">${icon("file")}Text</button>
      <button class="sidebar-link muted" type="button">${icon("code")}Code</button>
      <button class="sidebar-link muted" type="button">${icon("image")}Images</button>
      <button class="sidebar-link muted" type="button">${icon("archive")}Archives</button>
    </div>
  </aside>`;
}

function stat(iconName, label, value, delta) {
  return `<article class="stat-card"><div class="stat-icon">${icon(iconName, 20)}</div><p>${label}</p><strong>${value}</strong><span>${delta}</span></article>`;
}

function landing() {
  const feature = (name, title, body) => `<article class="feature-card"><div class="feature-icon">${icon(name, 22)}</div><h3>${title}</h3><p>${body}</p></article>`;
  return shell(`<div class="landing">
    <section class="hero-section">
      <div class="hero-copy">
        <span class="eyebrow">${icon("spark", 15)}Temporary sharing for fast-moving teams</span>
        <h1>Share Anything. Automatically Disappears.</h1>
        <p>PhantomShare turns sensitive text, code, media, and files into polished temporary links with expiration, passwords, QR codes, and live activity signals.</p>
        <div class="hero-actions"><a class="primary-button" href="#/create">Create Share ${icon("arrow")}</a><a class="ghost-button" href="#/dashboard">View Dashboard</a></div>
      </div>
      <div class="hero-visual" aria-label="PhantomShare dashboard preview">
        <div class="floating-window window-main"><div class="window-bar"><span></span><span></span><span></span></div><div class="share-link-preview"><div><span class="tiny-label">Temporary Link</span><strong>phantom.sh/s/aurora-build</strong></div>${icon("copy")}</div><div class="preview-grid"><span></span><span></span><span></span><span></span></div></div>
        <div class="floating-window window-side">${icon("shield", 23)}<strong>Password On</strong><span>Burn after view</span></div>
        <div class="floating-window window-timer">${icon("spark", 21)}<strong>23:58:14</strong><span>Remaining</span></div>
      </div>
    </section>
    <section class="section-band"><div class="section-heading"><span class="eyebrow">Features</span><h2>Built for ephemeral handoffs</h2></div><div class="feature-grid">
      ${feature("file", "Any format", "Text, snippets, images, video, PDFs, ZIPs, and documents in one temporary workspace.")}
      ${feature("clock", "Auto-expiring links", "Choose 1 hour, 24 hours, or 7 days and let stale shares disappear on schedule.")}
      ${feature("lock", "Private by default", "Add passwords, burn-after-first-view rules, and clear activity counters.")}
      ${feature("qr", "Instant handoff", "Copy links, show QR codes, or share directly across channels.")}
    </div></section>
    <section class="section-band split-band"><div class="section-heading"><span class="eyebrow">How It Works</span><h2>Three moves, zero clutter</h2></div><div class="steps">
      ${["Drop files or paste content", "Set expiration and access rules", "Send the temporary PhantomShare link"].map((s, i) => `<article class="step-card"><span>${i + 1}</span><h3>${s}</h3></article>`).join("")}
    </div></section>
    <section class="section-band"><div class="stats-grid">${stat("archive", "Auto-expired shares", "2.8M", "+18% this month")}${stat("clock", "Median share lifetime", "19h", "Across all workspaces")}${stat("shield", "Protected transfers", "94%", "Password or burn rule")}</div></section>
    <footer class="footer"><span>PhantomShare</span><span>Temporary links for text, code, media, and files.</span></footer>
  </div>`, false);
}

function createPage() {
  const modeButton = (mode, label, iconName) => `<button class="${app.createMode === mode ? "active" : ""}" type="button" onclick="Phantom.setCreateMode('${mode}')">${icon(iconName, 16)}${label}</button>`;
  const body = app.createMode === "file" ? fileUpload() : app.createMode === "text" ? `<textarea class="text-input" aria-label="Text content">Paste a client note, incident summary, or design handoff here.</textarea>` : codeEditor();
  return shell(`<div class="workspace-page">
    <div class="page-header"><div><span class="eyebrow">Create Share</span><h1>Package content into a temporary link</h1></div><button class="primary-button" type="button" onclick="Phantom.openModal()">Generate Share Link ${icon("arrow")}</button></div>
    <div class="create-layout">
      <section class="glass-panel create-main"><div class="segmented-control" role="tablist">${modeButton("file", "Files", "file")}${modeButton("text", "Text", "file")}${modeButton("code", "Code", "code")}</div>${body}</section>
      <aside class="glass-panel settings-panel"><div class="panel-title">${icon("clock", 19)}<h2>Expiration</h2></div><div class="expiration-grid">${["1 Hour", "24 Hours", "7 Days"].map((e, i) => `<button class="option-card ${i === 1 ? "active" : ""}" type="button">${i === 1 ? icon("check", 16) : ""}${e}</button>`).join("")}</div>
      <div class="switch-list"><label class="switch-row"><span>${icon("lock")}Password protection</span><input type="checkbox" checked /></label><label class="password-field">${icon("key", 17)}<input type="password" placeholder="Set optional password" aria-label="Share password" /></label><label class="switch-row"><span>${icon("flame")}Burn after first view</span><input type="checkbox" /></label></div></aside>
    </div>
    ${app.modal ? modal() : ""}
  </div>`);
}

function fileUpload() {
  return `<section class="upload-zone" id="upload-zone">
    <input id="file-input" class="sr-only" type="file" multiple />
    <label for="file-input" class="upload-label"><span class="upload-icon">${icon("upload", 26)}</span><span class="upload-title">Drop files here or browse</span><span class="upload-subtitle">Text, code, images, videos, PDFs, ZIPs, and documents</span></label>
    <div class="upload-types"><span>${icon("image", 15)}Images</span><span>${icon("video", 15)}Videos</span><span>${icon("file", 15)}PDFs</span><span>${icon("archive", 15)}ZIP</span></div>
    <div class="file-list" id="file-list"></div>
  </section>`;
}

function codeEditor() {
  const code = `function expireShare(share) {
  if (share.burnAfterView && share.views > 0) {
    return "expired";
  }

  return Date.now() > share.expiresAt ? "expired" : "active";
}`;
  return `<div class="code-editor"><div class="editor-toolbar"><span>${icon("code", 16)}snippet.js</span><span>JavaScript</span></div><div class="editor-body"><pre>${code.replace(/</g, "&lt;")}</pre><textarea aria-label="Code snippet" spellcheck="false">${code}</textarea></div></div>`;
}

function modal() {
  return `<div class="modal-backdrop" role="presentation" onclick="Phantom.closeModal()"><section class="modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="modal-header"><h2>Share ready</h2><button class="icon-button" type="button" aria-label="Close dialog" onclick="Phantom.closeModal()">${icon("x")}</button></div><p class="modal-copy">Your temporary link is ready with a 24 hours expiration.</p><div class="modal-actions"><button class="ghost-button" type="button" onclick="Phantom.closeModal()">Keep Editing</button><button class="primary-button" type="button" onclick="Phantom.go('/success')">View Link ${icon("arrow")}</button></div></section></div>`;
}

function successPage() {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const x = i % 11, y = Math.floor(i / 11);
    return `<span class="${(x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7) || ((x * 17 + y * 23 + i) % 5 < 2) ? "filled" : ""}"></span>`;
  }).join("");
  return shell(`<div class="workspace-page centered-page"><section class="success-panel"><span class="status-orb">${icon("qr", 27)}</span><span class="eyebrow">Share Success</span><h1>Your temporary link is live</h1><div class="generated-link"><span>https://phantomshare.app/s/aurora-7xq9</span><button class="icon-button" type="button" aria-label="Copy generated URL" onclick="Phantom.copyLink()">${icon("copy")}</button></div><div class="success-grid"><div class="qr-card" aria-label="QR code for generated share link"><div class="qr-grid">${cells}</div></div><div class="countdown-panel"><span>Expires in</span>${countdown(Date.now() + 85320000)}<div class="social-buttons" aria-label="Share via social media"><button type="button" aria-label="Share by email">${icon("send")}</button><button type="button" aria-label="Share by message">${icon("link")}</button><button type="button" aria-label="Share on LinkedIn">${icon("file")}</button><button type="button" aria-label="Share on Facebook">${icon("spark")}</button></div><button class="primary-button full-width" type="button" onclick="Phantom.copyLink()">${icon("send")}Copy Secure Link</button></div></div></section></div>`);
}

function contentPreview() {
  if (app.viewType === "text") return `<div class="text-viewer">Quick context for tomorrow: the launch packet is ready, design QA is clean, and the final review link expires automatically after the team signs off.</div>`;
  if (app.viewType === "code") return `<pre class="code-viewer"><code>const createShare = async ({ payload, expiresIn, password }) => {
  const encrypted = await vault.seal(payload, password);

  return {
    id: crypto.randomUUID(),
    url: phantom.link(encrypted),
    expiresAt: Date.now() + expiresIn
  };
};</code></pre>`;
  if (app.viewType === "image") return `<div class="image-preview"><div class="image-sky"></div><div class="image-panel"></div><span>launch-preview.png</span></div>`;
  if (app.viewType === "pdf") return `<div class="pdf-preview"><div class="pdf-page"><span></span><strong>Project Brief</strong><span></span><span></span><span></span></div></div>`;
  if (app.viewType === "video") return `<div class="video-preview">${icon("video", 62)}<span>launch-teaser.mp4</span></div>`;
  return `<div class="download-box">${icon("archive", 54)}<h2>brand-assets.zip</h2><p>86 MB compressed archive</p><button class="primary-button" type="button">${icon("download")}Download File</button></div>`;
}

function viewPage() {
  const types = [["text", "Text", "file"], ["code", "Code", "code"], ["image", "Image", "image"], ["pdf", "PDF", "file"], ["video", "Video", "video"], ["zip", "ZIP", "archive"]];
  return shell(`<div class="workspace-page"><div class="page-header"><div><span class="eyebrow">Shared Content</span><h1>Aurora launch packet</h1></div><div class="header-metrics"><span>${icon("eye", 16)}184 views</span><span>${icon("download", 16)}42 downloads</span>${countdown(Date.now() + 2640000, true)}</div></div><div class="viewer-layout"><aside class="glass-panel type-rail"><label class="search-box">${icon("search", 16)}<input placeholder="Search files" aria-label="Search shared files" /></label>${types.map(([type, label, iconName]) => `<button class="type-button ${app.viewType === type ? "active" : ""}" type="button" onclick="Phantom.setViewType('${type}')">${icon(iconName, 17)}${label}</button>`).join("")}</aside><section class="glass-panel content-panel">${contentPreview()}</section></div></div>`);
}

function passwordPage() {
  return shell(`<div class="workspace-page centered-page"><section class="password-panel"><span class="status-orb">${icon("lock", 28)}</span><span class="eyebrow">Protected Share</span><h1>Enter password to unlock</h1><label class="unlock-field">${icon("key")}<input type="password" placeholder="Password" aria-label="Share password" /></label><button class="primary-button full-width" type="button" onclick="Phantom.toast('Share unlocked'); Phantom.go('/view')">${icon("shield")}Unlock ${icon("arrow")}</button></section></div>`);
}

function expiredPage() {
  return shell(`<div class="workspace-page centered-page"><section class="expired-panel"><div class="expired-illustration" aria-hidden="true"><span class="moon"></span><span class="paper one"></span><span class="paper two"></span><span class="spark a"></span><span class="spark b"></span></div><span class="status-orb warning">${icon("clock", 28)}</span><span class="eyebrow">Content Expired</span><h1>This PhantomShare link has disappeared</h1><p>The temporary window closed and the shared content is no longer available.</p><a class="primary-button" href="#/create">${icon("plus")}Create New Share</a></section></div>`);
}

function shareCard(share) {
  return `<article class="share-card ${share.status}"><div class="share-card-top"><div><span class="type-pill">${share.type}</span><h3>${share.title}</h3></div><button class="icon-button" type="button" aria-label="More actions for ${share.title}">${icon("more")}</button></div><div class="share-card-meta"><span>${icon("eye", 15)}${share.views}</span><span>${icon("download", 15)}${share.downloads}</span><span>${share.size}</span></div><div class="share-card-bottom">${share.status === "active" ? countdown(share.expiresAt, true) : '<span class="expired-pill">Expired</span>'}<div class="mini-flags">${share.protected ? icon("lock", 15) : ""}${share.burn ? icon("flame", 15) : ""}</div></div></article>`;
}

function dashboardPage() {
  const active = shares.filter((s) => s.status === "active").length;
  const expired = shares.filter((s) => s.status === "expired").length;
  const views = shares.reduce((n, s) => n + s.views, 0);
  const filtered = shares.filter((s) => (app.filter === "all" || s.type === app.filter) && s.title.toLowerCase().includes(app.query.toLowerCase()));
  return shell(`<div class="workspace-page"><div class="page-header"><div><span class="eyebrow">Dashboard</span><h1>Share activity at a glance</h1></div><a class="primary-button" href="#/create">${icon("send")}New Share</a></div><div class="stats-grid dashboard-stats">${stat("file", "Recent Shares", shares.length, "Last 7 days")}${stat("clock", "Active Shares", active, "Live right now")}${stat("archive", "Expired Shares", expired, "Cleaned automatically")}${stat("database", "Storage Usage", "216 MB", "4.2 GB available")}${stat("eye", "Total Views", views.toLocaleString(), "+24% this week")}</div><section class="glass-panel dashboard-panel"><div class="dashboard-toolbar"><label class="search-box">${icon("search", 16)}<input value="${app.query}" oninput="Phantom.setQuery(this.value)" placeholder="Search shares" aria-label="Search shares" /></label><div class="filter-row" aria-label="Filter by content type">${["all", "text", "code", "image", "pdf", "video", "zip", "document"].map((f) => `<button class="${app.filter === f ? "active" : ""}" type="button" onclick="Phantom.setFilter('${f}')">${f}</button>`).join("")}</div></div><div class="activity-strip"><div>${icon("bars", 20)}<span>Transfer velocity</span><strong>38/min</strong></div><div>${icon("spark", 20)}<span>Download rate</span><strong>71%</strong></div><div class="skeleton-stack"><span></span><span></span><span></span></div></div><div class="share-grid">${filtered.map(shareCard).join("")}</div></section></div>`);
}

function render() {
  document.documentElement.dataset.theme = app.theme;
  const routes = { "/": landing, "/create": createPage, "/success": successPage, "/view": viewPage, "/password": passwordPage, "/expired": expiredPage, "/dashboard": dashboardPage };
  document.getElementById("root").innerHTML = (routes[app.route] || landing)();
  wireUploads();
}

function wireUploads() {
  const zone = document.getElementById("upload-zone");
  const input = document.getElementById("file-input");
  const list = document.getElementById("file-list");
  if (!zone || !input || !list) return;
  const showFiles = (files) => {
    list.innerHTML = [...files].map((file) => `<div class="file-row">${icon("file", 17)}<span>${file.name}</span><strong>${Math.max(1, Math.round(file.size / 1024))} KB</strong></div>`).join("");
    if (files.length) Phantom.toast("File ready for sharing", "info");
  };
  input.addEventListener("change", () => showFiles(input.files));
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("is-dragging");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-dragging");
    showFiles(event.dataTransfer.files);
  });
}

window.Phantom = {
  go(route) {
    location.hash = route;
  },
  toggleTheme() {
    app.theme = app.theme === "dark" ? "light" : "dark";
    localStorage.setItem("phantom-theme", app.theme);
    render();
  },
  setCreateMode(mode) {
    app.createMode = mode;
    render();
  },
  setViewType(type) {
    app.viewType = type;
    render();
  },
  setFilter(filter) {
    app.filter = filter;
    render();
  },
  setQuery(query) {
    app.query = query;
    render();
    const input = document.querySelector(".dashboard-toolbar input");
    if (input) {
      input.focus();
      input.setSelectionRange(query.length, query.length);
    }
  },
  openModal() {
    app.modal = true;
    this.toast("Share link generated");
    render();
  },
  closeModal() {
    app.modal = false;
    render();
  },
  copyLink() {
    navigator.clipboard?.writeText("https://phantomshare.app/s/aurora-7xq9");
    this.toast("Link copied to clipboard");
  },
  toast(message, tone = "success") {
    const id = crypto.randomUUID();
    app.toasts.push({ id, message, tone });
    render();
    setTimeout(() => {
      app.toasts = app.toasts.filter((toast) => toast.id !== id);
      render();
    }, 2600);
  }
};

window.addEventListener("hashchange", () => {
  app.route = location.hash.replace("#", "") || "/";
  render();
});

setInterval(() => {
  document.querySelectorAll("[data-expires]").forEach((element) => {
    const span = element.querySelector("span");
    if (span) span.textContent = fmt(Number(element.dataset.expires) - Date.now());
  });
}, 1000);

render();
