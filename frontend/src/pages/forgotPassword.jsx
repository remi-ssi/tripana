import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../validators/authValidators";
import { authService } from "../services/authService";
import OTPModal from "../components/otpModal";
import EarthLoader from "../components/loadingIndicator";
import { ERROR_MESSAGES } from "../utils/errors";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const emailError = validateEmail(email);
    const formErrors = emailError ? { email: emailError } : null;
    setErrors(formErrors || {});

    if (!formErrors) {
      setIsLoading(true);
      try {
        // Added: start forgot-password flow by sending OTP if user exists.
        await authService.forgotPassword(email);
        setSubmitted(true);
        setShowOTPModal(true);
      } catch (error) {
        const message = error?.message || ERROR_MESSAGES.USER_NOT_EXISTS;
        setErrors({ submit: message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (errors.email) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      // Verify forgot-password OTP (reset token stored server-side for security)
      await authService.verifyForgotOTP(email, otp);
      // Navigate to password reset page with email (no token in URL)
      navigate(`/change-password?email=${encodeURIComponent(email)}`, {
        replace: true,
      });
    } catch (error) {
      throw new Error(error?.message || ERROR_MESSAGES.OTP_INVALID);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(email);
    } catch (error) {
      throw new Error(error?.message || ERROR_MESSAGES.OTP_RESEND_FAILED);
    }
  };

  const handleCloseOTPModal = async () => {
    try {
      await authService.cancelOTP(email);
    } finally {
      setShowOTPModal(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8">
            <EarthLoader />
          </div>
        </div>
      )}
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
        {/* Lock Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-blue-700 mb-2 tracking-tight">
          Forgot Password
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Please enter your email address and we'll send you a link
          <br />
          to reset your password
        </p>

        {!submitted ? (
          <>
            {/* Email Field */}
            <div className="text-left mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                placeholder=""
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                  errors.email
                    ? "bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400"
                    : "bg-gray-100 text-gray-800 focus:ring-blue-700 focus:bg-white"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>

            {errors.submit && (
              <p className="text-red-500 text-xs mt-1 mb-2">{errors.submit}</p>
            )}
          </>
        ) : (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
            ✓ A reset link has been sent to <span className="font-bold">{email}</span>
          </div>
        )}

        {/* Back to Login */}
        <a
          href="/login"
          className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors duration-150"
        >
          Back to Login
        </a>
        </div>
      </div>

      {/* Added: OTP modal for forgot-password flow. */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        email={email}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </>
  );
}