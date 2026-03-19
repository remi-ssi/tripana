import { useState } from 'react'
import Login from '../components/login'
import Signup from '../components/signup'
import logo from '../assets/fullLogo.png'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full max-w-5xl items-center">
        {/* Top on mobile, right side on large screens */}
        <div className="w-full lg:flex-1 flex items-center justify-center order-1 lg:order-2">
          <img
            src={logo}
            alt="Tripana Logo"
            className="w-48 sm:w-56 md:w-64 lg:w-full lg:max-w-sm h-auto object-contain"
          />
        </div>

        {/* Left Side - Form */}
        <div className="w-full lg:flex-1 order-2 lg:order-1">
          {isLogin ? (
            <Login onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <Signup onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}
