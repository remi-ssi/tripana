import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  validatePassword,
  validatePasswordMatch,
} from "../validators/authValidators";
import { ERROR_MESSAGES } from "../utils/errors";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { authService } from "../api/authService";
import EarthLoader from "../components/loadingIndicator";
import LeavePageModal from "../components/confirmExit";

export default function ChangePasswordFull() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuthStatus();
  const resetToken = new URLSearchParams(location.search).get("resetToken") || "";
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const handleSubmit = async () => {
    setError("");
    const nextFieldErrors = {};

    if (!isAuthenticated && !resetToken) {
      setError(ERROR_MESSAGES.RESET_TOKEN_INVALID);
      return;
    }

    if (isAuthenticated && !oldPassword) {
      nextFieldErrors.oldPassword = ERROR_MESSAGES.OLD_PASSWORD_REQUIRED;
    }
    if (!password) {
      nextFieldErrors.password = ERROR_MESSAGES.NEW_PASSWORD_REQUIRED;
    }
    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        nextFieldErrors.password = passwordError;
      }
    }

    if (password && confirmPassword) {
      const matchError = validatePasswordMatch(password, confirmPassword);
      if (matchError) {
        nextFieldErrors.confirmPassword =
          matchError || ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);

      // Added: route the request by flow type (logged-in vs forgot-password).
      if (isAuthenticated) {
        await authService.changePassword(oldPassword, password);
      } else {
        await authService.resetPassword(resetToken, password);
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError?.message || ERROR_MESSAGES.PASSWORD_CHANGE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitStay = () => {
    setShowConfirmExit(false);
  };

  const handleExitLeave = async () => {
    setShowConfirmExit(false);

    // Clear local form state before leaving.
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setFieldErrors({});
    setSubmitted(false);

    // Best-effort token cleanup via logout cookie clear.
    try {
      await authService.logout();
    } catch {
      // Ignore logout failure and still continue navigation.
    }

    navigate("/login", { replace: true });
  };

  const EyeIcon = ({ open }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
        </>
      )}
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <EarthLoader />
      </div>
    );
  }

  return (
    <>
      {isSubmitting && (
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
          Change Password
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          {isAuthenticated
            ? "Enter your current password and choose a new one"
            : "Create your new password"}
        </p>

        {!submitted ? (
          <>
            {isAuthenticated && (
              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (fieldErrors.oldPassword) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.oldPassword;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none focus:ring-2 transition-all duration-200 ${
                      fieldErrors.oldPassword
                        ? "bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400"
                        : "bg-gray-100 text-gray-800 focus:ring-blue-700 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
                  >
                    <EyeIcon open={showOldPassword} />
                  </button>
                </div>
                {fieldErrors.oldPassword && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.oldPassword}</p>
                )}
              </div>
            )}

            {/* New Password */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.password
                      ? "bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400"
                      : "bg-gray-100 text-gray-800 focus:ring-blue-700 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
                >
                  <EyeIcon open={showNewPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="text-left mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.confirmPassword;
                        return next;
                      });
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none focus:ring-2 transition-all duration-200 ${
                    fieldErrors.confirmPassword
                      ? "bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400"
                      : "bg-gray-100 text-gray-800 focus:ring-blue-700 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs text-left mt-1 mb-1">{error}</p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-7 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm mb-4"
            >
              {isSubmitting ? "Updating..." : "Change Password"}
            </button>
          </>
        ) : (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
            ✓ {ERROR_MESSAGES.PASSWORD_CHANGE_SUCCESS}
          </div>
        )}

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => setShowConfirmExit(true)}
          className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors duration-150"
        >
          Back to Login
        </button>
      </div>
      </div>

      <LeavePageModal
        isOpen={showConfirmExit}
        onStay={handleExitStay}
        onLeave={handleExitLeave}
      />
    </>
  );
}