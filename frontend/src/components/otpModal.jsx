// src/components/OTPModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OTPModal({ isOpen, onClose, onVerify, email = "your email" }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // ── Auto-focus first input when modal opens ──
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      setError("");
      setResendTimer(30);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // ── Resend countdown ──
  useEffect(() => {
    if (!isOpen) return;
    if (resendTimer === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer, isOpen]);

  // ── Handle digit input ──
  const handleChange = (index, value) => {
    // Allow only single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Handle backspace ──
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // ── Handle paste ──
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ── Verify ──
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onVerify?.(code);
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──
  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(6).fill(""));
    setError("");
    setResendTimer(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    // call your resend API here
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-10 py-12 flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <div className="text-center">
                <h2 className="text-3xl font-extrabold tracking-widest text-[#2b2d8e] uppercase">
                  OTP Verification
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit verification code that was sent to{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-3">
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    whileFocus={{ scale: 1.08 }}
                    className={`
                      w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
                      bg-gray-100 text-[#2b2d8e] transition-colors duration-150
                      ${digit ? "border-blue-500 bg-blue-50" : "border-transparent"}
                      focus:border-blue-500 focus:bg-blue-50
                      ${error ? "border-red-400 bg-red-50" : ""}
                    `}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    className="text-sm text-red-500 -mt-2"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verify Button */}
              <motion.button
                onClick={handleVerify}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </motion.button>

              {/* Resend */}
              <p className="text-sm text-gray-500">
                Didn't receive code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="font-semibold underline text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    Resend
                  </button>
                ) : (
                  <span className="font-semibold text-gray-400">
                    Resend in {resendTimer}s
                  </span>
                )}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Usage example ─────────────────────────────────────────────────────────────
//
// import OTPModal from "@/components/OTPModal";
//
// const [showOTP, setShowOTP] = useState(false);
//
// <OTPModal
//   isOpen={showOTP}
//   onClose={() => setShowOTP(false)}
//   email="user@example.com"
//   onVerify={async (code) => {
//     const res = await fetch("/api/verify-otp", {
//       method: "POST",
//       body: JSON.stringify({ code }),
//     });
//     if (!res.ok) throw new Error("Invalid");
//     setShowOTP(false);
//   }}
// />