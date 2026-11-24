import { useEffect } from "react";
import { Save } from "lucide-react";

export default function ConfirmSaveModal({ isOpen, onClose, onConfirm, title, message }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* ── Modal card ── stop click propagation so inner clicks don't close */}
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease_out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-4">
              <Save className="h-7 w-7 text-blue-600" />
            </div>
            <h3 id="modal-title" className="text-xl font-bold text-slate-900 mb-2">
              {title || "Save Changes"}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {message || "Are you sure you want to save these changes to your itinerary?"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
