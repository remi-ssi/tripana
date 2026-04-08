import { useState } from "react";

export default function ChangePasswordFull() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!oldPassword || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitted(true);
  };

  return (
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
          Enter a new password to change your old password
        </p>

        {!submitted ? (
          <>
            {/* Old Password */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* New Password */}
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Confirm Password */}
            <div className="text-left mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs text-left mt-1 mb-1">{error}</p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full mt-7 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm mb-4"
            >
              Change Password
            </button>
          </>
        ) : (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
            ✓ Your password has been changed successfully.
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
  );
}