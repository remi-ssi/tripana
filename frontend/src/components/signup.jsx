import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateRegisterForm } from "../validators/authValidators";
import { authService } from "../api/authService";
import { encryptObject } from "../utils/crypto";
import OTPModal from "./otpModal";
import EarthLoader from "./loadingIndicator";
import { useAuth } from "../hooks/AuthProfile";

export default function SignUp({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => {
      if (!prev.submit && !prev[e.target.name]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.submit;
      delete nextErrors[e.target.name];
      return nextErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateRegisterForm(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.confirmPassword
    );
    
    setErrors(formErrors || {});
    
    // If no errors, submit form
    if (!formErrors) {
      setIsLoading(true);
      try {
        // Encrypt sensitive data before sending
        console.log('[Signup] Original data before encryption:', {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: '***',
        });
        
        const encryptedData = await encryptObject({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        
        console.log('[Signup] Encrypted data to be sent:', {
          first_name: encryptedData.first_name ? encryptedData.first_name.substring(0, 50) + '...' : null,
          last_name: encryptedData.last_name ? encryptedData.last_name.substring(0, 50) + '...' : null,
          email: encryptedData.email ? encryptedData.email.substring(0, 50) + '...' : null,
          password: encryptedData.password ? encryptedData.password.substring(0, 50) + '...' : null,
        });
        
        // Call register endpoint with encrypted data
        await authService.register({
          first_name: encryptedData.first_name,
          last_name: encryptedData.last_name,
          email: encryptedData.email,
          password: encryptedData.password,
        });
        
        // Show OTP modal
        setOtpEmail(formData.email);
        setRegisteredPassword(formData.password);
        setShowOTPModal(true);
      } catch (error) {
        setErrors({ submit: error.message || "Registration failed. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle OTP verification after registration
  const handleVerifyOTP = async (otp) => {
    try {
      // Encrypt sensitive data before sending
      const encryptedData = await encryptObject({
        email: otpEmail,
        code: otp,
        password: registeredPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      
      // Call verify-otp endpoint with encrypted data
      const authResult = await authService.verifyOTP(
        encryptedData.email,
        encryptedData.code,
        encryptedData.password,
        encryptedData.first_name,
        encryptedData.last_name
      );
      setAuthSession(authResult?.user ?? null, false);
      // On success, close modal and redirect to dashboard
      setShowOTPModal(false);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      navigate("/user-preference", { replace: true });
    } catch (error) {
      throw new Error(error.message || "OTP verification failed");
    }
  };

  // Handle resending OTP
  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(otpEmail);
    } catch (error) {
      throw new Error(error.message || "Failed to resend OTP");
    }
  };

  // Handle closing OTP modal
  const handleCloseOTPModal = async () => {
    if (otpEmail) {
      await authService.cancelOTP(otpEmail);
    }
    setShowOTPModal(false);
  };

  // Eye icon component for password visibility toggle
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
    <>
      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8">
            <EarthLoader />
          </div>
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md mx-auto px-10 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Register An Account</h1>
          <p className="text-gray-500 text-sm">Start planning your perfect trip today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1 ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-full px-4 py-3 text-sm outline-none focus:ring-2 transition ${
                  errors.firstName
                    ? 'bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400'
                    : 'bg-slate-100 text-gray-800 focus:ring-blue-400'
                }`}
                placeholder="Juan"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1 ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-full px-4 py-3 text-sm outline-none focus:ring-2 transition ${
                  errors.lastName
                    ? 'bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400'
                    : 'bg-slate-100 text-gray-800 focus:ring-blue-400'
                }`}
                placeholder="Dela Cruz"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-full px-4 py-3 text-sm outline-none focus:ring-2 transition ${
                errors.email
                  ? 'bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400'
                  : 'bg-slate-100 text-gray-800 focus:ring-blue-400'
              }`}
              placeholder="example@gmail.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Submit error */}
          {errors.submit && <p className="text-red-500 text-sm text-center mt-2">{errors.submit}</p>}

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-full px-4 py-3 pr-12 text-sm outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400'
                    : 'bg-slate-100 text-gray-800 focus:ring-blue-400'
                }`}
                placeholder="Enter your Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-full px-4 py-3 pr-12 text-sm outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? 'bg-red-100 text-red-800 border-2 border-red-500 focus:ring-red-400'
                    : 'bg-slate-100 text-gray-800 focus:ring-blue-400'
                }`}
                placeholder="Confirm your Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold rounded-full py-3 text-sm tracking-wide transition-all duration-150"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              if (onSwitchToLogin) {
                onSwitchToLogin();
              }
            }}
            className="text-gray-800 underline underline-offset-2 hover:text-blue-600 transition"
          >
            Log In
          </button>
        </p>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        email={otpEmail}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </>
  );
}