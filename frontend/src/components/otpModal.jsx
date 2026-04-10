// src/components/OTPModal.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ERROR_MESSAGES, OTP_CONFIG } from "../utils/errors";

const { RESEND_WAIT_SECONDS, BLOCK_DURATION_SECONDS, BLOCKED_ERROR_KEYWORDS } = OTP_CONFIG;

// Detect if error message indicates a block state
const isBlockedError = (message = "") => {
  const text = String(message).toLowerCase();
  return BLOCKED_ERROR_KEYWORDS.some((keyword) => text.includes(keyword));
};

//set countdown format mm:ss
const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function OTPModal({isOpen, onClose, onVerify, onResend, email = "your email",}) {
  const [otp, setOtp] = useState(Array(6).fill(""));  
  const [error, setError] = useState(""); 
  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS); 
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [blockedSeconds, setBlockedSeconds] = useState(0);
  const [justUnblocked, setJustUnblocked] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");
  const inputRefs = useRef([]);
  const isBlocked = blockedSeconds > 0;

  // ── Auto-focus first input when modal opens ──
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      setError("");
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
      setConfirmExit(false);
      setBlockedSeconds(0);
      setJustUnblocked(false);
      setClosing(false);
      setCloseError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // ── Block countdown ──
  useEffect(() => {
    if (!isOpen || blockedSeconds <= 0) return;
    // Automatically unblock after countdown ends
    const id = setTimeout(() => {
      setBlockedSeconds((prev) => {
        if (prev <= 1) {
          setError("");
          setJustUnblocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  // Clear timeout if modal closes or block ends
    return () => clearTimeout(id);
  }, [blockedSeconds, isOpen]);

  // Activate block state with appropriate error message and timers
  const activateBlockedState = () => {
    setBlockedSeconds(BLOCK_DURATION_SECONDS);
    setJustUnblocked(false);
    setError(ERROR_MESSAGES.OTP_BLOCKED);
    setCanResend(false);
    setResendTimer(RESEND_WAIT_SECONDS);
  };

  // Handle modal close request with confirmation
  const handleRequestClose = () => {
    setCloseError("");
    setConfirmExit(true);
  };

  // Handle user choosing to stay in modal
  const handleStay = () => {
    setCloseError("");
    setConfirmExit(false);
  };

  // Handle user confirming exit 
  const handleConfirmExit = async () => {
    setClosing(true);
    setCloseError("");
    try {
      await onClose?.();
      setConfirmExit(false);
    } catch (err) {
      const message = err?.message || ERROR_MESSAGES.OTP_CLOSE_FAILED;
      setCloseError(message);
    } finally {
      setClosing(false);
    }
  };

  // ── Resend countdown ──
  useEffect(() => {
    if (!isOpen) return;
    if (isBlocked) return;
    if (resendTimer === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer, isOpen, isBlocked]);

  // ── Handle digit input ──
  const handleChange = (index, value) => {
    if (isBlocked) return;

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
    if (isBlocked) return;

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
    if (isBlocked) return;

    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ── Handle OTP verification ──
  const handleVerify = async () => {
    if (isBlocked) return;

    const code = otp.join("");
    if (code.length < 6) {
      setError(ERROR_MESSAGES.OTP_INCOMPLETE);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onVerify?.(code);
    } catch (err) {
      const message = err?.message || ERROR_MESSAGES.OTP_INVALID;
      if (isBlockedError(message)) {
        activateBlockedState();
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──
  const handleResend = async () => {
    if (!canResend || isBlocked) return;
    setResending(true);
    setError("");

    try {
      await onResend?.();
      setOtp(Array(6).fill(""));
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = err?.message || ERROR_MESSAGES.OTP_RESEND_FAILED;

      if (isBlockedError(message)) {
        activateBlockedState();
        return;
      }

      setError(message);

      const waitMatch = message.match(/(\d+)\s*seconds?/i);
      if (waitMatch) {
        const waitSeconds = Number(waitMatch[1]);
        if (!Number.isNaN(waitSeconds) && waitSeconds > 0) {
          setResendTimer(waitSeconds);
          setCanResend(false);
        }
      }
    } finally {
      setResending(false);
    }
  };

  // Automatically send a fresh OTP once the block period ends.
  useEffect(() => {
    if (!isOpen || !justUnblocked || confirmExit || closing) return;
  
    const autoResend = async () => {
      setResending(true);
      setError("");
      try {
        await onResend?.();
        setOtp(Array(6).fill(""));
        setResendTimer(RESEND_WAIT_SECONDS);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } catch (err) {
        const message = err?.message || ERROR_MESSAGES.OTP_RESEND_FAILED;
        setError(message);

        const waitMatch = message.match(/(\d+)\s*seconds?/i);
        if (waitMatch) {
          const waitSeconds = Number(waitMatch[1]);
          if (!Number.isNaN(waitSeconds) && waitSeconds > 0) {
            setResendTimer(waitSeconds);
            setCanResend(false);
          }
        }
      } finally {
        setResending(false);
        setJustUnblocked(false);
      }
    };

    autoResend();
  }, [justUnblocked, isOpen, confirmExit, closing, onResend]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleRequestClose}
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
              <button
                onClick={handleRequestClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl leading-none flex items-center justify-center transition-colors"
              >
                X
              </button>

              {confirmExit ? (
                <>
                  <div className="text-center">
                    <h2 className="text-2xl font-extrabold tracking-wide text-[#2b2d8e]">
                      Are you sure you want to exit?
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Your current OTP entry will be cleared.
                    </p>
                  </div>

                  <div className="w-full flex gap-3">
                    <button
                      onClick={handleStay}
                      disabled={closing}
                      className="w-1/2 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                    >
                      No
                    </button>
                    <button
                      onClick={handleConfirmExit}
                      disabled={closing}
                      className="w-1/2 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                    >
                      {closing ? "Closing..." : "Yes"}
                    </button>
                  </div>

                  {closeError && (
                    <p className="w-full text-center text-sm text-red-500 -mt-1">{closeError}</p>
                  )}
                </>
              ) : (
                <>
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
                        disabled={isBlocked}
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
                          ${(error || isBlocked) ? "border-red-400 bg-red-50 text-red-700" : ""}
                          ${isBlocked ? "opacity-80 cursor-not-allowed" : ""}
                        `}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="w-full text-center text-sm text-red-500 -mt-2"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {error}
                        {isBlocked ? ` (${formatCountdown(blockedSeconds)})` : ""}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Verify Button */}
                  <motion.button
                    onClick={handleVerify}
                    disabled={loading || isBlocked}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </motion.button>

                  {/* Resend */}
                  {!isBlocked && (
                    <p className="text-sm text-gray-500">
                      Didn't receive code?{" "}
                      {canResend ? (
                        <button
                          onClick={handleResend}
                          disabled={resending}
                          className="font-semibold underline text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {resending ? "Resending..." : "Resend"}
                        </button>
                      ) : (
                        <span className="font-semibold text-gray-400">
                          Resend in {resendTimer}s
                        </span>
                      )}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}