import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import Navbar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import EarthLoader from '../components/loadingIndicator'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  if (loading){
    return <EarthLoader />
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogout={handleLogout} />
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray shadow rounded-lg p-5">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.firstname}!</h2>
        <p className="text-gray-600">This is your main dashboard page. Add your content here.</p>
        </div>
      </main>
    </div>
  )
}
