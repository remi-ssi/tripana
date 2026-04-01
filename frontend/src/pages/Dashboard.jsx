import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import Navbar from '../components/dashboardNav'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to your dashboard!</h2>
        <p className="text-gray-600">This is your main dashboard page. Add your content here.</p>
      </main>
    </div>
  )
}
