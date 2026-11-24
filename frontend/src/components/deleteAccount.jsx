import { useState, useEffect } from "react";

const TOTAL_STEPS = 3;

export default function DeactivateModal({ isOpen, onClose, onConfirm }) {
    const [step, setStep] = useState(0);

    // Reset to step 0 every time modal opens
    useEffect(() => {
        if (isOpen) setStep(0);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleNext = () => setStep((s) => s + 1);
    const handleConfirm = () => {
        onConfirm?.();   // call your real delete-account API here
        onClose();
    };

    return (
        /* ── Backdrop ── */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            onClick={onClose}           /* click outside = close */
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            {/* ── Modal card ── stop click propagation so inner clicks don't close */}
            <div
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Progress bar ── */}
                <div className="h-1 bg-blue-50">
                    <div
                        className="h-1 bg-blue-600 transition-all duration-300"
                        style={{ width: `${((step + 1) / (TOTAL_STEPS + 1)) * 100}%` }}
                    />
                </div>

                {/* ── Step indicator ── */}
                <div className="flex justify-center gap-2 pt-5">
                    {Array.from({ length: TOTAL_STEPS + 1 }).map((_, i) => (
                        <span
                            key={i}
                            className="w-2 h-2 rounded-full transition-all duration-200"
                            style={{
                                backgroundColor: i <= step ? "#2563EB" : "#DBEAFE",
                            }}
                        />
                    ))}
                </div>

                {/* ── Content ── */}
                <div className="px-6 pt-5 pb-6 min-h-[200px] flex flex-col">

                    {/* Step 0 — Are you sure? */}
                    {step === 0 && (
                        <StepShell
                            icon="⚠️"
                            title="Deactivate your account?"
                            body="Are you sure you want to deactivate your account? This will begin the deletion process."
                        >
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                No, keep my account
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Yes, continue
                            </button>
                        </StepShell>
                    )}

                    {/* Step 1 — Data warning */}
                    {step === 1 && (
                        <StepShell
                            icon="🗂️"
                            title="Your data will be deleted"
                            body="All your saved itineraries, trip plans, places, and account information will be permanently removed from our system."
                        >
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </StepShell>
                    )}

                    {/* Step 2 — Cannot be undone */}
                    {step === 2 && (
                        <StepShell
                            icon="🔒"
                            title="This cannot be undone"
                            body="Once your account is deleted, there is no way to recover it. You will lose access to all features and your data cannot be restored."
                        >
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </StepShell>
                    )}

                    {/* Step 3 — Final confirmation */}
                    {step === 3 && (
                        <StepShell
                            icon="🗑️"
                            title="Confirm account deletion"
                            body="This is your final confirmation. Your account and all associated data will be permanently deleted immediately."
                            highlight
                        >
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Delete my account
                            </button>
                        </StepShell>
                    )}

                </div>
            </div>
        </div>
    );
}

// ─── Reusable step layout ─────────────────────────────────────────────────────
function StepShell({ icon, title, body, highlight, children }) {
    return (
        <div className="flex flex-col flex-1">
            {/* Icon */}
            <div className="text-4xl text-center mb-4">{icon}</div>

            {/* Title */}
            <h2
                id="modal-title"
                className="text-base font-bold text-center mb-2"
                style={{ color: "#1E3A5F" }}
            >
                {title}
            </h2>

            {/* Body */}
            <p
                className={`text-sm text-center leading-relaxed mb-6 ${highlight ? "text-red-500 font-medium" : "text-slate-500"
                    }`}
            >
                {body}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">{children}</div>
        </div>
    );
}