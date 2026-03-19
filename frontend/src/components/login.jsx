import { useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
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

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md px-10 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Log in Account</h1>
          <p className="text-gray-500 text-sm">Log in to continue planning your trips</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-100 rounded-full px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder=""
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-full px-4 py-3 pr-12 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder=""
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {/* Forgot Password */}
            <div className="text-right mt-2">
              <a
                href="/forgot-password"
                className="text-sm italic text-gray-500 underline underline-offset-2 hover:text-blue-600 transition"
              >
                Forgot Password
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-full py-3 text-sm tracking-wide transition-all duration-150"
            >
              Log In
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <a href="/signup" className="text-gray-800 underline underline-offset-2 hover:text-blue-600 transition">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}