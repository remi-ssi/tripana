import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Tripana Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to your dashboard!</h2>
        <p className="text-gray-600">This is your main dashboard page. Add your content here.</p>
      </main>
    </div>
  )
}
