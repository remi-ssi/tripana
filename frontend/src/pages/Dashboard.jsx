import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import Navbar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import EarthLoader from '../components/loadingIndicator'
import { CalendarDays, PlusCircle } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading, refreshUser, clearUser } = useAuth()

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  if (loading){
    return <EarthLoader />
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogout={handleLogout} />
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-100 shadow rounded-xl p-5 flex items-center justify-between">
          {/* Left: text content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.first_name}!</h2>
            <p className="text-gray-700 text-m mt-0.5">Welcome back to your travel planning hub.</p>
            <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
              <CalendarDays size={16} />
              <span>{today}</span>
            </div>
          </div>

          {/* Right: button */}
          <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap">
            <PlusCircle size={18} className="text-white-500" /> Plan a Trip
          </button>
        </div>
      </main>
    </div>
  )
}
