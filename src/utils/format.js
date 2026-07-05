export function formatDuration(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function contentIconLabel(type) {
  const labels = {
    text: "Text",
    code: "Code",
    image: "Image",
    pdf: "PDF",
    video: "Video",
    zip: "ZIP",
    document: "Document"
  };
  return labels[type] ?? "File";
}

export function navigateTo(path) {
  window.location.hash = path;
}
