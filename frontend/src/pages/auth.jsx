import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Login from '../components/login'
import Signup from '../components/signup'
import logo from '../assets/fullLogo.png'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'signup')

  useEffect(() => {
    setIsLogin(mode !== 'signup')
  }, [mode])

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Back to Homepage */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <span>←</span>
        <span className="text-sm font-medium">Back to Homepage</span>
      </button>

      <div className="flex-1 flex items-center justify-center p-4">
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
    </div>
  )
}
