import { BarChart3, Clock, FileArchive, FileCode2, FileText, Image, Lock, UploadCloud } from "lucide-react";

const nav = [
  { label: "Overview", href: "#/dashboard", icon: BarChart3 },
  { label: "Create", href: "#/create", icon: UploadCloud },
  { label: "Protected", href: "#/password", icon: Lock },
  { label: "Expired", href: "#/expired", icon: Clock }
];

const filters = [
  { label: "Text", icon: FileText },
  { label: "Code", icon: FileCode2 },
  { label: "Images", icon: Image },
  { label: "Archives", icon: FileArchive }
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Workspace navigation">
      <div className="sidebar-section">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <a href={item.href} className="sidebar-link" key={item.label}>
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </div>
      <div className="sidebar-section">
        <p className="sidebar-title">Types</p>
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button className="sidebar-link muted" type="button" key={item.label}>
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
