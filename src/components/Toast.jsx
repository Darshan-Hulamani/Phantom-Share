import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

const icons = {
  success: CheckCircle2,
  warning: TriangleAlert,
  info: Info
};

export default function ToastHost({ toasts }) {
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone] || icons.info;
        return (
          <div className={`toast ${toast.tone}`} key={toast.id}>
            <Icon size={18} />
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
