import { FileArchive, FileText, Image, UploadCloud, Video } from "lucide-react";
import { useState } from "react";

const accepted = [
  { label: "Images", icon: Image },
  { label: "Videos", icon: Video },
  { label: "PDFs", icon: FileText },
  { label: "ZIP", icon: FileArchive }
];

export default function FileUpload({ onFiles }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList).map((file) => ({
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      type: file.type || "application/octet-stream"
    }));
    setFiles(incoming);
    onFiles?.(fileList);
  };

  return (
    <section
      className={`upload-zone ${isDragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        addFiles(event.dataTransfer.files);
      }}
    >
      <input
        id="file-input"
        className="sr-only"
        type="file"
        multiple
        onChange={(event) => addFiles(event.target.files)}
      />
      <label htmlFor="file-input" className="upload-label">
        <span className="upload-icon">
          <UploadCloud size={26} />
        </span>
        <span className="upload-title">Drop files here or browse</span>
        <span className="upload-subtitle">Text, code, images, videos, PDFs, ZIPs, and documents</span>
      </label>
      <div className="upload-types" aria-label="Supported file types">
        {accepted.map((item) => {
          const Icon = item.icon;
          return (
            <span key={item.label}>
              <Icon size={15} />
              {item.label}
            </span>
          );
        })}
      </div>
      {files.length > 0 && (
        <div className="file-list" aria-live="polite">
          {files.map((file) => (
            <div className="file-row" key={`${file.name}-${file.size}`}>
              <FileText size={17} />
              <span>{file.name}</span>
              <strong>{file.size}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
