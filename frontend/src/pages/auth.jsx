import { useState } from 'react'
import Login from '../components/login'
import Signup from '../components/signup'
import logo from '../assets/logo.png'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="flex gap-12 w-full max-w-5xl items-center">
        {/* Left Side - Form */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg px-10 py-10">
          {isLogin ? (
            <LoginWrapper isLogin={isLogin} setIsLogin={setIsLogin} />
          ) : (
            <SignupWrapper isLogin={isLogin} setIsLogin={setIsLogin} />
          )}
        </div>

        {/* Right Side - Logo */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <img 
            src={logo}
            alt="Tripana Logo" 
            className="w-full max-w-sm h-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}

// Wrapper components to handle navigation
function LoginWrapper({ isLogin, setIsLogin }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Log in Account</h1>
        <p className="text-gray-500 text-sm">Log in to continue planning your trips</p>
      </div>
      <Login />
      <div className="text-center text-sm text-gray-500 mt-5">
        Don't have an account?{" "}
        <button
          onClick={() => setIsLogin(false)}
          className="font-medium text-gray-800 underline underline-offset-2 hover:text-blue-600 transition"
        >
          Create Account
        </button>
      </div>
    </>
  )
}

function SignupWrapper({ isLogin, setIsLogin }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm">Sign up to start planning your trips</p>
      </div>
      <Signup />
      <div className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <button
          onClick={() => setIsLogin(true)}
          className="font-medium text-gray-800 underline underline-offset-2 hover:text-blue-600 transition"
        >
          Log In
        </button>
      </div>
    </>
  )
}
