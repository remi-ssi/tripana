import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) {
      setSubmitted(true);
    }
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
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder=""
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold rounded-full text-sm transition-all duration-200 shadow-sm mb-4"
            >
              Submit
            </button>
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
  );
}